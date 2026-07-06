import { API_CONFIG } from '../../../shared/config/api.config';

export type ConfigTable = 'network_map' | 'rule' | 'typology';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface PaginationParams {
  limit: number;
  offset: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  filters?: Record<string, string>;
}

const HTTP_UNAUTHORIZED = 401;

export class ConfigApiService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.API_BASE_URL;
  }

  private static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === HTTP_UNAUTHORIZED) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(
        errorData.message ?? `HTTP error! status: ${response.status}`,
      );
    }
    return (await response.json()) as T;
  }

  private buildQuery(params: PaginationParams): string {
    const search = new URLSearchParams();
    search.set('limit', String(params.limit));
    search.set('offset', String(params.offset));
    if (params.sort) search.set('sort', params.sort);
    if (params.order) search.set('order', params.order);
    if (params.filters) {
      search.set('filters', JSON.stringify(params.filters));
    }
    return `?${search.toString()}`;
  }

  private getTablePath(table: ConfigTable): string {
    switch (table) {
      case 'network_map':
        return API_CONFIG.ENDPOINTS.CONFIG.NETWORK_MAP;
      case 'rule':
        return API_CONFIG.ENDPOINTS.CONFIG.RULE;
      case 'typology':
        return API_CONFIG.ENDPOINTS.CONFIG.TYPOLOGY;
    }
  }

  async list<T>(
    table: ConfigTable,
    params: PaginationParams,
  ): Promise<PaginatedResponse<T>> {
    const path = `${this.getTablePath(table)}${this.buildQuery(params)}`;
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'GET',
      headers: ConfigApiService.getAuthHeaders(),
    });
    return ConfigApiService.handleResponse<PaginatedResponse<T>>(response);
  }

  async getById<T>(
    table: ConfigTable,
    id: string,
    cfg: string,
  ): Promise<T> {
    const path = `${this.getTablePath(table)}/${encodeURIComponent(id)}/${encodeURIComponent(cfg)}`;
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'GET',
      headers: ConfigApiService.getAuthHeaders(),
    });
    return ConfigApiService.handleResponse<T>(response);
  }

  async create<T>(table: ConfigTable, body: unknown): Promise<T> {
    const path = this.getTablePath(table);
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: ConfigApiService.getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return ConfigApiService.handleResponse<T>(response);
  }

  async update<T>(
    table: ConfigTable,
    id: string,
    cfg: string,
    body: unknown,
  ): Promise<T> {
    const path = `${this.getTablePath(table)}/${encodeURIComponent(id)}/${encodeURIComponent(cfg)}`;
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'PUT',
      headers: ConfigApiService.getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return ConfigApiService.handleResponse<T>(response);
  }

  async delete(
    table: ConfigTable,
    id: string,
    cfg: string,
  ): Promise<void> {
    const path = `${this.getTablePath(table)}/${encodeURIComponent(id)}/${encodeURIComponent(cfg)}`;
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'DELETE',
      headers: ConfigApiService.getAuthHeaders(),
    });
    if (response.status === HTTP_UNAUTHORIZED) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(
        errorData.message ?? `HTTP error! status: ${response.status}`,
      );
    }
  }
}

export const configApi = new ConfigApiService();
