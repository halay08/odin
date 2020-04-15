import {
  DB_RECORD_CLEAR_SAVED_FILTER,
  DB_RECORD_SAVE_FILTER,
  DB_RECORD_TABLE_ADD_COLUMN,
  DB_RECORD_TABLE_BULK_SELECT_ROWS,
  DB_RECORD_TABLE_REMOVE_COLUMN,
  DB_RECORD_TABLE_SELECT_ROW,
  DB_RECORD_TABLE_SET_COLUMNS,
  DB_RECORD_TABLE_SET_CONFIG,
  DB_RECORD_TABLE_SET_DATA,
  RESET_DB_RECORD_TABLE,
} from './constants';

export interface IAddColumnToTable {
  title: string,
  dataIndex: string,
  columnType?: string,
}

export const setTableConfig = (params: any) => {
  return {
    type: DB_RECORD_TABLE_SET_CONFIG,
    params,
  }
};

export const setTableColumns = (columns: any) => {
  return {
    type: DB_RECORD_TABLE_SET_COLUMNS,
    columns,
  }
};

export const addColumnToTable = (params: IAddColumnToTable) => {
  return {
    type: DB_RECORD_TABLE_ADD_COLUMN,
    params,
  }
};

export const removeColumnFromTable = (dataIndex: string) => {
  return {
    type: DB_RECORD_TABLE_REMOVE_COLUMN,
    dataIndex,
  }
};

export const setTableData = (data: any) => {
  return {
    type: DB_RECORD_TABLE_SET_DATA,
    data,
  }
};

export const saveTableFilters = (name: string, params: any) => {
  return {
    type: DB_RECORD_SAVE_FILTER,
    name,
    params,
  }
};


export const selectTableRow = (rowKey: string) => {
  return {
    type: DB_RECORD_TABLE_SELECT_ROW,
    rowKey,
  }
};


export const bulkSelectTableRows = (rowKeys: string[]) => {
  return {
    type: DB_RECORD_TABLE_BULK_SELECT_ROWS,
    rowKeys,
  }
};


export const clearSavedFilter = (params: { name: string }) => {
  return {
    type: DB_RECORD_CLEAR_SAVED_FILTER,
    params,
  }
};

export const resetTableState = () => {
  return {
    type: RESET_DB_RECORD_TABLE,
  }
};

