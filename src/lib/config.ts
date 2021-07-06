import { Options } from '../types';

let queueOptions: Options;

const get = (): Options => queueOptions;

const set = (options: Options): void => {
  queueOptions = options;
};

export default { get, set };
