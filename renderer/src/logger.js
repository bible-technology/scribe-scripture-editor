const isElectron = require('is-electron');

let log;
if (process.env.NODE_ENV !== 'test' && isElectron()) {
  log = global.log;
}

const logger = () => {
  if (isElectron()) {
    log.transports.file.level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
    log.transports.file.file = 'aglogger.log';
    log.transports.file.maxSize = 15 * 1024 * 1024;
    log.transports.file.streamConfig = { encoding: 'utf8', flags: 'a' };
    log.transports.console.level = false;
    log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s} [{level}] {text}';
  }
  return log;
};
export const error = async (filename, text) => {
  await logger();
  if (process.env.NODE_ENV !== 'test' && isElectron() !== false) {
    log.error(`${filename}: ${text}`);
  }
};
export const warn = async (filename, text) => {
  await logger();
  if (process.env.NODE_ENV !== 'test' && isElectron() !== false) {
    log.warn(`${filename}: ${text}`);
  }
};
export const info = async (filename, text) => {
  await logger();
  if (process.env.NODE_ENV !== 'test' && isElectron() !== false) {
    log.info(`${filename}: ${text}`);
  }
};
export const debug = async (filename, text) => {
  await logger();
  if (process.env.NODE_ENV !== 'test' && isElectron() !== false) {
    log.debug(`${filename}: ${text}`);
  }
};
export default logger;
