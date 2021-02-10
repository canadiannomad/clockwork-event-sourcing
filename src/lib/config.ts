import { QueueOptions } from './types';

let queueOptions: QueueOptions = {
  s3Bucket: '',
  testMode: false,
};

let getConfiguration = (): QueueOptions => {
  return queueOptions;
};

let setConfiguration = (options: QueueOptions): void => {
  queueOptions = options;
};

export { getConfiguration, setConfiguration };
