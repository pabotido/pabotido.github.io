import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../src/storage/storage.service';

const enabled = process.env.MINIO_E2E === '1';
const describeMinio = enabled ? describe : describe.skip;

describeMinio('MinIO storage runtime', () => {
  const endpoint = process.env.S3_ENDPOINT ?? 'http://127.0.0.1:9000';
  const bucket = process.env.S3_BUCKET ?? 'portal-files';
  const config = new ConfigService({
    S3_ENDPOINT: endpoint,
    S3_BUCKET: bucket,
    S3_REGION: process.env.S3_REGION ?? 'us-east-1',
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? 'local-access',
    S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? 'local-secret',
  });
  const accessKeyId = config.get<string>('S3_ACCESS_KEY') ?? 'local-access';
  const secretAccessKey = config.get<string>('S3_SECRET_KEY') ?? 'local-secret';
  const region = config.get<string>('S3_REGION') ?? 'us-east-1';
  const client = new S3Client({ endpoint, region, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } });
  const storage = new StorageService(config);

  beforeAll(async () => {
    try { await client.send(new CreateBucketCommand({ Bucket: bucket })); } catch (error) {
      if (!(error instanceof Error) || !/already exists|owned by you/i.test(error.message)) throw error;
    }
  });

  it('writes and reads an object through MinIO', async () => {
    const key = `e2e/${Date.now()}-runtime.txt`;
    await storage.put(key, Buffer.from('minio runtime ok'), 'text/plain');
    const result = await storage.get(key);
    const chunks: Buffer[] = [];
    for await (const chunk of result.body) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString()).toBe('minio runtime ok');
    expect(result.contentType).toBe('text/plain');
  });
});
