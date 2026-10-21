/**
 * 가족 구성원별 옷차림 추천 엔진.
 *
 * 1) 기상청 산출식으로 체감온도를 구하고
 * 2) 나이·추위/더위 민감도·건강 상태·활동량·체온으로 "개인 체감온도"를 보정한 뒤
 * 3) 기온별 옷차림 단계표에 대응시키고
 * 4) 강수·자외선·미세먼지·바람·일교차에 따른 소품과 주의사항을 덧붙인다.
 *
 * 규칙 기반이라 결과의 근거(reasons)를 사용자에게 그대로 보여줄 수 있다.
 */
import { feelsLike } from './feelsLike';
import { AIR_GRADE_LABEL, airGrade, airGradeRank, UV_GRADE_LABEL, uvGrade } from './grades';
import type {
  CareAlert,
  FamilyMember,
  OutfitItem,
  OutfitRecommendation,
  UserProfile,
  WeatherSnapshot,
} from './types';

export type AgeGroup = 'infant' | 'toddler' | 'child' | 'teen' | 'adult' | 'senior' | 'elder';

export function ageOf(birthYear: number, now: Date = new Date()): number {
  return now.getFullYear() - birthYear;
}

export function ageGroup(age: number): AgeGroup {
  if (age < 2) return 'infant';
  if (age < 7) return 'toddler';
  if (age < 13) return 'child';
  if (age < 19) return 'teen';
  if (age < 65) return 'adult';
  if (age < 75) return 'senior';
  return 'elder';
}

/** 여러 보정이 겹쳐도 극단적인 추천이 나오지 않도록 하는 상한 */
const MAX_COLDER_DELTA = 6;
const MAX_WARMER_DELTA = 5;

interface Adjustment {
  delta: number;
  reason: string;
}

const AGE_ADJUST: Record<AgeGroup, Adjustment | null> = {
  infant: { delta: -3, reason: '영아는 체온 조절이 미숙해 어른보다 한 겹 더 입혀요' },
  toddler: { delta: -1.5, reason: '유아는 어른보다 조금 더 따뜻하게 입혀요' },
  child: null,
  teen: null,
  adult: null,
  senior: { delta: -2, reason: '65세 이상은 체감 추위가 커서 한 단계 따뜻하게' },
  elder: { delta: -3, reason: '75세 이상은 체온 유지가 어려워 두 단계 따뜻하게' },
};

