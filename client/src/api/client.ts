import type { ApiResponse } from "../types";

const BASE_URL = "http://localhost:4000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { headers: extraHeaders, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(extraHeaders as Record<string, string> | undefined),
    },
    credentials: "include",
    ...rest,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(json.message ?? "Request failed");
  }

  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
