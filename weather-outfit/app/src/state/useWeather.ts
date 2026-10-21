import { mockWeather, type WeatherSnapshot } from '@wo/core';
import * as Location from 'expo-location';
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { api } from '@/lib/api';
import { useSettings } from './SettingsContext';

/** 위치 권한이 없거나 못 가져올 때 쓰는 기본 지역 */
export const DEFAULT_LOCATION = { latitude: 37.4386, longitude: 127.1527, name: '성남시 중원구 중앙동' };

/** 자동 새로고침 주기와 "오래됨" 기준 */
const AUTO_REFRESH_MS = 10 * 60_000; // 10분마다
const STALE_MS = 5 * 60_000; // 앱으로 돌아왔을 때 5분 지났으면 다시
const MOVE_METERS = 500; // 500m 이상 움직이면 다시 (동이 바뀔 수 있는 거리)

interface WeatherState {
  weather: WeatherSnapshot | null;
  loading: boolean;
  /** 서버 연결 실패로 데모 데이터를 보여주는 중 */
  offline: boolean;
  usingDefaultLocation: boolean;
  /** 마지막으로 날씨를 받아온 시각 */
  updatedAt: Date | null;
  refresh(): Promise<void>;
}

interface Coords {
  latitude: number;
  longitude: number;
}

/** 두 지점 사이 거리(m) */
function distanceM(a: Coords, b: Coords): number {
  const R = 6371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 기기 안에서 좌표 → "성남시 중원구 중앙동" 같은 이름 (서버에 카카오 키가 없을 때 대신 쓴다) */
async function placeName(coords: Coords): Promise<string | undefined> {
  if (Platform.OS === 'web') return '현재 위치';
  try {
    const [p] = await Location.reverseGeocodeAsync(coords);
    if (!p) return undefined;
    const parts = [p.city ?? p.region, p.district, p.street ?? p.subregion].filter((v, i, arr): v is string => !!v && arr.indexOf(v) === i);
    return parts.length ? parts.join(' ') : undefined;
  } catch {
    return undefined;
  }
}

async function currentCoords(useCurrent: boolean): Promise<{ coords: Coords; fallback: boolean }> {
  if (!useCurrent) return { coords: DEFAULT_LOCATION, fallback: true };
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { coords: DEFAULT_LOCATION, fallback: true };
    // 마지막 위치가 있으면 바로 쓰고(빠름), 없으면 새로 측정. 너무 오래된(10분↑) 마지막 위치는 새로 잰다
    const last = await Location.getLastKnownPositionAsync({ maxAge: AUTO_REFRESH_MS });
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, fallback: false };
  } catch {
    return { coords: DEFAULT_LOCATION, fallback: true };
  }
}

const WeatherContext = createContext<WeatherState | null>(null);

/**
 * 탭·상세 화면이 같은 날씨를 공유하도록 루트에서 한 번만 불러온다.
 * GPS 기준 실시간: 위치가 500m 이상 바뀌면, 10분마다, 앱으로 돌아왔을 때(5분 이상 지났으면) 자동으로 다시 받아온다.
 */
export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [usingDefaultLocation, setDefault] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const { settings, ready: settingsReady } = useSettings();
  const useCurrent = settings.useCurrentLocation;
  const lastCoords = useRef<Coords | null>(null);
  const lastFetch = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);

  const load = useCallback(
    async (coords: Coords, fallback: boolean) => {
      setLoading(true);
      setDefault(fallback);
      try {
        const name = fallback ? DEFAULT_LOCATION.name : await placeName(coords);
        setWeather(await api.weather(coords.latitude, coords.longitude, name));
        setOffline(false);
      } catch {
        setWeather((w) => w ?? mockWeather());
        setOffline(true);
      } finally {
        lastCoords.current = coords;
        lastFetch.current = Date.now();
        setUpdatedAt(new Date());
        setLoading(false);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (inFlight.current) return inFlight.current;
    inFlight.current = (async () => {
      const { coords, fallback } = await currentCoords(useCurrent);
      await load(coords, fallback);
    })().finally(() => {
      inFlight.current = null;
    });
    return inFlight.current;
  }, [useCurrent, load]);

  // 처음 + 위치 설정이 바뀔 때
  useEffect(() => {
    if (settingsReady) void refresh();
  }, [refresh, settingsReady]);

  // 10분마다 자동 새로고침
  useEffect(() => {
    const id = setInterval(() => void refresh(), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // 앱으로 돌아왔을 때 오래됐으면 새로고침
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - lastFetch.current > STALE_MS) void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  // 위치 추적: 500m 이상 움직이면 그 자리 날씨로
  useEffect(() => {
    if (!useCurrent || !settingsReady) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: MOVE_METERS, timeInterval: 60_000 },
          (pos) => {
            const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            if (!lastCoords.current || distanceM(lastCoords.current, c) >= MOVE_METERS) void load(c, false);
          },
        );
      } catch {
        // 웹 등 추적을 지원하지 않는 환경이면 주기 새로고침만 쓴다
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [useCurrent, settingsReady, load]);

  const value = useMemo(
    () => ({ weather, loading, offline, usingDefaultLocation, updatedAt, refresh }),
    [weather, loading, offline, usingDefaultLocation, updatedAt, refresh],
  );
  return createElement(WeatherContext.Provider, { value }, children);
}

export function useWeather(): WeatherState {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}
