import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'FullAddress',
        label: 'full address',
        description: 'The full address of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: true,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name, SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'AddressLine1',
        label: 'address line 1',
        description: 'The first line of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: true,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name, SchemaColumnValidatorTypes.TEXT.name ],
    }, {
        name: 'AddressLine2',
        label: 'address line 2',
        description: 'The second line of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 4,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'AddressLine3',
        label: 'address line 3',
        description: 'The third line of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 5,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'City',
        label: 'city',
        description: 'The city of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 6,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name, SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'PostCode',
        label: 'post code',
        description: 'The post code of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 7,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name, SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'PostTown',
        label: 'post town',
        description: 'The post town of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 7,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name, SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'CountryCode',
        label: 'country code',
        description: 'The country code of the premise',
        type: SchemaColumnTypes.TEXT,
        position: 8,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: 'GB',
        options: [
            { label: 'Great Britain', value: 'GB', position: 0 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'UDPRN',
        label: 'udprn',
        description: 'The Unique Delivery Point Reference Number',
        type: SchemaColumnTypes.NUMBER,
        position: 10,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.UNIQUE.name,
            SchemaColumnValidatorTypes.NUMBER.name,
        ],
    },
    {
        name: 'UMPRN',
        label: 'umprn',
        description: 'The Unique Multiple Premise Reference Number',
        type: SchemaColumnTypes.NUMBER,
        position: 11,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.UNIQUE.name,
            SchemaColumnValidatorTypes.NUMBER.name,
        ],
    },
    {
        name: 'OPSS',
        label: 'opss',
        description: 'The encrypted sales status for the premise',
        type: SchemaColumnTypes.TEXT,
        position: 11,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorTypes.TEXT.name,
        ],
    },
    {
        name: 'VisitOutcome',
        label: 'visit outcome',
        description: 'The last visit outcome for the premise',
        type: SchemaColumnTypes.TEXT,
        position: 11,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorTypes.TEXT.name,
        ],
    },
    {
        name: 'VisitFollowUpDate',
        label: 'visit follow up date',
        description: 'The date to follow up',
        type: SchemaColumnTypes.TEXT,
        position: 11,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorTypes.TEXT.name,
        ],
    },
    {
        name: 'LastVisitBy',
        label: 'last visited by',
        description: 'The last user to visit the premise',
        type: SchemaColumnTypes.TEXT,
        position: 11,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorTypes.TEXT.name,
        ],
    },
];
