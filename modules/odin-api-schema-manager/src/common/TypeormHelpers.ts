import { getConnection } from 'typeorm';

/**
 * standardized way of SELECTING columns for a SQL query
 * @param tableName
 * @param column
 */
const columnName = (
  tableName: string,
  column: { databaseName: string },
) => `${tableName}.${column.databaseName} AS ${tableName}_${column.databaseName}`;

/**
 * databaseName is the database_column_name
 * @param entity
 * @param tableName
 */
export const getEntityColumns = (
  entity: any,
  params?: { tableName?: string, columns?: string[] },
): string => {

  let parsed: string[] = [];
  let columns: string[] = params && params.columns ? params.columns : undefined;

  const metaData = getConnection().getMetadata(entity);

  // for users add default column filters
  if(metaData.targetName === 'OrganizationUserEntity') {
    columns = [ 'firstname', 'lastname', 'id', 'status', 'email' ];
  }


  if(params && columns && params.tableName) {
    // filter columns
    const filtered = metaData.ownColumns.filter((column) => columns.includes(column.databaseName));

    parsed = filtered ? filtered.map(column => columnName(params.tableName, column)) : [];

  } else if(params && params.tableName) {

    parsed = metaData.ownColumns.map(column => columnName(params.tableName, column));

  } else if(columns) {

    parsed = metaData.ownColumns.map(column => column.databaseName);

  } else {

    parsed = metaData.ownColumns.map(column => column.databaseName);

  }

  return parsed.join();

}
