import { ClockWorkOptions } from './types';

let queueOptions: ClockWorkOptions;

const getConfiguration = (): ClockWorkOptions => {
  return queueOptions;
};

const setConfiguration = (options: ClockWorkOptions): void => {
  queueOptions = options;
};

export const config = { getConfiguration, setConfiguration };
