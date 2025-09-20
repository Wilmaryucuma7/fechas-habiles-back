export interface IHttpResponse<T = any> {
  status: number;
  ok: boolean;
  json(): Promise<T>;
  text(): Promise<string>;
}

export interface IHttpClient {
  get<T = any>(url: string, options?: RequestInit): Promise<IHttpResponse<T>>;
}
