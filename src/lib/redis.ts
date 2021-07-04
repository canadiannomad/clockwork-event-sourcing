import evtEmitter from 'events';
import IORedis from 'ioredis';
import * as util from 'util';
import config from './config';
import * as types from '../types';

evtEmitter.EventEmitter.defaultMaxListeners = 40;

const { promisify } = util;

let client: IORedis.Redis | IORedis.Cluster;
let subscriptionClient: IORedis.Redis | IORedis.Cluster;

const redisConnect = (redisConfig: types.RedisOptions) =>
  new Promise((resolve: any) => {
    if (redisConfig.clusterNodes) {
      const redisOptions: Record<string, any> = {};
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
      client = new IORedis.Cluster(redisConfig.clusterNodes, { redisOptions });
    } else {
      const configObj: any = {
        host: redisConfig.host,
        port: redisConfig.port,
      };
      if (redisConfig.password) {
        configObj.password = redisConfig.password;
      }
      if (redisConfig.tls) {
        configObj.tls = {
          checkServerIdentity: () =>
            // skip certificate hostname validation
            undefined,
        };
      }
      client = new IORedis(configObj);
    }

    client.on('error', (err: any) => {
      console.error('Lib Redis', 'REDIS CONNECT error ', err);
      console.error('Lib Redis', 'node error', err.lastNodeError);
    });

    client.on('connect', () => {
      console.log('Lib Redis', 'Redis Connected');
      resolve();
    });

    client.on('reconnecting', () => {
      console.warn('Lib Redis', 'Redis Reconnecting');
    });

    client.on('warning', () => {
      console.warn('Lib Redis', 'Redis Reconnecting');
    });
  });

const subscriptionConnect = (callback: (message: string) => Promise<void>) =>
  new Promise((resolve: any) => {
    const { redis: redisConfig } = config.get().streams;
    if (!redisConfig) {
      throw new Error('Redis not configured.');
    }
    if (redisConfig.clusterNodes) {
      const redisOptions: Record<string, any> = {};
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
      subscriptionClient = new IORedis.Cluster(redisConfig.clusterNodes, { redisOptions });
    } else {
      const configObj: any = {
        host: redisConfig.host,
        port: redisConfig.port,
      };
      if (redisConfig.password) {
        configObj.password = redisConfig.password;
      }
      if (redisConfig.tls) {
        configObj.tls = {
          checkServerIdentity: () =>
            // skip certificate hostname validation
            undefined,
        };
      }
      subscriptionClient = new IORedis(configObj);
    }
    const subscriptionChannel = `${redisConfig.prefix}-channel`;
    subscriptionClient.subscribe(subscriptionChannel, (err) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      }
    });
    subscriptionClient.on('message', (subChannel, message) => {
      if (subChannel === subscriptionChannel) {
        console.log('Lib Redis', `Received '${message}' from ${subChannel}`);
        callback(message);
      }
    });

    subscriptionClient.on('error', (err: any) => {
      console.error('Lib Redis', 'REDIS CONNECT error ', err);
      console.error('Lib Redis', 'node error', err.lastNodeError);
    });

    subscriptionClient.on('connect', () => {
      console.log('Lib Redis', 'Redis Connected');
      resolve();
    });

    subscriptionClient.on('reconnecting', () => {
      console.warn('Lib Redis', 'Redis Reconnecting');
    });

    subscriptionClient.on('warning', () => {
      console.warn('Lib Redis', 'Redis Reconnecting');
    });
  });

const redisClient =
  (func: string) =>
  async (...args: Array<any>): Promise<any> => {
    if (!client) {
      const { redis: redisConfig } = config.get().streams;
      if (!redisConfig) {
        throw new Error('Redis not configured.');
      }
      console.log('Lib Redis', 'Redis Auth Starting');
      try {
        await redisConnect(redisConfig);
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

const stop = (): void => {
  if (client) client.quit();
  if (subscriptionClient) subscriptionClient.quit();
};

export default {
  flushall: redisClient('flushall'),
  exists: redisClient('exists'),
  del: redisClient('del'),
  get: redisClient('get'),
  quit: redisClient('quit'),
  set: redisClient('set'),
  xadd: redisClient('xadd'),
  xlen: redisClient('xlen'),
  xread: redisClient('xread'),
  xgroup: redisClient('xgroup'),
  xreadgroup: redisClient('xreadgroup'),
  xack: redisClient('xack'),
  xclaim: redisClient('xclaim'),
  xpending: redisClient('xpending'),
  xinfo: redisClient('xinfo'),
  xrange: redisClient('xrange'),
  xrevrange: redisClient('xrevrange'),
  eval: redisClient('eval'),
  incr: redisClient('incr'),
  publish: redisClient('publish'),
  subscribe: subscriptionConnect,
  stop,
};
