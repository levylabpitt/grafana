import { DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { LanguageDefinition } from '@grafana/experimental';
import { SqlDatasource } from 'app/features/plugins/sql/datasource/SqlDatasource';
import { DB, SQLQuery, SQLSelectableValue } from 'app/features/plugins/sql/types';
import { formatSQL } from 'app/features/plugins/sql/utils/formatSQL';
import { TemplateSrv } from 'app/features/templating/template_srv';

import { PostgresQueryModel } from './PostgresQueryModel';
import { getSchema, getTimescaleDBVersion, getVersion, showTables } from './postgresMetaQuery';
import { fetchColumns, fetchTables, getSqlCompletionProvider } from './sqlCompletionProvider';
import { getFieldConfig, toRawSql } from './sqlUtil';
import { PostgresOptions } from './types';

export class PostgresDatasource extends SqlDatasource {
  sqlLanguageDefinition: LanguageDefinition | undefined = undefined;

  constructor(instanceSettings: DataSourceInstanceSettings<PostgresOptions>) {
    super(instanceSettings);
  }

  getQueryModel(target?: SQLQuery, templateSrv?: TemplateSrv, scopedVars?: ScopedVars): PostgresQueryModel {
    return new PostgresQueryModel(target, templateSrv, scopedVars);
  }

  async getVersion(): Promise<string> {
    const value = await this.runSql<{ version: number }>(getVersion());
    const results = value.fields.version?.values;

    if (!results) {
      return '';
    }

    return results[0].toString();
  }

  async getTimescaleDBVersion(): Promise<string | undefined> {
    const value = await this.runSql<{ extversion: string }>(getTimescaleDBVersion());
    const results = value.fields.extversion?.values;

    if (!results) {
      return undefined;
    }

    return results[0];
  }

  async fetchTables(): Promise<string[]> {
    const tables = await this.runSql<{ table: string[] }>(showTables(), { refId: 'tables' });
    return tables.fields.table?.values.flat() ?? [];
  }

  getSqlLanguageDefinition(db: DB): LanguageDefinition {
    if (this.sqlLanguageDefinition !== undefined) {
      return this.sqlLanguageDefinition;
    }

    const args = {
      getColumns: { current: (query: SQLQuery) => fetchColumns(db, query) },
      getTables: { current: () => fetchTables(db) },
    };
    this.sqlLanguageDefinition = {
      id: 'pgsql',
      completionProvider: getSqlCompletionProvider(args),
      formatter: formatSQL,
    };
    return this.sqlLanguageDefinition;
  }

  async fetchFields(query: SQLQuery): Promise<SQLSelectableValue[]> {
    // to-do: create a type for schema
    // @ts-ignore
    const schema: any = await this.runSql<{ column: string; type: string }>(
      query.llab && query.rawSql ? query.rawSql : getSchema(query.table),
      { refId: 'columns' }
    );
    const result: SQLSelectableValue[] = [];

    // if statemnt for the manual llab structure and the default grafana structure
    if (query.llab === 1 && query.rawSql) {
      for (let i = 0; i < schema.length; i++) {
        const type = schema.fields.name.type;
        const name = schema.fields.name.values.get(i);
        const units = schema.fields.units.values.get(i);
        const path = schema.fields.path.values.get(i);
        result.push({ label: `${name}${units ? ` (${units})` : ''}`, value: path, type, ...getFieldConfig(type) });
      }
    } else if (query.llab === 2 && query.rawSql) {
      for (let i = 0; i < schema.length; i++) {
        const type = schema.fields.name.type;
        result.push({
          label: schema.fields.name.values.get(i),
          value: schema.fields.path.values.get(i),
          type,
          ...getFieldConfig(type),
        });
      }
    } else {
      for (let i = 0; i < schema.length; i++) {
        const column = schema.fields.column.values[i];
        const type = schema.fields.type.values[i];
        result.push({ label: column, value: column, type, ...getFieldConfig(type) });
      }
    }
    return result;
  }

  getDB(): DB {
    if (this.db !== undefined) {
      return this.db;
    }
    return {
      init: () => Promise.resolve(true),
      datasets: () => Promise.resolve([]),
      tables: () => this.fetchTables(),
      getEditorLanguageDefinition: () => this.getSqlLanguageDefinition(this.db),
      fields: async (query: SQLQuery) => {
        if (!query?.table) {
          return [];
        }
        return this.fetchFields(query);
      },
      validateQuery: (query) =>
        Promise.resolve({ isError: false, isValid: true, query, error: '', rawSql: query.rawSql }),
      dsID: () => this.id,
      toRawSql,
      lookup: async () => {
        const tables = await this.fetchTables();
        return tables.map((t) => ({ name: t, completion: t }));
      },
    };
  }
}
