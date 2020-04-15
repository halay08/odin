import { EntityRepository, Repository } from "typeorm";
import { OrganizationUserGroupEntity }  from "@d19n/models/dist/identity/organization/user/group/organization.user.group.entity";

@EntityRepository(OrganizationUserGroupEntity)
export class OrganizationsUsersGroupsRepository extends Repository<OrganizationUserGroupEntity> {
}
