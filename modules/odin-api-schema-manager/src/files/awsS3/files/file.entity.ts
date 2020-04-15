import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [

  {
    name: 'DataStore',
    label: 'data store',
    description: 'the storage provider',
    type: SchemaColumnTypes.ENUM,
    position: 0,
    isStatic: true,
    isHidden: false,
    isTitleColumn: false,
    isVisibleInTables: false,
    defaultValue: 'AWS_S3',
    options: [
      { label: 'AWS S3', value: 'AWS_S3', position: 0 },
    ],
    validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
  },
  {
    name: 'Bucket',
    label: 'bucket',
    description: 'the bucket for aws S3',
    type: SchemaColumnTypes.TEXT,
    position: 1,
    isStatic: true,
    isHidden: false,
    isTitleColumn: false,
    isVisibleInTables: false,
    defaultValue: '',
    validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
  },
  {
    name: 'Key',
    label: 'key',
    description: 'the object key for aws S3',
    type: SchemaColumnTypes.TEXT,
    position: 2,
    isStatic: true,
    isHidden: false,
    isTitleColumn: false,
    isVisibleInTables: false,
    defaultValue: '',
    validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
  },
  {
    name: 'Url',
    label: 'url',
    description: 'the full url for the object in an S3 bucket',
    type: SchemaColumnTypes.TEXT,
    position: 3,
    isStatic: true,
    isHidden: false,
    isTitleColumn: false,
    isVisibleInTables: false,
    defaultValue: '',
    validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
  },
  {
    name: 'Mimetype',
    label: 'mime type',
    description: 'the mimetype for the file',
    type: SchemaColumnTypes.TEXT,
    position: 4,
    isStatic: true,
    isHidden: false,
    isTitleColumn: false,
    isVisibleInTables: false,
    defaultValue: '',
    validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
  },
];

