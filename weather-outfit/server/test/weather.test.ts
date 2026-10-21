import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';
import { wgs84ToTm } from '../src/sources/airkorea';

const now = () => new Date('2026-10-16T23:50:00Z'); // 2026-10-17 08:50 KST

const env = (u: (url: string) => unknown) =>
  (async (input: string | URL | Request) => {
    const url = String(input);
    const body = u(url);
    if (body === undefined) return new Response('not found', { status: 404 });
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;

const ok = (items: unknown) => ({ response: { header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' }, body: { items } } });

const fc = (date: string, time: string, category: string, v: string) => ({ baseDate: '20261017', baseTime: '0200', category, fcstDate: date, fcstTime: time, fcstValue: v });

function fakeUpstream(calls: string[]) {
  return env((url) => {
    calls.push(url.split('?')[0]);
    if (url.includes('getUltraSrtNcst'))
      return ok({ item: [
        { baseDate: '20261017', baseTime: '0800', category: 'T1H', obsrValue: '10.5' },
        { baseDate: '20261017', baseTime: '0800', category: 'REH', obsrValue: '70' },
        { baseDate: '20261017', baseTime: '0800', category: 'WSD', obsrValue: '2.0' },
        { baseDate: '20261017', baseTime: '0800', category: 'PTY', obsrValue: '0' },
      ] });
    if (url.includes('getVilageFcst'))
      return ok({ item: [
        fc('20261017', '0900', 'TMP', '12'), fc('20261017', '0900', 'SKY', '3'), fc('20261017', '0900', 'PTY', '0'), fc('20261017', '0900', 'POP', '20'),
        fc('20261017', '1500', 'TMP', '19'), fc('20261017', '1500', 'SKY', '4'), fc('20261017', '1500', 'PTY', '1'), fc('20261017', '1500', 'POP', '70'),
        fc('20261017', '0600', 'TMN', '8.0'), fc('20261017', '1500', 'TMX', '20.0'),
      ] });
    if (url.includes('LivingWthrIdxServiceV5/getUVIdxV5')) return ok({ item: [{ date: '2026101706', h0: '1', h3: '3', h6: '5', h9: '4', h12: '1' }] });
    if (url.includes('getNearbyMsrstnList')) return ok([{ stationName: '중구' }]);
    if (url.includes('getMsrstnAcctoRltmMesureDnsty')) return ok([{ dataTime: '2026-10-17 08:00', pm10Value: '-', pm25Value: '-' }, { dataTime: '2026-10-17 07:00', pm10Value: '45', pm25Value: '28' }]);
    if (url.includes('coord2regioncode')) return { documents: [{ region_type: 'H', code: '1114055000', address_name: '서울 중구 명동', region_1depth_name: '서울특별시', region_2depth_name: '중구', region_3depth_name: '명동' }] };
    return undefined;
  });
}

describe('GET /v1/weather', () => {
  it('서비스키가 없으면 데모 데이터', async () => {
    const app = buildApp({ config: loadConfig({}), now, dbFile: ':memory:' });
    const res = await app.inject('/v1/weather?lat=37.56&lon=126.97');
    expect(res.statusCode).toBe(200);
    expect(res.json().isMock).toBe(true);
  });

  it('한국 밖 좌표는 400', async () => {
    const app = buildApp({ config: loadConfig({}), now, dbFile: ':memory:' });
    expect((await app.inject('/v1/weather?lat=40.7&lon=-74')).statusCode).toBe(400);
  });

  it('기상청 + 자외선 + 에어코리아 + 지역명을 합쳐서 정규화', async () => {
    const calls: string[] = [];
    const app = buildApp({
      config: loadConfig({ DATA_GO_KR_SERVICE_KEY: 'k', KAKAO_REST_API_KEY: 'kk' }),
      fetch: fakeUpstream(calls),
      now,
      dbFile: ':memory:',
    });
    const res = await app.inject('/v1/weather?lat=37.5636&lon=126.9826');
    expect(res.statusCode).toBe(200);
    const w = res.json();
    expect(w).toMatchObject({
      locationName: '중구 명동',
      temp: 10.5,
      tempMin: 8,
      tempMax: 20,
      humidity: 70,
      precipProbMax: 70,
      uvIndex: 5,
      pm10: 45,
      pm25: 28,
    });
    expect(w.sources).toEqual(['기상청 단기예보', '기상청 생활기상지수', '한국환경공단 에어코리아']);

    // 같은 시간대 재요청은 캐시
    const before = calls.length;
    await app.inject('/v1/weather?lat=37.5636&lon=126.9826');
    expect(calls.length).toBe(before);
  });

  it('미세먼지 API 장애여도 날씨는 응답', async () => {
    const calls: string[] = [];
    const base = fakeUpstream(calls);
    const f = (async (input: string | URL | Request, init?: RequestInit) =>
      String(input).includes('B552584') ? new Response('boom', { status: 500 }) : base(input, init)) as typeof fetch;
    const app = buildApp({ config: loadConfig({ DATA_GO_KR_SERVICE_KEY: 'k' }), fetch: f, now, dbFile: ':memory:' });
    const res = await app.inject('/v1/weather?lat=37.56&lon=126.97');
    expect(res.statusCode).toBe(200);
    expect(res.json().pm25).toBeNull();
  });
});

describe('wgs84ToTm', () => {
  it('서울시청 부근은 TM 중부원점 (≈198000, ≈451000)', () => {
    const { tmX, tmY } = wgs84ToTm(37.5665, 126.978);
    expect(tmX).toBeGreaterThan(197000);
    expect(tmX).toBeLessThan(199000);
    expect(tmY).toBeGreaterThan(450000);
    expect(tmY).toBeLessThan(453000);
  });
});

describe('getJson', () => {
  it('시간 초과면 한 번 더 시도한다', async () => {
    const { getJson } = await import('../src/http');
    let calls = 0;
    const f = (async () => {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error('timeout'), { name: 'TimeoutError' });
      return new Response('{"ok":1}', { status: 200 });
    }) as unknown as typeof fetch;
    expect(await getJson(f, 'https://x.test/a')).toEqual({ ok: 1 });
    expect(calls).toBe(2);
  });
});
