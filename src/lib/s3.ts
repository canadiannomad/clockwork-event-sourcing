import { S3 } from 'aws-sdk/clients/all';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { logger } from './logger';
import { config } from './config';

const log = logger('S3');

const getS3Object = (): S3 => {
  const s3Config = config.getConfiguration().s3;
  return new S3(s3Config);
};

/**
 * This function saves a text file into a S3 bucket.
 * @param {string}  name - The file name.
 * @param {string}  content - The file content.
 * @return {Promise<any>} Promise that returns the S3 response.
 */
const saveJsonFile = async (name: string, content: string): Promise<any> => {
  const bucket = config.getConfiguration().s3.bucket;
  const testMode = config.getConfiguration().testMode;
  const putObject: PutObjectRequest = {
    Bucket: bucket,
    Body: JSON.stringify(content),
    Key: `${name}.json`,
  };
  try {
    if (!testMode) {
      await getS3Object().putObject(putObject).promise();
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
  const bucket = config.getConfiguration().s3.bucket;
  const request: S3.GetObjectRequest = {
    Bucket: bucket,
    Key: name,
  };

  try {
    const retVal = await getS3Object().getObject(request).promise();
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
const listFiles = async (folder: string, continuationToken: string = null): Promise<any> => {
  try {
    let result = [];
    const bucket = config.getConfiguration().s3.bucket;
    const request = {
      Bucket: bucket,
      Prefix: `${folder}/`,
      ContinuationToken: continuationToken,
    };

    log.info(`Getting files from ${folder}, ${continuationToken}`, bucket);

    const retVal = await getS3Object().listObjectsV2(request).promise();
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

const uploadBlobFile = async (folder: string, fileName: string, blob: Buffer) => {
  const bucket = config.getConfiguration().s3.bucket;
  const putObject: PutObjectRequest = {
    Bucket: bucket,
    Body: blob,
    Key: `${folder}/${fileName}`,
  };
  try {
    await getS3Object().putObject(putObject).promise();
    log.info('Saved file:', { fileName });
  } catch (e) {
    log.info('Failed to save the file:', { fileName, e });
    throw e;
  }

}

export const s3 = { saveJsonFile, getJsonFile, listFiles, uploadBlobFile };
