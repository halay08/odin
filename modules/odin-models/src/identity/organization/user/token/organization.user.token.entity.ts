import { ApiProperty }               from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';
import { OrganizationEntity } from "../../organization.entity";
import { OrganizationUserEntity } from "../organization.user.entity";
import { Base } from "../../../../Base";

@Entity('organizations_users_rbac_tokens')
export class OrganizationUserTokenEntity extends Base {

    @ManyToOne(type => OrganizationEntity)
    public organization: OrganizationEntity;

    @ManyToOne(type => OrganizationUserEntity, { onDelete: "CASCADE" })
    public user: OrganizationUserEntity;

    @ApiProperty()
    @Column({ length: 255 })
    public token: string;

    @ApiProperty()
    @Column({ length: 255 })
    public name: string;

    @ApiProperty()
    @Column({ length: 255 })
    public description: string;

}
