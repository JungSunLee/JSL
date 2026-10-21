import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getJson, setJson } from '@/lib/storage';

/**
 * 앱 설정 (기기 저장). 알림·위젯·혜택 수신 등은 아직 "설정값만 저장"하는 단계이고,
 * 실제 푸시 발송·위젯은 서버 배포 후 연결한다.
 */
export interface AppSettings {
  /** 아침 옷차림 알림 */
  morningAlert: boolean;
  morningAlertTime: string; // HH:mm
  /** 비·눈 예보 알림 */
  rainAlert: boolean;
  /** 미세먼지 나쁨 알림 */
  dustAlert: boolean;
  /** 혜택·이벤트 소식 받기 (마케팅 수신 동의) */
  promoOptIn: boolean;
  promoOptInAt?: string;
  /** 위치: 현재 위치 사용 여부 (끄면 기본 지역) */
  useCurrentLocation: boolean;
  /** 온도 단위 */
  unit: 'C' | 'F';
}

const KEY = 'settings.v1';

const DEFAULTS: AppSettings = {
  morningAlert: false,
  morningAlertTime: '07:00',
  rainAlert: true,
  dustAlert: true,
  promoOptIn: false,
  useCurrentLocation: true,
  unit: 'C',
};

interface SettingsState {
  ready: boolean;
  settings: AppSettings;
  update(patch: Partial<AppSettings>): Promise<void>;
}

const Ctx = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  useEffect(() => {
    getJson<Partial<AppSettings>>(KEY, {}).then((saved) => {
      setSettings({ ...DEFAULTS, ...saved });
      setReady(true);
    });
  }, []);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.promoOptIn === true && !prev.promoOptIn) next.promoOptInAt = new Date().toISOString();
      void setJson(KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ready, settings, update }), [ready, settings, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
