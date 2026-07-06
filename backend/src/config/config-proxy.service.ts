import { Injectable, Logger } from '@nestjs/common';
import { AdminServiceClient } from '../services/admin-service-client.service';

export type ConfigTable = 'network_map' | 'rule' | 'typology';

@Injectable()
export class ConfigProxyService {
  private readonly logger = new Logger(ConfigProxyService.name);

  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  /**
   * List records from a config table (paginated)
   * GET /v1/admin/configuration/{table}?limit=&offset=&sort=&order=&filters=
   */
  async list(
    table: ConfigTable,
    token: string,
    query: Record<string, string | undefined>,
  ): Promise<unknown> {
    const queryString = this.buildQueryString(query);
    const path = `/v1/admin/configuration/${table}${queryString}`;
    this.logger.log(`Listing ${table}: ${path}`);
    return this.adminServiceClient.executeHttpRequest('GET', path, token);
  }

  /**
   * Get a single record by id and cfg
   * GET /v1/admin/configuration/{table}/{id}/{cfg}
   */
  async getById(
    table: ConfigTable,
    id: string,
    cfg: string,
    token: string,
  ): Promise<unknown> {
    const path = `/v1/admin/configuration/${table}/${encodeURIComponent(id)}/${encodeURIComponent(cfg)}`;
    this.logger.log(`Getting ${table} ${id}/${cfg}`);
    return this.adminServiceClient.executeHttpRequest('GET', path, token);
  }

  /**
   * Create a new record
   * POST /v1/admin/configuration/{table}
   */
  async create(
    table: ConfigTable,
    body: unknown,
    token: string,
  ): Promise<unknown> {
    const path = `/v1/admin/configuration/${table}`;
    this.logger.log(`Creating ${table}`);
    return this.adminServiceClient.executeHttpRequest('POST', path, token, body);
  }

  /**
   * Update a record by id and cfg
   * PUT /v1/admin/configuration/{table}/{id}/{cfg}
   */
  async update(
    table: ConfigTable,
    id: string,
    cfg: string,
    body: unknown,
    token: string,
  ): Promise<unknown> {
    const path = `/v1/admin/configuration/${table}/${encodeURIComponent(id)}/${encodeURIComponent(cfg)}`;
    this.logger.log(`Updating ${table} ${id}/${cfg}`);
    return this.adminServiceClient.executeHttpRequest('PUT', path, token, body);
  }

  /**
   * Delete a record by id and cfg
   * DELETE /v1/admin/configuration/{table}/{id}/{cfg}
   */
  async delete(
    table: ConfigTable,
    id: string,
    cfg: string,
    token: string,
  ): Promise<unknown> {
    const path = `/v1/admin/configuration/${table}/${encodeURIComponent(id)}/${encodeURIComponent(cfg)}`;
    this.logger.log(`Deleting ${table} ${id}/${cfg}`);
    return this.adminServiceClient.executeHttpRequest('DELETE', path, token);
  }

  private buildQueryString(query: Record<string, string | undefined>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }
}
