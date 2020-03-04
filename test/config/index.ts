import { ConfigManager } from '@diff./config-manager';
import { LoggerConfig } from '../../src/LoggerConfig';

const config = new ConfigManager<LoggerConfig>();
config.setDevelopmentConfig({
  logger: {
    file: {
      level: 'info'
    },
    console: {
      level: 'info'
    },
    cloudWatch: {
      level: 'info',
      region: 'ap-northeast-2'
    }
  }
});

export { config };
