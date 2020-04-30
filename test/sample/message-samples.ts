import '../bootstrap';
import { LoggerFactory } from '../../src/LoggerFactory';

// 로거를 통한 콘솔 메세지 capture 시 표시 또는 저장 형식 확인
const factory = new LoggerFactory({
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
});

const logger = factory.create({
  groupDepthedName: ['test'],
  packageName: 'logger-factory'
});
LoggerFactory.captureConsoleMessage(logger);

console.error('일반 메세지');
console.error('추가정보가 전달된 메세지', 'wang', '3565', { error: true, detail: { name: 'wang' } });
console.error({ err: new Error('메세지 대신 에러 오브젝트가 전달된 경우'), errors: [new Error()] }, 'wang');
console.error({ err: new Error('메세지 대신 오브젝트와 추가 파라미터가 전달된 에러'), target: { videoId: 'testVideoId' } }, { rara: 'ra' });
