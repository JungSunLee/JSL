import type { OutfitItem, OutfitRecommendation } from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 추천 옷을 실제로 입은 사람 모양. 이미지 없이 도형으로 그린다.
 * - 겉옷 종류에 따라 길이·두께가 달라진다 (패딩은 통통하고 길게, 코트는 길게, 자켓은 중간, 가디건은 앞이 열림)
 * - 반팔이면 팔이 드러나고, 반바지면 다리가 드러난다
 * - 목도리·털모자·마스크·모자는 몸에 직접 그리고, 우산·선크림 같은 소품은 옆에 작은 아이콘으로
 * - 아이(kid)는 머리가 크고 몸이 짧은 비율
 */
export type FigureSize = 'sm' | 'md' | 'lg';

const SKIN = '#F2C9A8';
const HAIR = '#4A3728';

function has(items: OutfitItem[], key: string) {
  return items.some((i) => i.category.includes(key));
}

function pick(items: OutfitItem[], slot: OutfitItem['slot']) {
  return items.find((i) => i.slot === slot);
}

/** 두께에 따른 옷 색 (얇을수록 밝고, 두꺼울수록 짙게) */
const TOP_COLORS = ['#FFFFFF', '#FFF4D6', '#D9E7F7', '#8FA8C8', '#5E7596', '#3E4F6B'];
const OUTER_COLORS = ['', '', '#CFE0F2', '#7C94B5', '#4B6286', '#2B3A55'];
const BOTTOM_COLORS: Record<string, string> = {
  shorts: '#C9B48A',
  cotton: '#B9A98D',
  jeans: '#4D6FA5',
  fleece: '#3C4552',
  leggings: '#6B6F7A',
};

function bottomColor(bottom?: OutfitItem) {
  if (!bottom) return '#8A8F99';
  const key = Object.keys(BOTTOM_COLORS).find((k) => bottom.category.includes(k));
  return key ? BOTTOM_COLORS[key] : '#8A8F99';
}

