import Log from 'log4js';
Log.configure({
  appenders: {
    console: {
      type: 'console',
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'info',
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
