import { LoggerFunction } from './types';
// Instantiate the logger

const origStdout = process.stdout.write;
const fullLog: any[] = [];

const log = (...args: Array<any>) => {
  args.unshift({
    date: new Date().toISOString(),
  });
  const outp = args.reduce((res, cur) => {
    switch (typeof cur) {
      case 'string':
      case 'number':
      case 'boolean':
        (res.message = res.message || []).push(cur);
        break;
      default:
        for (const key in cur) {
          /* istanbul ignore else */
          if (cur.hasOwnProperty(key)) {
            /* istanbul ignore else */
            if (key === 'message') {
              (res.message = res.message || []).push(cur.message);
            } else {
              res[key] = cur[key];
            }
          }
        }
        /* istanbul ignore if  */
        if (cur instanceof Error) {
          res.stack = cur.stack;
        }

        break;
    }
    return res;
  }, {});

  // Really output now
  fullLog.push(outp);
  // eslint-disable-next-line no-process-env
  const procLambdaTaskRoot = process.env.LAMBDA_TASK_ROOT;
  // eslint-disable-next-line no-process-env
  const procAwsExecEnv = process.env.AWS_EXECUTION_ENV;
  // eslint-disable-next-line no-process-env
  const procMochaTest = process.env.MOCHATEST;
  // eslint-disable-next-line no-process-env
  const procCompactLogs = process.env.COMPACT_LOGS;

  /* istanbul ignore next */
  if (procCompactLogs === 'true' || (procLambdaTaskRoot && procAwsExecEnv)) {
    origStdout.call(process.stdout, JSON.stringify(outp) + '\n'); // Running as lambda
  } else if (procMochaTest && outp.message) {
    /* istanbul ignore next */ origStdout.call(process.stdout, `${outp.date}: ${outp.message[0]}\n`);
    /* istanbul ignore next */
    if (outp.stack) {
      origStdout.call(process.stdout, `${outp.stack}\n`);
    }
  } else {
    origStdout.call(process.stdout, JSON.stringify(outp, null, 2) + '\n');
  }
};

const hookStream = (
  stream: NodeJS.WriteStream,
  callback: {
    (str: any, encoding: any): void;
    (str: any, encoding: any): void;
    (arg0: any, arg1: any, arg2: any): void;
  },
) => {
  const oldWrite = stream.write;

  stream.write = (str: string, encoding?: any, cb?: any): boolean => {
    callback(str, encoding, cb);
    return true;
  };

  return () => {
    stream.write = oldWrite;
  };
};

const transport = (src: { context: string; source?: string; message?: any[]; type?: string; date?: string }) => {
  return (str: { toString: (arg0: any) => string }, encoding: any) => {
    log(src, {
      message: [str.toString(encoding).trim()],
      type: 'debug',
    });
  };
};

const gen = (context: string, enabled = true): Record<string, LoggerFunction> => {
  let hookerr: { (): void; (): void };
  let hookout: { (): void; (): void };
  const hook = () => {
    /* istanbul ignore else */
    hookout = hookStream(process.stdout, transport({ context, source: 'stdout' }));
    hookerr = hookStream(process.stderr, transport({ context, source: 'stderr' }));
  };
  const unhook = () => {
    hookout();
    hookerr();
  };

  const info = (...args: any[]) => {
    if (enabled) {
      log.call(null, { context, type: 'info' }, ...args);
    }
  };
  const warn = (...args: any[]) => {
    if (enabled) {
      log.call(null, { context, type: 'warning' }, ...args);
    }
  };
  const error = (...args: any[]) => {
    if (enabled) {
      log.call(null, { context, type: 'error' }, ...args);
    }
  };
  const debug = (...args: any[]) => {
    if (enabled) {
      log.call(null, { context, type: 'debug' }, ...args);
    }
  };
  const getFullLog = () => fullLog.slice(0);

  hook();

  const logObj = { info, warn, error, debug, hook, unhook, getFullLog };
  return logObj;
};

export default gen;