export function bmi(heightCm?: number, weightKg?: number): number | null {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

/**
 * 체형 보정: 체지방·근육량이 적을수록 열을 빨리 잃어 더 춥게 느낀다.
 * 아동은 BMI 기준이 달라 성인(19세 이상)에게만 BMI를 적용하고, 그 외에는 선택한 체형을 쓴다.
 */
function bodyAdjustment(m: FamilyMember, now: Date): Adjustment | null {
  const index = ageOf(m.birthYear, now) >= 19 ? bmi(m.heightCm, m.weightKg) : null;
  if (index != null) {
    if (index < 18.5) return { delta: -1, reason: `BMI ${index} — 마른 체형은 열을 빨리 잃어 조금 더 따뜻하게` };
    if (index >= 25) return { delta: 1, reason: `BMI ${index} — 열이 잘 빠지지 않아 조금 가볍게` };
    return null;
  }
  switch (m.bodyType) {
    case 'slim':
      return { delta: -1, reason: '마른 체형이라 조금 더 따뜻하게' };
    case 'heavy':
      return { delta: 1, reason: '체격이 있어 조금 가볍게' };
    case 'muscular':
      return { delta: 0.5, reason: '근육량이 많아 열이 잘 나요' };
    default:
      return null;
  }
}

/** 로그인 사용자 프로필 → 추천 엔진 입력 */
export function memberFromProfile(id: string, name: string, p: UserProfile): FamilyMember {
  return {
    id,
    name,
    relation: 'me',
    birthYear: p.birthYear,
    sensitivity: p.sensitivity,
    activity: p.activity,
    conditions: [],
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    bodyType: p.bodyType,
    emoji: p.sex === 'male' ? '🧑' : p.sex === 'female' ? '👩' : '🙂',
  };
}

/** 개인 체감온도 = 체감온도 + Σ보정값 (음수일수록 더 춥게 느낌) */
export function personalAdjustments(m: FamilyMember, baseFeels: number, now: Date = new Date()): Adjustment[] {
  const adj: Adjustment[] = [];
  const ag = AGE_ADJUST[ageGroup(ageOf(m.birthYear, now))];
  if (ag) adj.push(ag);

  if (m.sensitivity !== 0) {
    const d = m.sensitivity * 2;
    adj.push({
      delta: d,
      reason: d < 0 ? `추위를 잘 타서 ${-d}℃ 더 춥게 계산했어요` : `더위를 잘 타서 ${d}℃ 더 덥게 계산했어요`,
    });
  }

  const body = bodyAdjustment(m, now);
  if (body) adj.push(body);

  if (m.conditions.includes('recovering')) adj.push({ delta: -2, reason: '회복 중이라 보온을 우선했어요' });
  if (m.conditions.includes('pregnant')) adj.push({ delta: 1.5, reason: '임신 중에는 체온이 높아 덜 덥게 입어요' });
  if (m.conditions.includes('coldHands') && baseFeels < 15)
    adj.push({ delta: -1, reason: '수족냉증이 있어 조금 더 따뜻하게' });

  if (m.bodyTempC != null && m.bodyTempC >= 37.5)
    adj.push({ delta: -2, reason: `체온 ${m.bodyTempC}℃ — 미열이 있어 보온을 우선했어요` });

  if (m.activity === 'outdoor' && baseFeels < 15)
    adj.push({ delta: -1.5, reason: '야외에 오래 있어 바깥 기온 영향을 더 받아요' });
  if (m.activity === 'indoor') adj.push({ delta: 1, reason: '주로 실내에 있어 이동 시간 기준으로 맞췄어요' });

  return adj;
}

interface Tier {
  min: number; // 이 온도 이상
  thickness: OutfitRecommendation['thickness'];
  headline: string;
  outer: OutfitItem | null;
  top: OutfitItem;
  bottom: OutfitItem;
  shoes: OutfitItem;
}

const item = (slot: OutfitItem['slot'], name: string, category: string, warmth: OutfitItem['warmth']): OutfitItem => ({
  slot,
  name,
  category,
  warmth,
});

/** 기온별 옷차림 단계표 (국내에서 널리 쓰이는 8단계 기준) */
const TIERS: Tier[] = [
  {
    min: 28,
    thickness: 1,
    headline: '무더운 날, 최대한 시원하게',
    outer: null,
    top: item('top', '민소매·린넨 반팔', 'top.sleeveless', 1),
    bottom: item('bottom', '반바지·린넨 팬츠', 'bottom.shorts', 1),
    shoes: item('shoes', '샌들', 'shoes.sandals', 1),
  },
  {
    min: 23,
    thickness: 1,
    headline: '반팔이 딱 좋은 날',
    outer: null,
    top: item('top', '반팔 티셔츠·얇은 셔츠', 'top.tshirt', 1),
    bottom: item('bottom', '면바지·반바지', 'bottom.cotton', 1),
    shoes: item('shoes', '운동화·스니커즈', 'shoes.sneakers', 2),
  },
  {
    min: 20,
    thickness: 2,
    headline: '얇은 긴팔로 가볍게',
    outer: null,
    top: item('top', '얇은 긴팔·블라우스', 'top.longsleeve', 2),
    bottom: item('bottom', '면바지·슬랙스', 'bottom.cotton', 2),
    shoes: item('shoes', '운동화·스니커즈', 'shoes.sneakers', 2),
  },
  {
    min: 17,
    thickness: 2,
    headline: '가디건 하나 걸치기 좋은 날',
    outer: item('outer', '얇은 가디건', 'outer.cardigan', 2),
    top: item('top', '맨투맨·얇은 니트', 'top.sweatshirt', 2),
    bottom: item('bottom', '청바지·면바지', 'bottom.jeans', 2),
    shoes: item('shoes', '운동화', 'shoes.sneakers', 2),
  },
  {
    min: 12,
    thickness: 3,
    headline: '자켓이 필요한 선선한 날',
    outer: item('outer', '자켓·야상·바람막이', 'outer.jacket', 3),
    top: item('top', '맨투맨·니트', 'top.knit', 3),
    bottom: item('bottom', '청바지', 'bottom.jeans', 3),
    shoes: item('shoes', '운동화·로퍼', 'shoes.sneakers', 2),
  },
  {
    min: 9,
    thickness: 3,
    headline: '트렌치코트가 어울리는 쌀쌀한 날',
    outer: item('outer', '트렌치코트·점퍼', 'outer.trench', 3),
    top: item('top', '니트·긴팔 + 얇은 이너', 'top.knit', 3),
    bottom: item('bottom', '청바지·두께감 있는 바지', 'bottom.jeans', 3),
    shoes: item('shoes', '운동화·앵클부츠', 'shoes.boots', 3),
  },
  {
    min: 5,
    thickness: 4,
    headline: '코트와 히트텍을 챙기세요',
    outer: item('outer', '울 코트·가죽자켓·경량패딩', 'outer.coat', 4),
    top: item('top', '히트텍 + 니트', 'top.thermal', 4),
    bottom: item('bottom', '기모 바지', 'bottom.fleece', 4),
    shoes: item('shoes', '부츠·운동화', 'shoes.boots', 3),
  },
  {
    min: -Infinity,
    thickness: 5,
    headline: '패딩 필수! 아주 추운 날',
    outer: item('outer', '롱패딩·두꺼운 코트', 'outer.padding', 5),
    top: item('top', '히트텍 + 두꺼운 니트', 'top.thermal', 5),
    bottom: item('bottom', '기모 바지·내복', 'bottom.fleece', 5),
    shoes: item('shoes', '방한 부츠', 'shoes.winterBoots', 5),
  },
];

export function tierFor(temp: number): Tier {
  return TIERS.find((t) => temp >= t.min)!;
}

/** 아이 연령대에 맞게 아이템 이름을 바꾼다 */
function adaptForAge(items: OutfitItem[], group: AgeGroup, thickness: number): OutfitItem[] {
  if (group === 'infant') {
    return items.map((it) => {
      if (it.slot === 'outer' && thickness >= 4) return { ...it, name: '방한 우주복·겉싸개', category: 'kids.bunting' };
      if (it.slot === 'top') return { ...it, name: thickness >= 3 ? '내복 + 긴팔 바디슈트' : '면 바디슈트', category: 'kids.bodysuit' };
      if (it.slot === 'bottom') return { ...it, name: thickness >= 3 ? '도톰한 레깅스' : '면 레깅스', category: 'kids.leggings' };
      if (it.slot === 'shoes') return { ...it, name: thickness >= 4 ? '털 덧신' : '양말·걸음마 신발', category: 'kids.socks' };
      return it;
    });
  }
  if (group === 'toddler' || group === 'child') {
    return items.map((it) => {
      if (it.slot === 'top' && thickness >= 4) return { ...it, name: '내복 + 기모 맨투맨', category: 'kids.thermal' };
      if (it.slot === 'top' && thickness <= 1) return { ...it, name: '땀 흡수 잘되는 면 반팔', category: 'kids.tshirt' };
      if (it.slot === 'shoes' && thickness <= 1) return { ...it, name: '아쿠아슈즈·샌들', category: 'kids.sandals' };
      return { ...it, category: it.category.replace(/^(\w+)\./, 'kids.$1.') };
    });
  }
  return items;
}

const has = (items: OutfitItem[], category: string) => items.some((i) => i.category.endsWith(category));

export interface RecommendOptions {
  now?: Date;
}

export function recommendOutfit(
  weather: WeatherSnapshot,
  member: FamilyMember,
  opts: RecommendOptions = {},
): OutfitRecommendation {
  const now = opts.now ?? new Date();
  const age = ageOf(member.birthYear, now);
  const group = ageGroup(age);
  const isKid = group === 'infant' || group === 'toddler' || group === 'child';
  const sensitiveBody =
    group === 'infant' || group === 'senior' || group === 'elder' || member.conditions.includes('cardiovascular') ||
    member.conditions.includes('pregnant');

  const base = feelsLike(weather.temp, weather.humidity, weather.windSpeed);
  const adjustments = personalAdjustments(member, base, now);
  const rawDelta = adjustments.reduce((s, a) => s + a.delta, 0);
  const delta = Math.min(MAX_WARMER_DELTA, Math.max(-MAX_COLDER_DELTA, rawDelta));
  const personal = Math.round((base + delta) * 10) / 10;

  const reasons: string[] = [
    `현재 ${weather.temp}℃, 체감온도 ${base}℃ (습도 ${weather.humidity}%, 바람 ${weather.windSpeed}m/s)`,
    ...adjustments.map((a) => a.reason),
    ...(delta !== rawDelta ? [`보정값이 과하지 않도록 ${delta > 0 ? '+' : ''}${delta}℃까지만 반영했어요`] : []),
    `→ ${member.name}님 개인 체감온도 ${personal}℃ 기준으로 추천했어요`,
  ];

  const tier = tierFor(personal);
  let items: OutfitItem[] = [tier.outer, tier.top, tier.bottom, tier.shoes].filter((x): x is OutfitItem => x !== null);
  items = adaptForAge(items, group, tier.thickness);
  const alerts: CareAlert[] = [];
  const accessories: OutfitItem[] = [];

  // 일교차: 아침·저녁이 추우면 겉옷을 챙기도록
  const range = weather.tempMax - weather.tempMin;
  if (range >= 10) {
    alerts.push({ level: 'caution', icon: '🌡️', message: `일교차 ${Math.round(range)}℃ — 아침·저녁엔 쌀쌀해요` });
    if (!items.some((i) => i.slot === 'outer')) {
      const morning = tierFor(personal - (weather.temp - weather.tempMin));
      if (morning.outer) items.unshift({ ...morning.outer, name: `챙겨갈 겉옷: ${morning.outer.name}` });
    }
  }

  // 강수
  const wet = weather.precipType !== 'none' || weather.precipProbMax >= 60;
  if (wet) {
    const snowy = weather.precipType === 'snow' || weather.precipType === 'rainSnow';
    accessories.push(item('accessory', isKid ? '아이용 우산·우비' : '장우산', 'acc.umbrella', 1));
    items = items.map((i) =>
      i.slot === 'shoes'
        ? snowy
          ? { ...i, name: '미끄럼 방지 방수 부츠', category: 'shoes.snowBoots' }
          : { ...i, name: isKid ? '장화' : '방수 신발·레인부츠', category: 'shoes.rainBoots' }
        : i,
    );
    alerts.push({
      level: 'caution',
      icon: snowy ? '❄️' : '☔',
      message: snowy ? '눈 소식 — 미끄러운 길 조심하세요' : `강수확률 ${weather.precipProbMax}% — 우산 꼭 챙기세요`,
    });
  } else if (weather.precipProbMax >= 30) {
    accessories.push(item('accessory', '접이식 우산', 'acc.foldingUmbrella', 1));
    alerts.push({ level: 'info', icon: '🌂', message: `강수확률 ${weather.precipProbMax}% — 작은 우산 하나` });
  }

  // 자외선
  if (weather.uvIndex != null && weather.uvIndex >= 3) {
    const g = uvGrade(weather.uvIndex);
    if (group === 'infant') {
      accessories.push(item('accessory', '챙 넓은 모자·유모차 햇빛가리개', 'kids.sunhat', 1));
      alerts.push({
        level: weather.uvIndex >= 6 ? 'warning' : 'caution',
        icon: '🧢',
        message: `자외선 ${UV_GRADE_LABEL[g]} — 6개월 미만은 선크림 대신 그늘·모자로 가려주세요`,
      });
    } else {
      accessories.push(item('accessory', '선크림 SPF30+', 'beauty.sunscreen', 1));
      if (weather.uvIndex >= 6) {
        accessories.push(item('accessory', isKid ? '챙 넓은 모자' : '모자·선글라스', 'acc.hat', 1));
        alerts.push({ level: weather.uvIndex >= 8 ? 'warning' : 'caution', icon: '🕶️', message: `자외선 ${UV_GRADE_LABEL[g]} (${weather.uvIndex}) — 한낮 외출 주의` });
      } else {
        alerts.push({ level: 'info', icon: '🧴', message: `자외선 ${UV_GRADE_LABEL[g]} — 선크림 바르기` });
      }
    }
  }

  // 미세먼지: 호흡기 질환·노약자(민감군)는 한 단계 낮은 기준부터 대응
  const air = airGrade(weather.pm10, weather.pm25);
  if (air) {
    const actual = airGradeRank(air);
    const sensitiveGroup = member.conditions.includes('respiratory') || sensitiveBody;
    const rank = actual + (sensitiveGroup ? 1 : 0);
    if (rank >= 2) {
      const grade = actual < 2 ? `${AIR_GRADE_LABEL[air]}(민감군 주의)` : AIR_GRADE_LABEL[air];
      // 실제 '나쁨' 이상이면서 민감군이거나, '매우나쁨'이면 경고
      const level: CareAlert['level'] = actual >= 2 && rank >= 3 ? 'warning' : 'caution';
      if (group === 'infant') {
        alerts.push({ level, icon: '😷', message: `미세먼지 ${grade} — 24개월 미만은 마스크 대신 바깥 활동 시간을 줄여주세요` });
      } else {
        accessories.push(item('accessory', isKid ? '어린이용 KF80 마스크' : 'KF94 마스크', 'health.mask', 1));
        alerts.push({
          level,
          icon: '😷',
          message: `미세먼지 ${grade} — 마스크를 권해요${member.conditions.includes('respiratory') ? ', 흡입기도 챙기세요' : ''}`,
        });
      }
      if (member.conditions.includes('atopic'))
        alerts.push({ level: 'info', icon: '🧼', message: '귀가 후 바로 세안·보습해주세요' });
    }
  }

  // 바람
  if (weather.windSpeed >= 9) {
    if (!has(items, 'jacket') && tier.thickness <= 3)
      accessories.push(item('accessory', '바람막이', 'outer.windbreaker', 2));
    alerts.push({
      level: weather.windSpeed >= 14 ? 'warning' : 'caution',
      icon: '💨',
      message: `바람 ${weather.windSpeed}m/s — 체감온도가 더 낮아요`,
    });
  }

  // 방한 소품
  if (personal < 5 || (personal < 10 && member.conditions.includes('coldHands'))) {
    accessories.push(item('accessory', '목도리·장갑', 'acc.scarfGloves', 4));
    if (personal < -5 || group === 'infant' || group === 'elder')
      accessories.push(item('accessory', '털모자·귀마개', 'acc.beanie', 4));
  }

  // 폭염 · 한파
  if (base >= 33 || (base >= 31 && sensitiveBody)) {
    alerts.push({ level: 'warning', icon: '🥵', message: '폭염 — 낮 12~17시 야외활동을 피하고 물을 자주 드세요' });
    accessories.push(item('accessory', '휴대용 선풍기·쿨토시', 'acc.cooling', 1));
  }
  if (base <= -12 || (base <= -5 && sensitiveBody)) {
    alerts.push({
      level: 'warning',
      icon: '🥶',
      message: member.conditions.includes('cardiovascular')
        ? '한파 — 이른 아침 외출은 피하고 혈압 변화에 주의하세요'
        : '한파 — 노출 부위를 최소화하세요',
    });
  }

  // 피부·체온
  if (member.conditions.includes('atopic')) {
    items = items.map((i) => (i.slot === 'top' ? { ...i, name: `${i.name} (면 소재 권장)` } : i));
    if (weather.humidity < 35) alerts.push({ level: 'info', icon: '💧', message: '건조해요 — 보습제를 챙기세요' });
  }
  if (member.bodyTempC != null && member.bodyTempC >= 38) {
    alerts.unshift({ level: 'warning', icon: '🤒', message: `체온 ${member.bodyTempC}℃ — 오늘은 외출보다 휴식을 권해요` });
  }
  if (isKid && tier.thickness >= 3) {
    reasons.push('아이는 활동량이 많아요 — 벗고 입기 쉬운 겹쳐 입기를 추천해요');
  }

  return {
    memberId: member.id,
    personalFeelsLike: personal,
    thickness: tier.thickness,
    headline: tier.headline,
    items: [...items, ...dedupe(accessories)],
    alerts: alerts.sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level]),
    reasons,
  };
}

const LEVEL_ORDER: Record<CareAlert['level'], number> = { info: 0, caution: 1, warning: 2 };

function dedupe(items: OutfitItem[]): OutfitItem[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.category) ? false : (seen.add(i.category), true)));
}

export function recommendForFamily(weather: WeatherSnapshot, members: FamilyMember[], opts?: RecommendOptions) {
  return members.map((m) => recommendOutfit(weather, m, opts));
}
