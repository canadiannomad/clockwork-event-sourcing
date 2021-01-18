import './types';
import * as AWS from 'aws-sdk';
import logger from './logger';

const log = logger('Get Secret Value');
const secMgr = new AWS.SecretsManager({
  endpoint: 'https://secretsmanager.us-east-1.amazonaws.com',
  region: 'us-east-1',
});

/**
 * This function gets a secret value from AWS Secrets Manager
 * @param {string}  key - The secret key.
 * @return {Promise<any>} Promise that returns the secret value.
 */
const getSecretValue = async (key: string): Promise<any> => {
  log.info('Getting Secret:', { key });
  if (globalThis.testMode) {
    switch (key) {
      case 'redis':
        return { host: 'localhost' };
      default:
        return {};
    }
  }
  const params = { SecretId: key };
  try {
    const retVal = await secMgr.getSecretValue(params).promise();
    log.info('Got Secret:', { key });
    return JSON.parse(retVal.SecretString as string);
  } catch (e) {
    log.info('Failed to get Secret:', { key, e });
    return e;
  }
};

export default getSecretValue;
