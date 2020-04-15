export enum SchemaColumnTypes {

  ADDRESS = 'ADDRESS',
  BOOLEAN = 'BOOLEAN',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DATE_TIME = 'DATE_TIME',
  PHONE_NUMBER = 'PHONE_NUMBER',
  PHONE_NUMBER_E164_GB = 'PHONE_NUMBER_E164_GB',
  ALPHA_NUMERICAL = 'ALPHA_NUMERICAL',
  TEXT = 'TEXT',
  TEXT_LONG = 'TEXT_LONG',
  NAME = 'NAME',
  ENUM = 'ENUM',
  UUID = 'UUID',
  PASSWORD = 'PASSWORD',
  CURRENCY = 'CURRENCY', // (16,2)
  PERCENT = 'PERCENT', // (16,2)
  NUMERIC = 'NUMERIC', // (131072, 16383)
  FILE_SINGLE = 'FILE_SINGLE',
  FILE_MULTIPLE = 'FILE_MULTIPLE'

}

export const SCHEMA_COLUMN_TYPE_KEYS = Object.keys(SchemaColumnTypes);
