import logger from './logger';
import { QueueOptions } from './types';

const log = logger('Configuration');

let options: QueueOptions = {
  s3Bucket: '',
  testMode: false,
};

const getConfiguration = (): QueueOptions => {
  log.info("Get configuration", JSON.stringify(options));
  process.exit();
  return options;
};

const setConfiguration = (options: QueueOptions) => {
  log.info("Queue configuration set", JSON.stringify(options));
  options = options;
};

export { getConfiguration, setConfiguration };
