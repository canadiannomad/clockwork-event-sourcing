import './types';
import evtEmitter = require('events');
import IORedis from 'ioredis';
import * as util from 'util';
import config from './config';

evtEmitter.EventEmitter.defaultMaxListeners = 40;

const { promisify } = util;

let client: IORedis.Redis | IORedis.Cluster;

const redisConnect = (host: string, password: string, port = 6379, tls = true, cluster = false) =>
  new Promise((resolve: any) => {
    if (cluster) {
      const redisOptions: Record<string, any> = {};
      if (password) {
        redisOptions.password = password;
      }
      if (tls) {
        redisOptions.tls = {
          checkServerIdentity: () =>
            // skip certificate hostname validation
            undefined,
        };
      }
      client = new IORedis.Cluster([{ host, port }], { redisOptions });
    } else {
      const configObj: any = {
        host,
        port,
      };
      if (password) {
        configObj.password = password;
      }
      if (tls) {
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

const redisClient =
  (func: string) =>
  async (...args: any): Promise<any> => {
    if (!client) {
      const { redisConfig } = config.getConfiguration();
      console.log('Lib Redis', 'Redis Auth Starting');
      try {
        await redisConnect(
          redisConfig.host,
          redisConfig.password,
          redisConfig.port,
          redisConfig.tls,
          redisConfig.cluster,
        );
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
    const result = await promisify(client[func]).bind(client)(...args);
    if (result) {
      console.log('Lib Redis', 'Retrieved:', { result });
    }
    return result;
  };

export default {
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
};
