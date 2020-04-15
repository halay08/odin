import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEnums } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Feature',
        label: 'feature',
        description: 'The feature',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Duct', value: 'DUCT', position: 5 },
            { label: 'Duct lead in', value: 'DUCT_LEAD_IN', position: 5 },
            { label: 'Duct sub duct', value: 'DUCT_SUB_DUCT', position: 5 },
            { label: 'Pole', value: 'POLE', position: 5 },
            { label: 'Rope', value: 'ROPE', position: 5 },
            { label: 'Closure', value: 'CLOSURE', position: 5 },
            { label: 'Cable', value: 'CABLE', position: 5 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'AvailableFrom',
        label: 'available from',
        description: 'item is available from this date',
        type: SchemaColumnTypes.DATE,
        position: 5,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [
            SchemaColumnValidatorEnums.REQUIRED,
            SchemaColumnValidatorEnums.DATE,
        ],
    },
    {
        name: 'AvailableTo',
        label: 'available to',
        description: 'item is available to this date',
        type: SchemaColumnTypes.DATE,
        position: 6,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [
            SchemaColumnValidatorEnums.DATE,
        ],
    },
    {
        name: 'ManufacturerSku',
        label: 'external ref',
        description: 'The external id of the feature',
        type: SchemaColumnTypes.NUMBER,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [],
        validators: [],
    },
];
