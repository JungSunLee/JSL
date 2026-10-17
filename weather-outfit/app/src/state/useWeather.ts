import { mockWeather, type WeatherSnapshot } from '@wo/core';
import * as Location from 'expo-location';
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

const SEOUL = { latitude: 37.5665, longitude: 126.978 };

interface WeatherState {
  weather: WeatherSnapshot | null;
  loading: boolean;
  /** 서버 연결 실패로 데모 데이터를 보여주는 중 */
  offline: boolean;
  usingDefaultLocation: boolean;
  refresh(): Promise<void>;
}

async function currentCoords(): Promise<{ coords: typeof SEOUL; fallback: boolean }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { coords: SEOUL, fallback: true };
    const pos =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, fallback: false };
  } catch {
    return { coords: SEOUL, fallback: true };
  }
}

const WeatherContext = createContext<WeatherState | null>(null);

/** 탭·상세 화면이 같은 날씨를 공유하도록 루트에서 한 번만 불러온다 */
export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [usingDefaultLocation, setDefault] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { coords, fallback } = await currentCoords();
    setDefault(fallback);
    try {
      setWeather(await api.weather(coords.latitude, coords.longitude));
      setOffline(false);
    } catch {
      setWeather(mockWeather());
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ weather, loading, offline, usingDefaultLocation, refresh }),
    [weather, loading, offline, usingDefaultLocation, refresh],
  );
  return createElement(WeatherContext.Provider, { value }, children);
}

export function useWeather(): WeatherState {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}
