import { describe, expect, it } from 'vitest';
import { mockWeather, recommendOutfit, type FamilyMember, type WeatherSnapshot } from '../src';

const now = new Date('2026-10-17T00:00:00Z');
const base: WeatherSnapshot = { ...mockWeather(now), temp: 15, tempMin: 12, tempMax: 19, humidity: 50, windSpeed: 1, uvIndex: 1, pm10: 20, pm25: 10, precipProbMax: 0 };

const adult: FamilyMember = { id: 'me', name: '나', relation: 'me', birthYear: 1988, sensitivity: 0, conditions: [], activity: 'commute' };

const slots = (r: ReturnType<typeof recommendOutfit>) => r.items.map((i) => i.category);

describe('recommendOutfit', () => {
  it('15℃ 성인 → 자켓 단계', () => {
    const r = recommendOutfit(base, adult, { now });
    expect(r.thickness).toBe(3);
    expect(slots(r)).toContain('outer.jacket');
  });

  it('추위를 많이 타는 어머니는 같은 날씨에 더 두껍게', () => {
    const mom = { ...adult, id: 'mom', name: '엄마', birthYear: 1958, sensitivity: -2 as const };
    const r = recommendOutfit(base, mom, { now });
    // 15℃ − 노년(−2) − 추위 많이 탐(−4) = 9℃ → 트렌치코트 단계
    expect(r.personalFeelsLike).toBe(9);
    expect(slots(r)).toContain('outer.trench');
  });

  it('보정이 여러 개 겹쳐도 −6℃까지만', () => {
    const r = recommendOutfit(base, { ...adult, birthYear: 1950, sensitivity: -2, activity: 'outdoor', conditions: ['recovering'] }, { now });
    expect(r.personalFeelsLike).toBe(9);
    expect(r.reasons.some((x) => x.includes('-6℃까지만'))).toBe(true);
  });

  it('주의사항은 심각도 순으로 정렬', () => {
    const r = recommendOutfit({ ...base, temp: 24, tempMin: 11, tempMax: 25, pm25: 90 }, adult, { now });
    expect(r.alerts[0].level).toBe('warning');
  });

  it('더위를 많이 타면 더 얇게', () => {
    const r = recommendOutfit(base, { ...adult, sensitivity: 2 }, { now });
    expect(r.thickness).toBeLessThanOrEqual(2);
  });

  it('영아는 한 겹 더 + 아이 전용 아이템', () => {
    const baby = { ...adult, id: 'b', name: '아기', relation: 'child' as const, birthYear: 2026 };
    const r = recommendOutfit(base, baby, { now });
    expect(r.personalFeelsLike).toBe(12);
    expect(r.items.some((i) => i.category.startsWith('kids.'))).toBe(true);
  });

  it('비 오면 우산 + 방수 신발, 아이는 장화', () => {
    const rainy = { ...base, precipType: 'rain' as const, precipProbMax: 80 };
    expect(slots(recommendOutfit(rainy, adult, { now }))).toEqual(expect.arrayContaining(['acc.umbrella', 'shoes.rainBoots']));
    const kid = { ...adult, birthYear: 2019 };
    expect(recommendOutfit(rainy, kid, { now }).items.find((i) => i.slot === 'shoes')?.name).toBe('장화');
  });

  it('미세먼지 보통이어도 호흡기 질환이면 마스크', () => {
    const dusty = { ...base, pm25: 30 };
    expect(slots(recommendOutfit(dusty, adult, { now }))).not.toContain('health.mask');
    const asthma = { ...adult, conditions: ['respiratory' as const] };
    expect(slots(recommendOutfit(dusty, asthma, { now }))).toContain('health.mask');
  });

  it('미세먼지 나쁨 + 영아는 마스크 대신 외출 자제', () => {
    const r = recommendOutfit({ ...base, pm25: 60 }, { ...adult, birthYear: 2026 }, { now });
    expect(slots(r)).not.toContain('health.mask');
    expect(r.alerts.some((a) => a.message.includes('24개월'))).toBe(true);
    // 보통 등급에서 민감군이라 올라간 경우는 경고(빨강)가 아닌 주의
    const mild = recommendOutfit({ ...base, pm25: 25 }, { ...adult, birthYear: 2026 }, { now });
    expect(mild.alerts.find((a) => a.icon === '😷')).toMatchObject({ level: 'caution' });
    expect(mild.alerts.find((a) => a.icon === '😷')?.message).toContain('민감군');
  });

  it('자외선 높음 → 선크림·모자', () => {
    const r = recommendOutfit({ ...base, uvIndex: 7 }, adult, { now });
    expect(slots(r)).toEqual(expect.arrayContaining(['beauty.sunscreen', 'acc.hat']));
  });

  it('일교차 10℃ 이상이면 겉옷 챙기기', () => {
    const r = recommendOutfit({ ...base, temp: 24, tempMin: 11, tempMax: 25 }, adult, { now });
    expect(r.items[0].slot).toBe('outer');
    expect(r.items[0].name).toMatch(/챙겨갈 겉옷/);
  });

  it('한파 + 영하 → 패딩, 목도리, 경고', () => {
    const r = recommendOutfit({ ...base, temp: -10, tempMin: -14, tempMax: -4, windSpeed: 5 }, adult, { now });
    expect(r.thickness).toBe(5);
    expect(slots(r)).toEqual(expect.arrayContaining(['outer.padding', 'acc.scarfGloves']));
    expect(r.alerts.some((a) => a.level === 'warning')).toBe(true);
  });

  it('고열이면 휴식 권고가 가장 먼저', () => {
    const r = recommendOutfit(base, { ...adult, bodyTempC: 38.2 }, { now });
    expect(r.alerts[0].message).toMatch(/휴식/);
  });

  it('근거 문구에 개인 체감온도가 포함된다', () => {
    const r = recommendOutfit(base, adult, { now });
    expect(r.reasons.at(-1)).toContain(String(r.personalFeelsLike));
  });
});
