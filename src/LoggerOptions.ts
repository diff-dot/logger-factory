export type SyslogLevel = 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug';

export interface LoggerOptions {
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
}
