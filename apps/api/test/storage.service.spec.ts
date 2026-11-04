import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { Readable } from 'node:stream';
import { StorageService } from '../src/storage/storage.service';

describe('StorageService', () => {
  const send = jest.spyOn(S3Client.prototype, 'send') as jest.Mock;
  const service = new StorageService(new ConfigService({ S3_BUCKET: 'test-bucket', S3_ENDPOINT: 'http://localhost:9000', S3_ACCESS_KEY: 'access', S3_SECRET_KEY: 'secret' }));

  afterEach(() => send.mockReset());

  it('writes an object with its content type', async () => {
    send.mockResolvedValueOnce({});
    await expect(service.put('documents/test.txt', Buffer.from('hello'), 'text/plain')).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ input: expect.objectContaining({ Bucket: 'test-bucket', Key: 'documents/test.txt', ContentType: 'text/plain' }) }));
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutObjectCommand);
  });

  it('returns a readable object and metadata', async () => {
    send.mockResolvedValueOnce({ Body: Readable.from(['hello']), ContentType: 'text/plain', ContentLength: 5 });
    await expect(service.get('documents/test.txt')).resolves.toMatchObject({ contentType: 'text/plain', length: 5, body: expect.any(Readable) });
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetObjectCommand);
  });

  it('maps storage failures to a service unavailable error', async () => {
    send.mockRejectedValueOnce(new Error('connection refused'));
    await expect(service.get('missing.txt')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
