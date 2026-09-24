const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flashkobackend21.pythonanywhere.com';

let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined' && !inMemoryToken) {
    inMemoryToken = sessionStorage.getItem('fc_access_token');
  }
  return inMemoryToken;
}

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('fc_access_token', token);
    } else {
      sessionStorage.removeItem('fc_access_token');
    }
  }
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined' && !inMemoryRefreshToken) {
    inMemoryRefreshToken = sessionStorage.getItem('fc_refresh_token');
  }
  return inMemoryRefreshToken;
}

export function setRefreshToken(token: string | null) {
  inMemoryRefreshToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('fc_refresh_token', token);
    } else {
      sessionStorage.removeItem('fc_refresh_token');
    }
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

export function clearRefreshToken() {
  setRefreshToken(null);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    let message = 'Произошла ошибка';
    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.detail === 'string') {
        message = record.detail;
      } else if (record.non_field_errors) {
        message = Array.isArray(record.non_field_errors)
          ? String(record.non_field_errors[0])
          : String(record.non_field_errors);
      } else {
        const firstKey = Object.keys(record)[0];
        if (firstKey) {
          const val = record[firstKey];
          message = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`;
        }
      }
    }
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retry?: boolean;
}

export async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, retry = true, headers = {}, ...rest } = options;
  const token = getAccessToken();

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token && !skipAuth) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
      credentials: 'include', // Includes HttpOnly refresh token cookie
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Ошибка сети. Проверьте подключение к интернету.';
    throw new ApiError(0, errorMsg);
  }

  // Handle 401 Unauthorized for token refresh
  if (response.status === 401 && retry && !skipAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const fallbackRefresh = getRefreshToken();
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: fallbackRefresh || undefined }),
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const refreshData = (await refreshRes.json()) as { access: string; refresh?: string };
          setAccessToken(refreshData.access);
          if (refreshData.refresh) {
            setRefreshToken(refreshData.refresh);
          }
          onRefreshed(refreshData.access);
          isRefreshing = false;
          // Retry original request with new token
          return request<T>(endpoint, { ...options, retry: false });
        } else {
          clearAccessToken();
          clearRefreshToken();
          onRefreshed(null);
          isRefreshing = false;
        }
      } catch {
        clearAccessToken();
        clearRefreshToken();
        onRefreshed(null);
        isRefreshing = false;
      }
    } else {
      // Wait for ongoing refresh
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber((newToken) => {
          if (newToken) {
            resolve(request<T>(endpoint, { ...options, retry: false }));
          } else {
            reject(new ApiError(401, 'Сессия истекла. Пожалуйста, войдите снова.'));
          }
        });
      });
    }
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  let data: unknown = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
