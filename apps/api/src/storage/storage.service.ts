import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('S3_BUCKET', 'portal-files');
    this.client = new S3Client({
      region: config.get<string>('S3_REGION', 'us-east-1'),
      endpoint: config.get<string>('S3_ENDPOINT'),
      forcePathStyle: true,
      credentials: { accessKeyId: config.get<string>('S3_ACCESS_KEY', ''), secretAccessKey: config.get<string>('S3_SECRET_KEY', '') },
    });
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    try { await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType })); }
    catch { throw new ServiceUnavailableException('Không thể lưu tệp vào object storage'); }
  }

  async get(key: string): Promise<{ body: Readable; contentType?: string; length?: number }> {
    try {
      const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      if (!(result.Body instanceof Readable)) throw new Error('Invalid storage response');
      return { body: result.Body, contentType: result.ContentType, length: result.ContentLength };
    } catch { throw new ServiceUnavailableException('Không thể đọc tệp từ object storage'); }
  }
}
