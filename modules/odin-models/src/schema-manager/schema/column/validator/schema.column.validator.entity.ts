import { IsIn } from 'class-validator';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { SchemaColumnEntity } from "../schema.column.entity";
import { SCHEMA_COLUMN_VALIDATOR_TYPE_KEYS } from "./schema.column.validator.types";
import { OrganizationEntity } from "../../../../identity/organization/organization.entity";
import { Base } from "../../../../Base";

@Entity({ name: 'schemas_columns_validators' })
@Index([ 'organization', 'column' ])
@Index([ "organization", "column", "type" ], { unique: true })
export class SchemaColumnValidatorEntity extends Base {

    //
    // Relationships
    //
    @ManyToOne(type => OrganizationEntity, { onDelete: "CASCADE" })
    public organization: OrganizationEntity;

    @ManyToOne(type => SchemaColumnEntity, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
    })
    public column: SchemaColumnEntity;

    //
    // Properties
    //
    @IsIn(SCHEMA_COLUMN_VALIDATOR_TYPE_KEYS)
    @Column({ type: 'varchar', nullable: false })
    public type: string;

}
