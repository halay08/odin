import { Column, Entity, Index, ManyToOne } from "typeorm";
import { OrganizationUserEntity }           from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { Base }                             from "@d19n/models/dist/Base";
import { OrganizationEntity }               from "@d19n/models/dist/identity/organization/organization.entity";

@Entity({ name: 'organizations_users_logins' })
@Index([ 'organization', 'user' ],)
export class OrganizationUserEntityLoginHistoryEntity extends Base {

    @ManyToOne(type => OrganizationEntity, organization => organization.roles, {
        onDelete: "CASCADE",
        eager: true
    })
    public organization?: OrganizationEntity;


    @ManyToOne(type => OrganizationUserEntity, { onDelete: "CASCADE" })
    public user?: OrganizationUserEntity;

    @Column({ nullable: true })
    public activity: string; // login | reset_password

    @Column({ nullable: true })
    public ipAddress: string;

}
