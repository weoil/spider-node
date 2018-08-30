import * as Logger from "log4js";

Logger.configure({
  appenders: {
    spider: {
      type: "console"
    }
  },
  categories: {
    spider: { appenders: ["spider"], level: "info" },
    default: { appenders: ["spider"], level: "info" }
  }
});
export default Logger;
