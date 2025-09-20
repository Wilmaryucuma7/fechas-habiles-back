import { IHttpClient, IHttpResponse } from '@/shared/ports/IHttpClient';

class FetchResponseAdapter<T = any> implements IHttpResponse<T> {
  constructor(private readonly res: Response) {}

  get status(): number {
    return this.res.status;
  }

  get ok(): boolean {
    return this.res.ok;
  }

  async json(): Promise<T> {
    return (this.res.json() as unknown) as T;
  }

  async text(): Promise<string> {
    return this.res.text();
  }
}

export class FetchHttpClient implements IHttpClient {
  async get<T = any>(url: string, options?: RequestInit): Promise<IHttpResponse<T>> {
    const res = await fetch(url, { method: 'GET', ...options });
    return new FetchResponseAdapter<T>(res as unknown as Response);
  }
}
