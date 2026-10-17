import { describe, expect, it } from 'vitest';
import { dailyRange, feelsLike, parseHourly, parseNcst, pm25Grade, airGrade } from '../src';

describe('parse', () => {
  it('초단기실황', () => {
    const r = parseNcst([
      { baseDate: '20261017', baseTime: '0800', category: 'T1H', obsrValue: '12.3' },
      { baseDate: '20261017', baseTime: '0800', category: 'REH', obsrValue: '60' },
      { baseDate: '20261017', baseTime: '0800', category: 'WSD', obsrValue: '3.1' },
      { baseDate: '20261017', baseTime: '0800', category: 'PTY', obsrValue: '5' },
    ]);
    expect(r).toEqual({ temp: 12.3, humidity: 60, windSpeed: 3.1, precipType: 'rain', observedAt: '2026-10-17T08:00:00+09:00' });
  });

  it('단기예보 시간별 + 일 최저/최고', () => {
    const mk = (time: string, category: string, v: string) => ({
      baseDate: '20261017', baseTime: '0200', category, fcstDate: '20261017', fcstTime: time, fcstValue: v,
    });
    const items = [
      mk('0600', 'TMP', '8'), mk('0600', 'SKY', '1'), mk('0600', 'PTY', '0'), mk('0600', 'POP', '0'),
      mk('0600', 'TMN', '7.0'),
      mk('1500', 'TMP', '20'), mk('1500', 'SKY', '4'), mk('1500', 'PTY', '1'), mk('1500', 'POP', '70'),
      mk('1500', 'TMX', '21.0'),
    ];
    const h = parseHourly(items);
    expect(h).toHaveLength(2);
    expect(h[1]).toMatchObject({ temp: 20, sky: 'cloudy', precipType: 'rain', precipProb: 70 });
    expect(dailyRange(items, '20261017')).toEqual({ min: 7, max: 21 });
    expect(dailyRange(items, '20261018')).toBeNull();
  });
});

describe('feelsLike', () => {
  it('바람이 불면 겨울철 체감온도가 낮아진다', () => {
    expect(feelsLike(-5, 50, 5)).toBeLessThan(-10);
  });
  it('바람 약하면 기온 그대로', () => {
    expect(feelsLike(5, 50, 1)).toBe(5);
  });
  it('여름철 고습이면 더 덥게', () => {
    expect(feelsLike(32, 80, 1)).toBeGreaterThan(33);
  });
});

describe('grades', () => {
  it('PM2.5 등급', () => {
    expect(pm25Grade(15)).toBe('good');
    expect(pm25Grade(36)).toBe('bad');
    expect(airGrade(20, 80)).toBe('veryBad');
    expect(airGrade(null, null)).toBeNull();
  });
});
