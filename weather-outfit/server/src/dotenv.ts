import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 서버 폴더의 설정 파일을 읽어 process.env 에 넣는다. 우선순위(먼저 읽은 값이 이김):
 *   1) .env            2) env.local.txt (내 키 — git 에 올라가지 않음)   3) env.txt (저장소에 포함된 기본값)
 * 점으로 시작하는 파일을 만들기 어려운 환경을 위해 txt 파일도 허용한다.
 * 이미 설정된 환경변수는 덮어쓰지 않는다. 읽은 파일 이름들을 돌려준다.
 */
export function loadDotEnv(dir = process.cwd()): string | null {
  const loaded: string[] = [];
  for (const name of ['.env', 'env.local.txt', 'env.txt']) {
    const file = resolve(dir, name);
    if (!existsSync(file)) continue;
    loaded.push(name);
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      // 빈 값(KEY=)은 "설정 안 함"으로 보고, 다음 파일의 값을 쓸 수 있게 둔다
      if (key && value !== '' && process.env[key] === undefined) process.env[key] = value;
    }
  }
  return loaded.length ? loaded.join(', ') : null;
}
