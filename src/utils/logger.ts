import Log from 'log4js';
Log.configure({
  appenders: {
    multi: {
      type: 'multiFile',
      base: 'logs',
      property: 'logName',
      maxLogSize: 10485760,
      backups: 5,
      extension: '.log',
      compress: true
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: ['multi', 'console'],
      level: 'info'
    }
  }
});
export function createLogger(name: string) {
  console.log('setlog', name)
  const log = Log.getLogger(name);
  log.addContext('logName', name);
  return log;
}
export default Log;
