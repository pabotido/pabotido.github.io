import { parseTrustedProxyCidrs } from '../src/common/trusted-proxy';

describe('parseTrustedProxyCidrs', () => {
  it('leaves proxy trust disabled when no ranges are configured', () => {
    expect(parseTrustedProxyCidrs(undefined)).toEqual([]);
  });

  it('parses and trims explicitly configured proxy ranges', () => {
    expect(parseTrustedProxyCidrs('10.0.0.0/8, 192.168.1.10/32')).toEqual(['10.0.0.0/8', '192.168.1.10/32']);
  });
});
