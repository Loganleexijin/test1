const BASE_URL = "/api";

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
