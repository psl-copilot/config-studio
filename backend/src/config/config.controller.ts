import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ConfigProxyService, type ConfigTable } from './config-proxy.service';
import { TazamaAuthGuard } from '../auth/tazama-auth.guard';
import { User } from '../auth/user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';

const TABLES: Record<string, ConfigTable> = {
  'network-map': 'network_map',
  'network_map': 'network_map',
  rule: 'rule',
  typology: 'typology',
};

@Controller('config')
@UseGuards(TazamaAuthGuard)
export class ConfigController {
  constructor(private readonly configProxyService: ConfigProxyService) {}

  /**
   * List records for a table (paginated)
   * GET /config/:table?limit=&offset=&sort=&order=&filters=
   */
  @Get(':table')
  async list(
    @Param('table') tableParam: string,
    @Query() query: Record<string, string>,
    @User() user: AuthenticatedUser,
  ) {
    const table = this.resolveTable(tableParam);
    return this.configProxyService.list(
      table,
      user.token.tokenString,
      query,
    );
  }

  /**
   * Get a single record by id and cfg
   * GET /config/:table/:id/:cfg
   */
  @Get(':table/:id/:cfg')
  async getById(
    @Param('table') tableParam: string,
    @Param('id') id: string,
    @Param('cfg') cfg: string,
    @User() user: AuthenticatedUser,
  ) {
    const table = this.resolveTable(tableParam);
    return this.configProxyService.getById(table, id, cfg, user.token.tokenString);
  }

  /**
   * Create a new record
   * POST /config/:table
   */
  @Post(':table')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('table') tableParam: string,
    @Body() body: unknown,
    @User() user: AuthenticatedUser,
  ) {
    const table = this.resolveTable(tableParam);
    return this.configProxyService.create(table, body, user.token.tokenString);
  }

  /**
   * Update a record by id and cfg
   * PUT /config/:table/:id/:cfg
   */
  @Put(':table/:id/:cfg')
  async update(
    @Param('table') tableParam: string,
    @Param('id') id: string,
    @Param('cfg') cfg: string,
    @Body() body: unknown,
    @User() user: AuthenticatedUser,
  ) {
    const table = this.resolveTable(tableParam);
    return this.configProxyService.update(
      table,
      id,
      cfg,
      body,
      user.token.tokenString,
    );
  }

  /**
   * Delete a record by id and cfg
   * DELETE /config/:table/:id/:cfg
   */
  @Delete(':table/:id/:cfg')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('table') tableParam: string,
    @Param('id') id: string,
    @Param('cfg') cfg: string,
    @User() user: AuthenticatedUser,
  ) {
    const table = this.resolveTable(tableParam);
    return this.configProxyService.delete(table, id, cfg, user.token.tokenString);
  }

  private resolveTable(tableParam: string): ConfigTable {
    const table = TABLES[tableParam];
    if (!table) {
      throw new Error(`Invalid table: ${tableParam}`);
    }
    return table;
  }
}
