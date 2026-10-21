import type { OutfitRecommendation, OutfitSlot } from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';
import { outfitIconFor } from './icons';
import { useTone } from '@/lib/tone';

/**
 * 추천 옷을 겉옷·상의·하의·신발·챙길 것으로 나눠, 항목마다 아이콘과 이름을 보여준다.
 * 아이콘 배경색은 두께(얇음→따뜻한 색, 두꺼움→짙은 파랑)를 따른다.
 */
const SLOT_LABEL: Record<OutfitSlot, string> = { outer: '겉옷', top: '상의', bottom: '하의', shoes: '신발', accessory: '챙길 것' };
const SLOTS: OutfitSlot[] = ['outer', 'top', 'bottom', 'shoes', 'accessory'];

const WARMTH_LIGHT = ['#EEF2F8', '#FFF1D6', '#E6F1FF', '#D5E4F8', '#BFD0EC', '#A3B8DC'];
const WARMTH_ICON_LIGHT = ['#5B6676', '#C97A00', '#2F6FD6', '#2A5FBF', '#1F4A9E', '#173A80'];

export function OutfitItems({ rec, compact = false }: { rec: OutfitRecommendation; compact?: boolean }) {
  const t = useTone();
  return (
    <View>
      {SLOTS.map((slot) => {
        const items = rec.items.filter((i) => i.slot === slot);
        if (!items.length) return null;
        return (
          <View key={slot} style={[s.row, compact && s.rowCompact, { borderTopColor: t.line }]}>
            <Text style={[s.slot, { color: t.faint }]}>{SLOT_LABEL[slot]}</Text>
            <View style={s.items}>
              {items.map((i) => {
                const Icon = outfitIconFor(i);
                const bg = t.dark ? `rgba(255,255,255,${0.12 + i.warmth * 0.05})` : WARMTH_LIGHT[i.warmth];
                const fg = t.dark ? '#FFFFFF' : WARMTH_ICON_LIGHT[i.warmth];
                return (
                  <View key={`${i.category}-${i.name}`} style={[s.item, { backgroundColor: t.chip }]}>
                    <View style={[s.iconBox, { backgroundColor: bg }]}>
                      <Icon size={20} color={fg} weight="duotone" />
                    </View>
                    <Text style={[s.name, { color: t.text }]} numberOfLines={2}>{i.name.replace('챙겨갈 겉옷: ', '')}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  rowCompact: { paddingVertical: 6 },
  slot: { width: 52, fontSize: 12, fontWeight: '700', paddingTop: 10 },
  items: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingRight: 10, maxWidth: '100%' },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  name: { fontSize: 13, fontWeight: '600', flexShrink: 1, maxWidth: 170, paddingVertical: 6 },
});
