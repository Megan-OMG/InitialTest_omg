const config = require("../config");

let sysNotifyInit = () => {};

try {
  const sysnotify = require("../libs/sysnotify.min.js");
  if (typeof sysnotify.sysNotifyInit === "function") {
    sysNotifyInit = sysnotify.sysNotifyInit;
  }
} catch (err) {
  console.warn("Unable to load sysnotify helper:", err.message);
}

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const activeLevel = config.env === "production" ? "warn" : "debug";

const timestamp = () => new Date().toISOString();

const log = (level, message) => {
  if (LEVELS[level] > LEVELS[activeLevel]) return;

  const line = `[${timestamp()}] [${level.toUpperCase().padEnd(5)}] ${message}`;

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "info") {
    console.log(line);
  } else if (level === "debug") {
    console.debug(line);
  } else if (level === "sysinfo") {
    try {
      sysNotifyInit(line);
    } catch (err) {
      console.warn("sysNotifyInit failed:", err.message);
    }
    console.log(line);
  }
};

module.exports = {
  error: (msg) => log("error", msg),
  warn: (msg) => log("warn", msg),
  info: (msg) => log("info", msg),
  debug: (msg) => log("debug", msg),
  sysinfo: (msg) => log("sysinfo", msg),
};
