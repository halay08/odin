import { SchemaColumnTypes } from '../types/schema.column.types';

class SchemaColumnValidator {
  public type: 'static';
  public name: string;
  public error: string;
  public pattern: string;
  public columnTypes: string[]
}

export enum SchemaColumnValidatorEnums {
  ALPHA_NUMERICAL = 'ALPHA_NUMERICAL',
  EMAIL = 'EMAIL',
  NAME = 'NAME',
  NUMBER = 'NUMBER',
  NUMBER_PERCENT = 'NUMBER_PERCENT',
  NUMBER_CURRENCY = 'NUMBER_CURRENCY',
  PHONE = 'PHONE',
  PHONE_E164_GB = 'PHONE_E164_GB',
  REQUIRED = 'REQUIRED',
  UNIQUE = 'UNIQUE',
  TEXT = 'TEXT',
  TEXT_LONG = 'TEXT_LONG',
  DATE = 'DATE',
  DATE_TIME = 'DATE_TIME',
  UUID = 'UUID',
  BOOLEAN = 'BOOLEAN',
  NUMERIC = 'NUMERIC',
}

export const SchemaColumnValidatorTypes: { [name: string]: SchemaColumnValidator } = {

  // characters and/or numbers
  ALPHA_NUMERICAL: {
    type: 'static',
    name: 'ALPHA_NUMERICAL',
    error: '',
    pattern: '^[a-zA-Z0-9]+$',
    columnTypes: [
      SchemaColumnTypes.ALPHA_NUMERICAL,
    ],

  },
  // email
  EMAIL: {
    type: 'static',
    name: 'EMAIL',
    error: '',
    pattern: '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])',
    columnTypes: [
      SchemaColumnTypes.EMAIL,
    ],
  },
  // Mr. Tester McTest PhD, LLC, DBA
  NAME: {
    type: 'static',
    name: 'NAME',
    error: '',
    pattern: '^[a-zA-Z0-9., -]+$',
    columnTypes: [ 'NAME' ],
  },
  // 0-9
  NUMBER: {
    type: 'static',
    name: 'NUMBER',
    error: 'must be a number',
    pattern: '^-?[0-9]+$',
    columnTypes: [

      SchemaColumnTypes.NUMBER,
    ],
  },
  NUMBER_PERCENT: {
    type: 'static',
    name: 'NUMBER_PERCENT',
    error: 'Number (3,2) decimal places 100.00, 99.99, 25',
    pattern: '^-?\\d+[0-9]{0,3}(\\.[0-9]{1,2})?$',
    columnTypes: [
      SchemaColumnTypes.PERCENT,
    ],
  },
  NUMBER_CURRENCY: {
    type: 'static',
    name: 'NUMBER_CURRENCY',
    error: 'Number (16,2) decimal places 100, 100.05, 99.99, 0.99',
    pattern: '^-?\\d+[0-9]{0,16}(\\.[0-9]{1,2})?$',
    columnTypes: [
      SchemaColumnTypes.CURRENCY,
    ],
  },

  NUMERIC: {
    type: 'static',
    name: 'NUMERIC',
    error: 'up to 131072 digits before the decimal point; up to 16383 digits after the decimal point\n',
    pattern: '^-?\\d+[0-9]{0,131072}(\\.[0-9]{1,16383})?$',
    columnTypes: [
      SchemaColumnTypes.NUMERIC,
    ],
  },

  PHONE: {
    type: 'static',
    name: 'PHONE',
    error: 'not a valid phone number',
    pattern: '^(((\\+44\\s?\\d{4}|\\(?0\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?\\d{3}|\\(?0\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?\\d{2}|\\(?0\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))(\\s?\\#(\\d{4}|\\d{3}))?$',
    columnTypes: [
      SchemaColumnTypes.PHONE_NUMBER,
    ],
  },

  PHONE_E164_GB:{
    type: 'static',
    name: 'PHONE_E164_GB',
    error: 'not a valid GB E.164 phone number',
    pattern: '^\\+44\\d{1,14}$',
    columnTypes: [
      SchemaColumnTypes.PHONE_NUMBER_E164_GB,
    ],
  },


  // requires at least one character
  REQUIRED: {
    type: 'static',
    name: 'REQUIRED',
    error: '',
    pattern: '.+', // any values
    columnTypes: [
      SchemaColumnTypes.ADDRESS,
      SchemaColumnTypes.BOOLEAN,
      SchemaColumnTypes.EMAIL,
      SchemaColumnTypes.NUMBER,
      SchemaColumnTypes.DATE,
      SchemaColumnTypes.DATE_TIME,
      SchemaColumnTypes.PHONE_NUMBER,
      SchemaColumnTypes.ALPHA_NUMERICAL,
      SchemaColumnTypes.TEXT,
      SchemaColumnTypes.NAME,
      SchemaColumnTypes.ENUM,
      SchemaColumnTypes.UUID,
      SchemaColumnTypes.PASSWORD,
      SchemaColumnTypes.CURRENCY,
      SchemaColumnTypes.PERCENT,
    ],
  },
  UNIQUE: {
    type: 'static',
    name: 'UNIQUE',
    error: '',
    pattern: '.*', // any values
    columnTypes: [
      SchemaColumnTypes.ADDRESS,
      SchemaColumnTypes.BOOLEAN,
      SchemaColumnTypes.EMAIL,
      SchemaColumnTypes.NUMBER,
      SchemaColumnTypes.DATE,
      SchemaColumnTypes.DATE_TIME,
      SchemaColumnTypes.PHONE_NUMBER,
      SchemaColumnTypes.ALPHA_NUMERICAL,
      SchemaColumnTypes.TEXT,
      SchemaColumnTypes.NAME,
      SchemaColumnTypes.ENUM,
      SchemaColumnTypes.UUID,
      SchemaColumnTypes.CURRENCY,
      SchemaColumnTypes.PERCENT,
    ],
  },
  TEXT: {
    type: 'static',
    name: 'TEXT',
    error: '',
    pattern: '.*', // TODO values to have a max length setting in the future
    columnTypes: [
      SchemaColumnTypes.TEXT,
    ],
  },
  TEXT_LONG: {
    type: 'static',
    name: 'TEXT_LONG',
    error: '',
    pattern: '.*', // TODO values to have a max length setting in the future
    columnTypes: [
      SchemaColumnTypes.TEXT_LONG,
    ],
  },
  DATE: {
    type: 'static',
    name: 'DATE',
    error: '',
    pattern: '.*',
    columnTypes: [
      SchemaColumnTypes.DATE,
    ],
  },
  DATE_TIME: {
    type: 'static',
    name: 'DATE_TIME',
    error: '',
    pattern: '.*',
    columnTypes: [
      SchemaColumnTypes.DATE_TIME,
    ],
  },
  UUID: {
    type: 'static',
    name: 'UUID',
    error: 'must be a uuid',
    pattern: '^[0-9a-fA-F]{8}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{12}$',
    columnTypes: [
      SchemaColumnTypes.UUID,
    ],
  },

};

export const SCHEMA_COLUMN_VALIDATOR_TYPE_KEYS = Object.keys(SchemaColumnValidatorTypes);
