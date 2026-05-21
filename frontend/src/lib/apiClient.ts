const API_URL = "/api";

interface ApiClientConfig extends RequestInit {
  headers?: Record<string, string>;
}

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ApiErrorResponse = { detail?: string; error?: string };

const request = async <T>(
  endpoint: string,
  method: HTTPMethod,
  config: ApiClientConfig = {},
) => {
  return fetch(`${API_URL}${endpoint}`, {
    ...config,
    headers: {
      ...config.headers,
    },
    method: method,
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data: ApiErrorResponse) => {
          console.error("API Error:", data);
          throw new Error(data.detail ?? data.error ?? "Request failed");
        });
      }
      return response.json();
    })
    .then((data) => {
      return data as T;
    });
};

const requestDelete = async (endpoint: string, config: ApiClientConfig = {}) => {
  return fetch(`${API_URL}${endpoint}`, {
    ...config,
    method: "DELETE",
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((data: ApiErrorResponse) => {
        console.error("API Error:", data);
        throw new Error(data.detail ?? data.error ?? "Request failed");
      });
    }
    return undefined;
  });
};

export const apiClient = {
  get: <T>(endpoint: string, config: ApiClientConfig = {}) => {
    return request<T>(endpoint, "GET", config);
  },
  post: <T>(endpoint: string, body?: unknown, config: ApiClientConfig = {}) => {
    return request<T>(endpoint, "POST", {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put: <T>(endpoint: string, body: unknown, config: ApiClientConfig = {}) => {
    return request<T>(endpoint, "PUT", {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(body),
    });
  },
  delete: (endpoint: string, config: ApiClientConfig = {}) => {
    return requestDelete(endpoint, config);
  },
  patch: <T>(endpoint: string, body: unknown, config: ApiClientConfig = {}) => {
    return request<T>(endpoint, "PATCH", {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(body),
    });
  },
};
