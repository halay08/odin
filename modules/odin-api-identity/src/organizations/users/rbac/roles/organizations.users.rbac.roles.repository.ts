import { OrganizationUserRbacRoleEntity } from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { EntityRepository, Repository }   from 'typeorm';

@EntityRepository(OrganizationUserRbacRoleEntity)
export class OrganizationsUsersRbacRolesRepository extends Repository<OrganizationUserRbacRoleEntity> {


}
