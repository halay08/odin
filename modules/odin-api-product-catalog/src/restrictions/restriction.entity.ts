import { SchemaColumnValidatorTypes } from "@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types";
import { SchemaColumnCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto";
import { SchemaColumnTypes } from "@d19n/models/dist/schema-manager/schema/column/types/schema.column.types";


export class RestrictionEntity {

    public name: string;
    public type: string;
    public condition: string;
    public conditionValue: string;
    public matchSchemaColumnRef: string;

}

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'type of the restriction',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'ALLOW',
        options: [
            { label: 'Allow', value: 'ALLOW', position: 0 },
            { label: 'Deny', value: 'DENY', position: 1 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },
    {
        name: 'Condition',
        label: 'condition',
        description: 'condition of the restriction',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'IS_EQUAL_TO',
        options: [
            { label: 'Is equal to', value: 'IS_EQUAL_TO', position: 0 },
            { label: 'Is not equal to', value: 'IS_NOT_EQUAL_TO', position: 1 },
            { label: 'Is greater than', value: 'IS_GREATER_THAN', position: 2 },
            { label: 'Is less than', value: 'IS_LESS_THAN', position: 3 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },
    {
        name: 'ConditionValue',
        label: 'condition value',
        description: 'condition value of the restriction',
        type: SchemaColumnTypes.TEXT,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.TEXT.name,
        ],
    },
    {
        name: 'SchemaColumnRef',
        label: 'schema column ref',
        description: 'schema column reference id',
        // lookUpFrom: 'SchemasColumns',
        // fillValueFrom: 'id'
        type: SchemaColumnTypes.UUID,
        position: 6,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.UUID.name,
        ],
    },
];
