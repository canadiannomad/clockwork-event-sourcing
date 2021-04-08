import './types';
import evtEmitter = require('events');
import ioredis = require('ioredis');
import * as util from 'util';
import { logger } from './logger';
import { config } from './config';

evtEmitter.EventEmitter.defaultMaxListeners = 40;

const log = logger('Lib Redis');
const promisify = util.promisify;

let client: ioredis;

const redisConnect = (host: string, password: string, port = 6379) => {
  return new Promise((resolve:any) => {
    const config: any = {
      host,
      port,
    };
    if (password) {
      config.password = password;
      config.tls = {
        checkServerIdentity: () => {
          // skip certificate hostname validation
          return undefined;
        },
      };
    }
    client = new ioredis(config);

    client.on('error', (err: any) => {
      log.error('REDIS CONNECT error ', err);
      log.error('node error', err.lastNodeError);
    });

    client.on('connect', () => {
      log.info('Redis Connected');
      resolve();
    });

    client.on('reconnecting', () => {
      log.warn('Redis Reconnecting');
    });

    client.on('warning', () => {
      log.warn('Redis Reconnecting');
    });
  });
};

const redisClient = (func: string) => {
  return async (...args: any): Promise<any> => {
    if (!client) {
      const redisConfig = config.getConfiguration().redisConfig;
      log.info('Redis Auth Starting');
      try {
        await redisConnect(redisConfig.host, redisConfig.password, redisConfig.port);
      } catch (e) {
        log.error('Redis Auth failed:', e);
        throw e;
      }
      log.info('Calling:', { func, items: [...args] });
      const call = promisify(client[func]).bind(client);
      const result = await call.apply(client, args);
      log.info('Retrieved:', { result });
      return result;
    } else {
      if (func != 'xreadgroup') {
        log.info('Already Loaded, Calling:', { func, items: [...args] });
      }
      const result = await promisify(client[func]).bind(client)(...args);
      if (result) {
        log.info('Retrieved:', { result });
      }
      return result;
    }
  };
};

export const redis = {
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
