import { ClockWorkOptions } from './types';

let queueOptions: ClockWorkOptions;

let getConfiguration = (): ClockWorkOptions => {
  return queueOptions;
};

let setConfiguration = (options: ClockWorkOptions): void => {
  queueOptions = options;
};

export default { getConfiguration, setConfiguration };
