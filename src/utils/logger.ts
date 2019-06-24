import Log from "log4js";
Log.configure({
  appenders: {
    file: {
      type: "file",
      filename: "./spider.log"
    },
    console: {
      type: "console"
    }
  },
  categories: {
    default: {
      appenders: ["file", "console"],
      level: "info"
    }
  }
});

export function createLogger(name: string, status: boolean = true) {
  const log = Log.getLogger(name);
  log.addContext("logName", name);
  if (!status) {
    log.level = "off";
  }

  return log;
}
export default Log;
