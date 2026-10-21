import type { OutfitItem, OutfitRecommendation, OutfitSlot } from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

/**
 * 추천 옷을 겉옷·상의·하의·신발·챙길 것으로 나눠, 항목마다 모양(아이콘)과 이름을 보여준다.
 * 아이콘 배경색은 두께(얇음→밝음, 두꺼움→짙음)를 따른다.
 */
const SLOT_LABEL: Record<OutfitSlot, string> = { outer: '겉옷', top: '상의', bottom: '하의', shoes: '신발', accessory: '챙길 것' };
const SLOTS: OutfitSlot[] = ['outer', 'top', 'bottom', 'shoes', 'accessory'];

const WARMTH_BG = ['', '#FFF6DF', '#EAF2FF', '#DCE7F7', '#C7D5EA', '#AEBFDA'];

/** 카테고리 키 → 아이콘. 구체적인 것부터 먼저 검사한다 */
const ICONS: [RegExp, string][] = [
  [/padding|bunting/i, '🧥'],
  [/coat|trench/i, '🧥'],
  [/cardigan|windbreaker|jacket/i, '🧥'],
  [/thermal/i, '🧶'],
  [/knit|sweatshirt/i, '🧶'],
  [/sleeveless/i, '🎽'],
  [/tshirt|longsleeve|bodysuit/i, '👕'],
  [/shorts/i, '🩳'],
  [/leggings/i, '🩲'],
  [/fleece|jeans|cotton/i, '👖'],
  [/sandals/i, '🩴'],
  [/rainBoots/i, '👢'],
  [/snowBoots|winterBoots|boots/i, '🥾'],
  [/sneakers|socks/i, '👟'],
  [/umbrella/i, '☂️'],
  [/sunscreen/i, '🧴'],
  [/mask/i, '😷'],
  [/scarfGloves/i, '🧣'],
  [/beanie/i, '🧢'],
  [/sunhat|acc\.hat/i, '👒'],
  [/cooling/i, '🪭'],
];

export function iconFor(item: OutfitItem): string {
  const hit = ICONS.find(([re]) => re.test(item.category));
  if (hit) return hit[1];
  return item.slot === 'outer' ? '🧥' : item.slot === 'top' ? '👕' : item.slot === 'bottom' ? '👖' : item.slot === 'shoes' ? '👟' : '🎒';
}

export function OutfitItems({ rec, compact = false }: { rec: OutfitRecommendation; compact?: boolean }) {
  return (
    <View>
      {SLOTS.map((slot) => {
        const items = rec.items.filter((i) => i.slot === slot);
        if (!items.length) return null;
        return (
          <View key={slot} style={[s.row, compact && s.rowCompact]}>
            <Text style={s.slot}>{SLOT_LABEL[slot]}</Text>
            <View style={s.items}>
              {items.map((i) => (
                <View key={`${i.category}-${i.name}`} style={s.item}>
                  <View style={[s.iconBox, { backgroundColor: WARMTH_BG[i.warmth] }]}>
                    <Text style={s.icon}>{iconFor(i)}</Text>
                  </View>
                  <Text style={s.name} numberOfLines={2}>{i.name.replace('챙겨갈 겉옷: ', '')}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  rowCompact: { paddingVertical: 6 },
  slot: { width: 52, fontSize: 12, fontWeight: '700', color: colors.faint, paddingTop: 10 },
  items: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F8FB', borderRadius: 12, paddingRight: 10, maxWidth: '100%' },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  icon: { fontSize: 20 },
  name: { fontSize: 13, color: colors.text, fontWeight: '600', flexShrink: 1, maxWidth: 170, paddingVertical: 6 },
});
