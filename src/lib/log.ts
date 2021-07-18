import config from './config';

export default (...args: any[]): void => {
  const { logger } = config.get();
  if (logger === true) {
    console.log(...args);
    return;
  }
  if (logger) logger(...args);
};
