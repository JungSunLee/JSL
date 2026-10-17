import { describe, expect, it } from 'vitest';
import { dailyRangeBase, latLonToGrid, ultraSrtNcstBase, vilageFcstBase } from '../src';

describe('latLonToGrid', () => {
  it('서울시청 → (60, 127)', () => {
    expect(latLonToGrid(37.5665, 126.978)).toEqual({ nx: 60, ny: 127 });
  });
  it('부산시청 → (98, 76)', () => {
    expect(latLonToGrid(35.1798, 129.075)).toEqual({ nx: 98, ny: 76 });
  });
  it('제주시 → (53, 38)', () => {
    expect(latLonToGrid(33.4996, 126.5312)).toEqual({ nx: 53, ny: 38 });
  });
});

describe('KMA base time', () => {
  // 2026-10-17 08:30 KST == 2026-10-16T23:30Z
  const t = new Date('2026-10-16T23:30:00Z');
  it('초단기실황은 45분 전이면 직전 정시', () => {
    expect(ultraSrtNcstBase(t)).toEqual({ baseDate: '20261017', baseTime: '0700' });
  });
  it('단기예보는 가장 최근 발표(+15분)', () => {
    expect(vilageFcstBase(t)).toEqual({ baseDate: '20261017', baseTime: '0800' });
  });
  it('자정~02:15에는 전날 23시 발표', () => {
    const early = new Date('2026-10-16T16:10:00Z'); // 01:10 KST
    expect(vilageFcstBase(early)).toEqual({ baseDate: '20261016', baseTime: '2300' });
    expect(dailyRangeBase(early)).toEqual({ baseDate: '20261016', baseTime: '2300' });
    expect(dailyRangeBase(t)).toEqual({ baseDate: '20261017', baseTime: '0200' });
  });
  it('월 경계도 처리', () => {
    const t2 = new Date('2026-10-31T15:20:00Z'); // 11/01 00:20 KST
    expect(ultraSrtNcstBase(t2)).toEqual({ baseDate: '20261031', baseTime: '2300' });
  });
});
