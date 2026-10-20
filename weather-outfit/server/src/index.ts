import { buildApp } from './app';
import { loadConfig } from './config';
import { loadDotEnv } from './dotenv';

const envFile = loadDotEnv();

const config = loadConfig();
const app = buildApp({ config, logger: true });

app.listen({ port: config.port, host: '0.0.0.0' }).then(() => {
  app.log.info(envFile ? `설정 파일 ${envFile} 을 읽었습니다` : '설정 파일(.env 또는 env.txt)이 없어 기본값으로 실행합니다');
  app.log.info(config.dataGoKrKey ? '공공데이터 키 있음 → 실제 날씨' : '공공데이터 키 없음 → 데모 날씨');
});
