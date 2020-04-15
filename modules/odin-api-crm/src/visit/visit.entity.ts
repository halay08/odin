import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Outcome',
        label: 'outcome',
        description: 'the outcome of the visit',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [
            { label: 'Interested', value: 'INTERESTED', position: 0 },
            { label: 'In contract', value: 'IN_CONTRACT', position: 1 },
            { label: 'No answer', value: 'NO_ANSWER', position: 2 },
            { label: 'Comeback later', value: 'COMEBACK_LATER', position: 3 },
            { label: 'Not interested', value: 'NOT_INTERESTED', position: 4 },
            { label: 'Do not knock', value: 'DO_NOT_KNOCK', position: 5 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'FollowUpDate',
        label: 'follow up date',
        description: 'The to follow up on',
        type: SchemaColumnTypes.DATE,
        position: 1,
        isStatic: true,
        isHidden: false,
        defaultValue: null,
        isTitleColumn: true,
        validators: [
            SchemaColumnValidatorTypes.DATE.name,
        ],
    },
    {
        name: 'UDPRN',
        label: 'udprn',
        description: 'The Unique Delivery Point Reference Number',
        type: SchemaColumnTypes.NUMBER,
        position: 2,
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
        position: 3,
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

];

