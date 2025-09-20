import { FetchHttpClient } from '@/shared/adapters/FetchHttpClient';

describe('FetchHttpClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('should return json when fetch ok', async () => {
    const fakeJson = { hello: 'world' };
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => fakeJson });

    const client = new FetchHttpClient();
    const res = await client.get<{ hello: string }>('http://example.test');
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.hello).toBe('world');
  });

  it('should propagate non-ok responses', async () => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'ERR' });
    const client = new FetchHttpClient();
    const res = await client.get('http://example.test');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
  });
});
