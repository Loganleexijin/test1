const BASE_URL = "/api";
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
  error?: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const headers = new Headers(options?.headers);
    const token = localStorage.getItem("authToken");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
    const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!response.ok || json?.success === false) {
      const message = json?.message || json?.error || `Request failed: ${response.status}`;
      const error = new Error(message);
      console.error(error);
      throw error;
    }

    if (json && json.success === true) {
      return json.data as T;
    }

    if (response.ok && json !== null) {
      return json as unknown as T;
    }

    throw new Error(`Request failed: ${response.status}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function postFunction<T, B = unknown>(functionName: string, body?: B): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase 未配置：缺少 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("apikey", SUPABASE_ANON_KEY);

  const token = localStorage.getItem("authToken");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const json = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    const message = typeof json?.message === "string" ? json.message : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return json as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function post<T, B = unknown>(path: string, body?: B): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function patch<T, B = unknown>(path: string, body?: B): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
