import { ConfigData } from '@diff./config-manager';

export type SyslogLevel = 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug';

export interface LoggerConfig extends ConfigData {
  logger: {
    file: {
      level: SyslogLevel;
    };
    console: {
      level: SyslogLevel;
    };
    cloudWatch: {
      level: SyslogLevel;
      region: string;
    };
  };
}
