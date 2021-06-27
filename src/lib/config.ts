import { ClockWorkOptions } from './types';

let queueOptions: ClockWorkOptions;

const getConfiguration = (): ClockWorkOptions => queueOptions;

const setConfiguration = (options: ClockWorkOptions): void => {
  queueOptions = options;
};

export default { getConfiguration, setConfiguration };