export function OutfitFigure({ rec, kid = false, size = 'md' }: { rec: OutfitRecommendation; kid?: boolean; size?: FigureSize }) {
  const items = rec.items;
  const outer = pick(items, 'outer');
  const top = pick(items, 'top');
  const bottom = pick(items, 'bottom');
  const shoes = pick(items, 'shoes');

  const scale = size === 'lg' ? 1.25 : size === 'sm' ? 0.7 : 1;
  const W = 112 * scale;
  const H = (kid ? 180 : 200) * scale;
  const u = (n: number) => n * scale; // 기준 단위

  const shortSleeve = !outer && (has(items, 'sleeveless') || has(items, 'tshirt'));
  const shorts = !!bottom && has([bottom], 'shorts');
  const outerKind = !outer
    ? null
    : has([outer], 'padding') || has([outer], 'bunting')
      ? 'padding'
      : has([outer], 'coat') || has([outer], 'trench')
        ? 'coat'
        : has([outer], 'cardigan')
          ? 'cardigan'
          : 'jacket';
  const boots = !!shoes && (has([shoes], 'boots') || has([shoes], 'Boots'));
  const rain = items.some((i) => i.category.toLowerCase().includes('umbrella'));
  const scarf = has(items, 'scarfGloves');
  const beanie = has(items, 'beanie');
  const hat = has(items, 'sunhat') || has(items, 'acc.hat');
  const mask = has(items, 'mask');

  // 비율
  const headR = u(kid ? 22 : 18);
  const headTop = u(10);
  const neckY = headTop + headR * 2 - u(2);
  const torsoW = u(kid ? 50 : 54);
  const torsoH = u(kid ? 52 : 64);
  const torsoX = (W - torsoW) / 2;
  const legH = u(kid ? 44 : 60);
  const legW = u(kid ? 16 : 17);
  const legY = neckY + torsoH - u(4);
  const shoeH = boots ? u(16) : u(9);

  const topColor = TOP_COLORS[Math.min(5, Math.max(1, top?.warmth ?? rec.thickness))];
  const outerColor = outer ? OUTER_COLORS[Math.min(5, Math.max(2, outer.warmth))] : undefined;
  const outerLen = outerKind === 'coat' ? torsoH + u(26) : outerKind === 'padding' ? torsoH + u(14) : torsoH + u(2);
  const outerPad = outerKind === 'padding' ? u(7) : u(3);
  const legColor = bottomColor(bottom);

  const accessories = items
    .filter((i) => i.slot === 'accessory' && !['acc.scarfGloves', 'acc.beanie', 'kids.sunhat', 'acc.hat', 'health.mask'].includes(i.category))
    .map((i) =>
      i.category.toLowerCase().includes('umbrella') ? '☂️' : i.category.includes('sunscreen') ? '🧴' : i.category.includes('cooling') ? '🪭' : i.category.includes('windbreaker') ? '🧥' : '🎒',
    );

  return (
    <View style={{ width: W + u(28), height: H, alignItems: 'flex-start' }} accessibilityLabel="추천 옷차림을 입은 사람 그림">
      <View style={{ width: W, height: H }}>
        {/* 다리 */}
        <View style={[s.abs, { left: W / 2 - legW - u(2), top: legY, width: legW, height: shorts ? legH * 0.45 : legH, borderRadius: u(6), backgroundColor: legColor }]} />
        <View style={[s.abs, { left: W / 2 + u(2), top: legY, width: legW, height: shorts ? legH * 0.45 : legH, borderRadius: u(6), backgroundColor: legColor }]} />
        {shorts ? (
          <>
            <View style={[s.abs, { left: W / 2 - legW - u(2) + u(2), top: legY + legH * 0.45, width: legW - u(4), height: legH * 0.55, borderRadius: u(6), backgroundColor: SKIN }]} />
            <View style={[s.abs, { left: W / 2 + u(2) + u(2), top: legY + legH * 0.45, width: legW - u(4), height: legH * 0.55, borderRadius: u(6), backgroundColor: SKIN }]} />
          </>
        ) : null}
        {/* 신발 */}
        <View style={[s.abs, { left: W / 2 - legW - u(5), top: legY + legH - u(2), width: legW + u(5), height: shoeH, borderRadius: u(5), backgroundColor: boots ? '#4A3B2F' : rain ? '#3F8CFF' : '#2E3440' }]} />
        <View style={[s.abs, { left: W / 2 + u(2), top: legY + legH - u(2), width: legW + u(5), height: shoeH, borderRadius: u(5), backgroundColor: boots ? '#4A3B2F' : rain ? '#3F8CFF' : '#2E3440' }]} />

        {/* 팔 (상의 색 또는 피부) */}
        {[-1, 1].map((d) => (
          <View
            key={d}
            style={[
              s.abs,
              {
                left: d < 0 ? torsoX - u(13) : torsoX + torsoW - u(1),
                top: neckY + u(6),
                width: u(14),
                height: shortSleeve ? torsoH * 0.45 : torsoH * 0.9,
                borderRadius: u(7),
                backgroundColor: outer ? outerColor : topColor,
                borderWidth: outer || topColor === '#FFFFFF' ? StyleSheet.hairlineWidth : 0,
                borderColor: 'rgba(0,0,0,0.12)',
              },
            ]}
          />
        ))}
        {shortSleeve
          ? [-1, 1].map((d) => (
              <View key={`h${d}`} style={[s.abs, { left: d < 0 ? torsoX - u(12) : torsoX + torsoW, top: neckY + u(6) + torsoH * 0.45, width: u(12), height: torsoH * 0.45, borderRadius: u(6), backgroundColor: SKIN }]} />
            ))
          : null}

        {/* 상의 */}
        <View style={[s.abs, { left: torsoX, top: neckY, width: torsoW, height: torsoH, borderRadius: u(12), backgroundColor: topColor, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.15)' }]} />

        {/* 겉옷 */}
        {outer ? (
          <>
            <View
              style={[
                s.abs,
                {
                  left: torsoX - outerPad,
                  top: neckY - u(2),
                  width: torsoW + outerPad * 2,
                  height: outerLen,
                  borderRadius: outerKind === 'padding' ? u(18) : u(12),
                  backgroundColor: outerColor,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: 'rgba(0,0,0,0.18)',
                },
              ]}
            />
            {/* 앞트임(가디건·코트) 또는 패딩 누빔선 */}
            {outerKind === 'cardigan' ? (
              <View style={[s.abs, { left: W / 2 - u(9), top: neckY + u(2), width: u(18), height: outerLen - u(8), backgroundColor: topColor, borderRadius: u(4) }]} />
            ) : outerKind === 'padding' ? (
              [0.3, 0.55, 0.8].map((f) => (
                <View key={f} style={[s.abs, { left: torsoX - outerPad + u(4), top: neckY + outerLen * f, width: torsoW + outerPad * 2 - u(8), height: StyleSheet.hairlineWidth * 2, backgroundColor: 'rgba(0,0,0,0.18)' }]} />
              ))
            ) : (
              <View style={[s.abs, { left: W / 2 - u(1), top: neckY + u(6), width: u(2), height: outerLen - u(14), backgroundColor: 'rgba(0,0,0,0.18)' }]} />
            )}
          </>
        ) : null}

        {/* 목도리 */}
        {scarf ? <View style={[s.abs, { left: torsoX + u(4), top: neckY - u(6), width: torsoW - u(8), height: u(12), borderRadius: u(6), backgroundColor: '#C9473F' }]} /> : null}

        {/* 머리 */}
        <View style={[s.abs, { left: W / 2 - headR, top: headTop, width: headR * 2, height: headR * 2, borderRadius: headR, backgroundColor: SKIN }]} />
        {/* 머리카락 */}
        {!beanie ? <View style={[s.abs, { left: W / 2 - headR, top: headTop, width: headR * 2, height: headR * 0.9, borderTopLeftRadius: headR, borderTopRightRadius: headR, backgroundColor: HAIR }]} /> : null}
        {/* 눈 */}
        <View style={[s.abs, { left: W / 2 - headR * 0.45, top: headTop + headR * 1.05, width: u(3), height: u(3), borderRadius: u(2), backgroundColor: '#2A2A2A' }]} />
        <View style={[s.abs, { left: W / 2 + headR * 0.3, top: headTop + headR * 1.05, width: u(3), height: u(3), borderRadius: u(2), backgroundColor: '#2A2A2A' }]} />
        {/* 마스크 */}
        {mask ? <View style={[s.abs, { left: W / 2 - headR * 0.75, top: headTop + headR * 1.25, width: headR * 1.5, height: headR * 0.65, borderRadius: u(6), backgroundColor: '#F7F7F7', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.2)' }]} /> : null}
        {/* 털모자 / 챙모자 */}
        {beanie ? (
          <>
            <View style={[s.abs, { left: W / 2 - headR - u(1), top: headTop - u(4), width: headR * 2 + u(2), height: headR * 1.1, borderTopLeftRadius: headR, borderTopRightRadius: headR, backgroundColor: '#C9473F' }]} />
            <View style={[s.abs, { left: W / 2 - u(5), top: headTop - u(10), width: u(10), height: u(10), borderRadius: u(5), backgroundColor: '#F3E9DC' }]} />
          </>
        ) : hat ? (
          <>
            <View style={[s.abs, { left: W / 2 - headR - u(10), top: headTop + headR * 0.55, width: headR * 2 + u(20), height: u(6), borderRadius: u(3), backgroundColor: '#E0B96A' }]} />
            <View style={[s.abs, { left: W / 2 - headR * 0.8, top: headTop - u(6), width: headR * 1.6, height: headR * 0.95, borderTopLeftRadius: u(10), borderTopRightRadius: u(10), backgroundColor: '#E0B96A' }]} />
          </>
        ) : null}
      </View>
      {/* 소품 */}
      <View style={[s.abs, { right: 0, top: u(16), alignItems: 'center', gap: u(4) }]}>
        {accessories.slice(0, 4).map((e, i) => (
          <Text key={i} style={{ fontSize: u(18) }}>{e}</Text>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  abs: { position: 'absolute' },
});
