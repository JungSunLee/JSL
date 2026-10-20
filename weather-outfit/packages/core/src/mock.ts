import type { HourlyForecast, WeatherSnapshot } from './types';

/**
 * 서비스키 없이도 앱을 둘러볼 수 있는 데모 날씨 (선선한 가을 아침, 미세먼지 보통).
 */
export function mockWeather(now: Date = new Date(), locationName = '서울 중구 (데모)'): WeatherSnapshot {
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  const curve = [11, 11, 12, 14, 16, 18, 20, 21, 21, 20, 18, 16, 15, 14, 13, 12, 12, 11, 11, 10, 10, 10, 9, 9];
  const hourly: HourlyForecast[] = curve.map((t, i) => ({
    time: new Date(start.getTime() + i * 3600_000).toISOString(),
    temp: t,
    sky: i > 14 ? 'partly' : 'clear',
    precipType: 'none',
    precipProb: i > 16 ? 30 : 10,
    humidity: 55,
    windSpeed: 2.4,
  }));
  return {
    locationName,
    observedAt: start.toISOString(),
    temp: 12,
    tempMin: 8,
    tempMax: 21,
    humidity: 55,
    windSpeed: 2.4,
    sky: 'clear',
    precipType: 'none',
    precipProbMax: 30,
    uvIndex: 4,
    pm10: 42,
    pm25: 24,
    hourly,
    sources: ['데모 데이터 (기상청·에어코리아 서비스키 설정 시 실제 데이터로 전환)'],
    isMock: true,
  };
}
