import { config } from '@/config';
import { BadRequestError, ExternalServiceError } from '@/utils';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getSignedUrlPresigner } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

interface UploadFileResponse {
  key: string;
  bucket: string;
  url: string;
}

class S3Service {
  private readonly bucketName: string;
  private readonly s3Client: S3Client;

  constructor() {
    this.bucketName = config.aws.bucketName;
    this.s3Client = new S3Client({
      region: config.aws.region,
      apiVersion: config.aws.apiVersion,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  private generateKey(prefix: string, fileExtension: string) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${prefix}/${timestamp}-${randomString}.${fileExtension}`;
  }

  private async uploadFile(
    fileBuffer: Buffer,
    key: string,
  ): Promise<UploadFileResponse> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });
    await this.s3Client.send(command);
    const url = `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
    return {
      key,
      bucket: this.bucketName,
      url,
    };
  }

  async uploadOriginalFile(
    fileBuffer: Buffer,
    fileExtension: string,
  ): Promise<UploadFileResponse> {
    try {
      const key = this.generateKey('original', fileExtension);
      return await this.uploadFile(fileBuffer, key);
    } catch (error) {
      console.error('Original file upload to AWS S3 failed', error);
      throw new ExternalServiceError('Failed to upload original file', 's3');
    }
  }
  async uploadGeneratedFile(
    fileBuffer: Buffer,
    fileExtension: string,
  ): Promise<UploadFileResponse> {
    try {
      const key = this.generateKey('generated', fileExtension);
      return await this.uploadFile(fileBuffer, key);
    } catch (error) {
      console.error('Generated file upload to AWS S3 failed', error);
      throw new ExternalServiceError('Failed to upload generated file', 's3');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const signedUrl = await getSignedUrlPresigner(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      console.error('Failed to generate AWS S3 signed URL', { error, key });
      throw new ExternalServiceError('Failed to generate signed url', 's3');
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!key.trim()) {
      throw new BadRequestError('Invalid key provided');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Failed to delete AWS S3 file', { error, key });
      throw new ExternalServiceError('Unable to delete object', 's3');
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteFile(key)));
  }
}

export const s3Service = new S3Service();
