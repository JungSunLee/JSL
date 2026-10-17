import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** 로그인 토큰은 기기 보안 저장소(Keychain/Keystore)에, 웹에서는 AsyncStorage에 저장 */
export const secure = {
  async get(key: string) {
    return Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    return Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);
  },
  async remove(key: string) {
    return Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);
  },
};

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setJson(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
