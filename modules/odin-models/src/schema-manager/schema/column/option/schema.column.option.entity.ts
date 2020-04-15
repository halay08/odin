import { Column, Entity, Index, ManyToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Length } from "class-validator";
import { Base } from "../../../../Base";
import { OrganizationEntity } from "../../../../identity/organization/organization.entity";
import { SchemaColumnEntity } from "../schema.column.entity";


/**
 * Database entity for schema column option.
 */
@Entity({ name: 'schemas_columns_options' })
@Index([ 'organization', 'column' ])
@Index([ "organization", "column", "label", "value" ], { unique: true })
export class SchemaColumnOptionEntity extends Base {

    //
    // Relationships
    //
    @ManyToOne(type => OrganizationEntity, { onDelete: "CASCADE" })
    public organization: OrganizationEntity;

    @ManyToOne(type => SchemaColumnEntity, { onDelete: 'CASCADE', nullable: false })
    public column: SchemaColumnEntity;

    //
    // Properties
    //
    @ApiProperty()
    @IsNumber()
    @Column({ type: "integer", nullable: false })
    public position: number;

    @ApiProperty()
    @Length(1, 32)
    @Column({ type: "varchar", length: 32, nullable: false })
    public label: string;

    @ApiProperty()
    @Length(1, 32)
    @Column({ type: "varchar", length: 32, nullable: false })
    public value: string;

}
