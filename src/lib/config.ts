import { ClockWorkOptions } from './types';

let queueOptions: ClockWorkOptions = {
  s3Bucket: '',
  testMode: false,
};

let getConfiguration = (): ClockWorkOptions => {
  return queueOptions;
};

let setConfiguration = (options: ClockWorkOptions): void => {
  queueOptions = options;
};

export default { getConfiguration, setConfiguration };
