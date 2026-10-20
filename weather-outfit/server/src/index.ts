import { buildApp } from './app';
import { loadConfig } from './config';

const config = loadConfig();
const app = buildApp({ config, logger: true });

app.listen({ port: config.port, host: '0.0.0.0' }).then(() => {
  if (!config.dataGoKrKey) app.log.warn('DATA_GO_KR_SERVICE_KEY not set — serving demo weather');
});
