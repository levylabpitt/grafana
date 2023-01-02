import React from 'react';
import { useAsync } from 'react-use';

import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';

import { applyQueryDefaults, QueryWithDefaults } from '../defaults';
import { DB, ResourceSelectorProps, SQLQuery } from '../types';

interface TableSelectorProps extends ResourceSelectorProps {
  db: DB;
  value: string | null;
  query: QueryWithDefaults;
  onChange: (v: SelectableValue) => void;
  forceFetch?: boolean;
}

export const TableSelector: React.FC<TableSelectorProps> = ({ db, query, value, className, onChange, forceFetch }) => {
  const state = useAsync(async () => {
    if (!query.dataset && !forceFetch) {
      return [];
    }
    await db.tables(query.dataset);
    const table_index = await db.fields(
      applyQueryDefaults({
        rawSql: `SELECT name, path FROM table_index`,
        table: 'table_index',
        llab: 2,
        refId: 'tables',
      } as SQLQuery)
    );
    return table_index;
  }, [query.dataset]);

  return (
    <Select
      className={className}
      disabled={state.loading}
      aria-label="Table selector"
      value={value}
      options={state.value}
      onChange={onChange}
      isLoading={state.loading}
      menuShouldPortal={true}
      placeholder={state.loading ? 'Loading tables' : 'Select table'}
    />
  );
};
