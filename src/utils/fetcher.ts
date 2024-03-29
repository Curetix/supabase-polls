/**
 * Error class for failed fetch requests.
 */
export class FetcherHttpError extends Error {
  info: any;
  status: number = 200;
}

/**
 * Use native fetch and return the typed JSON response.
 */
export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
  throwHttp = true,
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok && throwHttp) {
    const error = new FetcherHttpError(`An HTTP error ${res.status} occurred.`);
    error.info = await res.json().catch(() => res.body);
    error.status = res.status;
    throw error;
  }

  return res.json();
}
