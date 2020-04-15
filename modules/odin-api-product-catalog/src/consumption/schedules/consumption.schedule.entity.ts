import { SchemaColumnValidatorTypes } from "@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types";
import { SchemaColumnCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto";
import { SchemaColumnTypes } from "@d19n/models/dist/schema-manager/schema/column/types/schema.column.types";

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Name',
        label: 'name',
        description: 'name of the schedule',
        type: SchemaColumnTypes.TEXT,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: true,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.UNIQUE.name,
        ],
    },
    {
        name: 'Description',
        label: 'description',
        description: 'description of the schedule',
        type: SchemaColumnTypes.TEXT,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'Category',
        label: 'category',
        description: 'category of the schedule',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Landline', value: 'LANDLINE', position: 0 },
            { label: 'Mobile', value: 'MOBILE', position: 1 },
            { label: 'International', value: 'INTERNATIONAL', position: 2 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'Type',
        label: 'type',
        description: 'defines how rate tiers are calculated',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'DIRECT',
        options: [
            { label: 'Range', value: 'RANGE', position: 0 }, // The schedule prices only using the tier that applies to
                                                             // the usage quantity
            { label: 'Slab', value: 'SLAB', position: 1 }, // Usage within a given bound receives pricing equal to its
                                                           // tier’s value
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },
    {
        name: 'UnitOfMeasure',
        label: 'unit of measure',
        description: 'usage quantities and rates apply to the unit of measurement',
        type: SchemaColumnTypes.ENUM,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Hour', value: 'HOUR', position: 0 },
            { label: 'Minute', value: 'MINUTE', position: 1 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },
];

