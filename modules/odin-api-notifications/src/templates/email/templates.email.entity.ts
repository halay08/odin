import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Length, IsEnum } from "class-validator";
import { Base } from "@d19n/models/dist/Base";
import { OrganizationEntity } from "@d19n/models/dist/identity/organization/organization.entity";

export enum NotificationServiceEnum {
    SENDGRID = 'SENDGRID',
}


@Entity({ name: 'organizations_email_templates' })
@Index([ 'organization', 'name' ], { unique: true })
export class TemplatesEmailEntity extends Base {

    //
    // Relationships
    //
    @ManyToOne(type => OrganizationEntity, { onDelete: "CASCADE" })
    public organization?: OrganizationEntity;

    //
    // Properties
    //
    @ApiProperty()
    @Length(1, 55)
    @Column({ type: 'varchar', length: 55, nullable: false })
    public name: string;

    @ApiProperty()
    @Length(1, 55)
    @Column({ type: 'varchar', length: 55, nullable: false })
    public label: string;

    @ApiProperty()
    @Length(1, 55)
    @Column({ type: 'varchar', length: 55, nullable: true })
    public description: string;

    @ApiProperty()
    @IsEnum(NotificationServiceEnum)
    @Column({ type: 'varchar', length: 200, nullable: true })
    public service: NotificationServiceEnum;

    @ApiProperty()
    @Column({ type: 'varchar', length: 500, nullable: true })
    public templateId: string;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    public dynamicTemplateData: object


}
