import { promisify } from 'util';
import * as types from './types';
import { config, eventqueue, redis, s3 } from './lib';

const sleep = promisify(setTimeout);

const stop = async (): Promise<void> => {
  s3.stop();
  await redis.stop();
  // Settle (eg, saving s3 is done asynchronously)
  await new Promise(resolve => setImmediate(resolve));
  await sleep(100);
};

export { config, eventqueue, types, redis, s3, stop };

export default { config, eventqueue, types, redis, s3, stop };
