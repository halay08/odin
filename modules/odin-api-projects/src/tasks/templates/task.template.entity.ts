import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEnums } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'The type of task',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Splice', value: 'SPLICE', position: 0 },
            { label: 'Test', value: 'TEST', position: 1 },
            { label: 'Pull', value: 'PULL', position: 2 },
            { label: 'Blow', value: 'BLOW', position: 3 },
            { label: 'Deploy', value: 'DEPLOY', position: 4 },
            { label: 'Admin', value: 'ADMIN', position: 5 },
            { label: 'Plan', value: 'PLAN', position: 6 },
            { label: 'Survey', value: 'SURVEY', position: 7 },
            { label: 'Design', value: 'DESIGN', position: 8 },
            { label: 'Clear', value: 'CLEAR', position: 9 },
        ],
        validators: [],
    },
    {
        name: 'Category',
        label: 'category',
        description: 'The category of task',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Closure', value: 'CLOSURE', position: 0 },
            { label: 'Chamber', value: 'CHAMBER', position: 1 },
            { label: 'Pole', value: 'POLE', position: 2 },
            { label: 'Cable', value: 'CABLE', position: 6 },
            { label: 'Duct', value: 'DUCT', position: 7 },
            { label: 'Rope', value: 'ROPE', position: 8 },
            { label: 'As-built', value: 'AS_BUILT', position: 9 },
            { label: 'Reservation', value: 'RESERVATION', position: 10 },
            { label: 'Default', value: 'DEFAULT', position: 10 },
        ],
        validators: [],
    },
    {
        name: 'Description',
        label: 'description',
        description: 'The description of the task',
        type: SchemaColumnTypes.TEXT_LONG,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [],
        validators: [],
    },
    {
        name: 'Position',
        label: 'position',
        description: 'The position of the task',
        type: SchemaColumnTypes.NUMBER,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [],
        validators: [
            SchemaColumnValidatorEnums.NUMBER,
        ],
    },
];
