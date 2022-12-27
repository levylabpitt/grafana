import React from 'react';
import { useAsync } from 'react-use';

import { SelectableValue, toOption } from '@grafana/data';
import { Select } from '@grafana/ui';

import { QueryWithDefaults } from '../defaults';
import { DB, ResourceSelectorProps } from '../types';

interface TableIndex {
  name: string
  path: string
}

// currently requires hardcoded data. A POST request to /api/ds/query needs to be made for table_index in the db
const table_index: TableIndex[] = [];

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
    const tables = await db.tables(query.dataset);
    return tables.map(toOption);
  }, [query.dataset]);


  // filters anything that doesn't include 'llab' and also maps the label for each column with table_index
  if (state.value) {
    for (let i = 0; i < state.value.length; i++) {
      if (!state.value[i].value.endsWith("_index") && state.value[i].value.startsWith("llab_")) {
        var match = table_index.map(function (o) { return o.path; }).indexOf(state.value[i].value);
        state.value[i].label = match == -1 ? state.value[i].label : table_index[match].name;
      } else {
        state.value.splice(i, 1);
        i--;
      }
    }
  }

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
