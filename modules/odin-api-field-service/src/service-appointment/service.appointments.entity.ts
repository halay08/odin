import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';
import { SchemaColumnCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto";
import { SchemaColumnTypes } from "@d19n/models/dist/schema-manager/schema/column/types/schema.column.types";


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Date',
        label: 'date of service appointment',
        description: 'The date at which the appointment is scheduled',
        type: SchemaColumnTypes.DATE,
        position: 0,
        isStatic: true,
        isHidden: false,
        defaultValue: null,
        isTitleColumn: true,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.DATE.name,
        ],
    },
    {
        name: 'TimeBlock',
        label: 'type of service appointment',
        description: 'The time of day for the appointment',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        defaultValue: null,
        isTitleColumn: false,
        options: [
            { label: "AM", value: "AM", position: 0 },
            { label: "PM", value: "PM", position: 1 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },

];
