/* eslint-disable @typescript-eslint/no-explicit-any */
import winston, { Logger, format } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import path from 'path';
import os from 'os';
import { ConfigManager } from '@diff./config-manager';
import { LoggerOptions } from './LoggerOptions';

export class LoggerFactory {
  private static orgConsoleErrorMethod?: Function;
  private readonly options: LoggerOptions;

  constructor(options?: LoggerOptions) {
    this.options = options || {
      file: {
        level: 'error'
      },
      console: {
        level: 'info'
      },
      cloudWatch: {
        level: 'error',
        region: 'ap-northeast-2'
      }
    };
  }

  public create(args: { packageName?: string; groupName?: string; groupDepthedName?: string[]; streamName?: string; region?: string }): Logger {
    const { groupDepthedName } = args;
    let { packageName, groupName, streamName } = args;

    // 패키지 이름이 지정되지 않은 경우 npm 패키지 명을 추출하여 사용
    if (!packageName) {
      packageName = this.rootPackageName();
    }

    // 스트림 이름이 지정되지 않은 경우 호스트 명을 사용
    if (!streamName) {
      streamName = os.hostname();
    }

    // 계층화된 이름이 있을 경우 폴더이름 형태로 변환하여 groupName 으로 지정
    if (groupDepthedName) {
      groupName = groupDepthedName.join('/');
    }

    if (!groupName) {
      throw new Error('groupName 또는 groupDepthedName 둘중 하나는 반드시 지정되어야 합니다.');
    }
    const cloudwatchGroupName = `/${packageName}/${ConfigManager.env}/${groupName}`;

    const logger = winston.createLogger({
      level: this.options.console.level,
      levels: winston.config.syslog.levels,
      transports: [
        new winston.transports.Console({
          format: format.combine(this.consoleMessageFormat())
        })
      ]
    });

    /**
     * CloudWatch groupname pattern : /{package-name}/{env-name}/{group-name}
     * Ex : /playboard-backend/batch/
     */
    logger.add(
      new WinstonCloudWatch({
        logGroupName: cloudwatchGroupName,
        logStreamName: streamName,
        level: this.options.cloudWatch.level,
        messageFormatter: this.cloudWatchMessageFormat,
        awsRegion: args.region || this.options.cloudWatch.region,
        uploadRate: 15000,
        errorHandler: err => {
          if (LoggerFactory.orgConsoleErrorMethod) LoggerFactory.orgConsoleErrorMethod(err);
          else console.error(err);
        }
      })
    );

    return logger;
  }

  /* 콘솔 메세지 포멧 */
  private consoleMessageFormat() {
    return format.printf(info => {
      const message = info.message as any;
      let dspMessage: string;
      if (message && message.stack) {
        // 메세지 대신 에러 오프젝트(stack이 포함된)가 전달된 경우
        dspMessage = message.stack + '\nerror detail : ' + JSON.stringify(info, undefined, 2);
      } else if (typeof message === 'object') {
        // 에러가 아닌 오브젝트가 전달된 경우
        dspMessage = JSON.stringify(info, undefined, 2);
      } else {
        dspMessage = message;
      }

      // 파라미터로 전달된 추가 정보가 있는 경우
      if (Array.isArray(info.extra) && info.extra.length) {
        dspMessage += '\nextra : ' + JSON.stringify(info.extra, undefined, 2);
      }

      return `[${info.level}] ${dspMessage}`;
    });
  }

  /* CloudWatch 메시지 포멧 */
  private cloudWatchMessageFormat(info: any): string {
    if (info.message && info.message.stack) {
      // 메세지 대신 에러 오프젝트(stack이 포함된)가 전달된 경우
      const stack = (info.message.stack.split('\n') as string[]).map(v => v.trim());
      info.stack = stack;
    }

    // extra 값이 없는 경우 삭제
    if (Array.isArray(info.extra) && !info.extra.length) {
      delete info.extra;
    }

    return JSON.stringify(info);
  }

  private rootPackageName(): string {
    if (!process.env.appRoot) throw new Error('Cannot find appRoot in process.env');

    // eslint-disable-next-line
    const packageInfo = require(path.join(process.env.appRoot, 'package.json'));
    return packageInfo.name;
  }

  public static captureConsoleMessage(logger: Logger) {
    if (this.orgConsoleErrorMethod) {
      throw new Error('Already being captured.');
    }
    this.orgConsoleErrorMethod = console.error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.debug = (message?: any, ...extra: []) => {
      logger.debug(message, { extra });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (message?: any, ...extra: []) => {
      logger.info(message, { extra });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.info = (message?: any, ...extra: []) => {
      logger.info(message, { extra });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (message?: any, ...extra: []) => {
      logger.warning(message, { extra });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (message?: any, ...extra: []) => {
      logger.error(message, { extra });
    };
  }
}
