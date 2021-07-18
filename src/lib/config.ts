import { Options } from '../types';

let queueOptions: Options;

const get = (): Options => queueOptions;

const set = (options: Options): void => {
  queueOptions = options;
  if (!queueOptions.logger && queueOptions.logger !== false) queueOptions.logger = console.log;
};

export default { get, set };
