import evtEmitter from 'events';
import IORedis from 'ioredis';
import * as util from 'util';
import config from './config';

evtEmitter.EventEmitter.defaultMaxListeners = 40;

const { promisify } = util;

let client: IORedis.Redis | IORedis.Cluster;
let subscriptionClient: IORedis.Redis | IORedis.Cluster;

const withPrefix = (suffix: string): string => {
  const { redis: redisConfig } = config.get().streams;
  if (!redisConfig) {
    throw new Error('Redis not configured.');
  }
  return `${redisConfig.prefix}-${suffix}`;
};

const returnClient = (): IORedis.Redis | IORedis.Cluster => {
  const { redis: redisConfig } = config.get().streams;
  const redisOptions: Record<string, any> = {};
  if (!redisConfig) {
    throw new Error('Redis not configured.');
  }

  if (redisConfig.password) {
    redisOptions.password = redisConfig.password;
  }
  if (redisConfig.tls) {
    redisOptions.tls = {
      checkServerIdentity: () =>
        // skip certificate hostname validation
        undefined,
    };
  }

  if (!redisConfig.clusterNodes) {
    redisOptions.host = redisConfig.host;
    redisOptions.port = redisConfig.port || 6379;
  }

  return redisConfig.clusterNodes
    ? new IORedis.Cluster(redisConfig.clusterNodes, { redisOptions })
    : new IORedis(redisOptions);
};

const attachListeners = async (outClient: IORedis.Redis | IORedis.Cluster) => {
  await new Promise((resolve) => {
    const listener = async () => {
      console.log('Lib Redis', 'Redis Connected');
      resolve(outClient);
    };
    outClient.on('connect', listener);
  });
  outClient.on('error', (err: any) => {
    console.error('Lib Redis', 'REDIS CONNECT error ', err, err.lastNodeError);
  });

  outClient.on('reconnecting', () => {
    console.warn('Lib Redis', 'Redis Reconnecting');
  });

  outClient.on('warning', () => {
    console.warn('Lib Redis', 'Redis Reconnecting');
  });
};

const redisConnect = async () => {
  client = returnClient();
  await attachListeners(client);
};

const subscriptionConnect = async (callback: (message: string) => Promise<void>): Promise<void> => {
  subscriptionClient = returnClient();
  await attachListeners(subscriptionClient);
  const subscribe = async (): Promise<void> =>
    new Promise((res, rej) => {
      subscriptionClient.subscribe(withPrefix('channel'), (err) => {
        if (err) {
          console.error('Failed to subscribe: %s', err.message);
          rej(err);
          return;
        }
        subscriptionClient.on('message', (subChannel, message) => {
          console.log('Lib Redis', `Received '${message}' from ${subChannel}`);
          if (subChannel === withPrefix('channel')) {
            callback(message);
          }
        });
        res();
      });
    });
  await subscribe();
};

const redisClient =
  (func: string) =>
  async (...args: Array<any>): Promise<any> => {
    if (!client) {
      console.log('Lib Redis', 'Redis Auth Starting');
      try {
        await redisConnect();
      } catch (e) {
        console.error('Lib Redis', 'Redis Auth failed:', e);
        throw e;
      }
      console.log('Lib Redis', 'Calling:', { func, items: [...args] });
      const call = promisify(client[func]).bind(client);
      const result = await call.apply(client, args);
      console.log('Lib Redis', 'Retrieved:', { result });
      return result;
    }
    if (func !== 'xreadgroup') {
      console.log('Lib Redis', 'Already Loaded, Calling:', { func, items: [...args] });
    }
    type CallBackType = (...a: any) => any;
    const redisFunc = (client as any)[func] as CallBackType;
    const result = await promisify(redisFunc)
      .bind(client)
      .apply(client, args as []);
    if (result) {
      console.log('Lib Redis', 'Retrieved:', { result });
    }
    return result;
  };

const stop = (): Promise<any[]> => {
  const promises = [];
  if (client) {
    promises.push(async () => client.quit());
  }
  if (subscriptionClient) {
    promises.push(async () => subscriptionClient.quit());
  }
  return Promise.all(promises);
};

export default {
  flushall: redisClient('flushall'),
  exists: redisClient('exists'),
  del: redisClient('del'),
  get: redisClient('get'),
  quit: redisClient('quit'),
  set: redisClient('set'),
  xadd: redisClient('xadd'),
  xinfo: redisClient('xinfo'),
  xlen: redisClient('xlen'),
  xread: redisClient('xread'),
  xgroup: redisClient('xgroup'),
  xreadgroup: redisClient('xreadgroup'),
  xack: redisClient('xack'),
  xclaim: redisClient('xclaim'),
  xpending: redisClient('xpending'),
  xrange: redisClient('xrange'),
  xrevrange: redisClient('xrevrange'),
  eval: redisClient('eval'),
  incr: redisClient('incr'),
  publish: redisClient('publish'),
  subscribe: subscriptionConnect,
  withPrefix,
  stop,
};
