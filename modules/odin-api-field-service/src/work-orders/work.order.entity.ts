import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'the type of work order',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [
            { label: 'Install', value: 'INSTALL', position: 1 },
            { label: 'Service', value: 'SERVICE', position: 2 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'SurveyDate',
        label: 'survey date',
        description: 'the survey date for the work order',
        type: SchemaColumnTypes.DATE,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: null,
        validators: [ SchemaColumnValidatorTypes.DATE.name ],
    },
    {
        name: 'BuildEndDate',
        label: 'build end date',
        description: 'the build end date for the work order',
        type: SchemaColumnTypes.DATE,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: null,
        validators: [ SchemaColumnValidatorTypes.DATE.name ],
    },
    {
        name: 'RequestedDeliveryDate',
        label: 'requested delivery date',
        description: 'the requested delivery date for the work order',
        type: SchemaColumnTypes.DATE,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: null,
        validators: [ SchemaColumnValidatorTypes.DATE.name ],
    },
];
