import Log from 'log4js';
Log.configure({
  appenders: {
    console: {
      type: 'console',
    },
    file: {
      type: 'multiFile',
      base: 'logs/',
      property: 'logName',
      extension: '.log',
    },
  },
  categories: {
    default: {
      appenders: ['console', 'file'],
      level: 'debug',
    },
  },
});

export function createLogger(name: string, status: boolean = true) {
  const log = Log.getLogger(name);
  log.addContext('logName', name);
  if (!status) {
    log.level = 'off';
  }
  return log;
}
export default Log;
