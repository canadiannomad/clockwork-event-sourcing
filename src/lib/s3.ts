import { ClockWorkOptions } from './types';
import { S3 } from 'aws-sdk/clients/all';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import {logger} from './logger';
import {config} from './config';

const log = logger('S3');
const s3Obj = new S3();

/**
 * This function saves a text file into a S3 bucket.
 * @param {string}  name - The file name.
 * @param {string}  content - The file content.
 * @return {Promise<any>} Promise that returns the S3 response.
 */
const saveJsonFile = async (name: string, content: string): Promise<any> => {
  const bucket = config.getConfiguration().s3Bucket;
  const testMode = config.getConfiguration().testMode;
  const putObject: PutObjectRequest = {
    Bucket: bucket,
    Body: JSON.stringify(content),
    Key: `${name}.json`,
  };
  log.info(`Saving file ${name}`, { putObject });
  try {
    if (!testMode) {
      await s3Obj.putObject(putObject).promise();
      log.info('Saved file:', { name });
    }
  } catch (e) {
    log.info('Failed to save the file:', { name, e });
    throw e;
  }
};

/**
 * This function gets a file from S3 bucket.
 * @param {string}  name - The file name.
 * @return {Promise<any>} Promise that returns the file content.
 */
const getJsonFile = async (name: string): Promise<any> => {
  const bucket = config.getConfiguration().s3Bucket;
  const request: S3.GetObjectRequest = {
    Bucket: bucket,
    Key: name,
  };

  try {
    const retVal = await s3Obj.getObject(request).promise();
    const data = retVal.Body.toString('utf-8');
    log.info('Got file:', { name });
    return JSON.parse(data as any);
  } catch (e) {
    log.info('Failed to get the file:', { name, e });
    throw e;
  }
};

/**
 * Returns the file list on a folder.
 * @param {string}  folder - The folder name.
 * @param {string}  continuationToken - The continuation token.
 * @return {Promise<any>} Promise that returns the folder files list.
 */
const listFiles = async (folder: string, continuationToken: string = null) => {
  try {
    let result = [];
    const bucket = config.getConfiguration().s3Bucket;
    const request = {
      Bucket: bucket,
      Prefix: `${folder}/`,
      ContinuationToken: continuationToken,
    };

    log.info(`Getting files from ${folder}, ${continuationToken}`, bucket);

    const retVal = await s3Obj.listObjectsV2(request).promise();
    if (retVal.Contents?.length > 0) {
      const files = retVal.Contents.map((file) => {
        return file.Key.replace(`${folder}/`, '');
      });
      result = result.concat(files);
    }
    if (retVal?.IsTruncated) {
      const recursiveFilesResponse = await listFiles(folder, retVal.NextContinuationToken);
      if (recursiveFilesResponse?.length > 0) {
        result = result.concat(recursiveFilesResponse);
      }
    }
    return result;
  } catch (e) {
    log.error(`Failed to get the folder content: ${folder}`, { e });
    throw e;
  }
};

export const s3 = { saveJsonFile, getJsonFile, listFiles };
