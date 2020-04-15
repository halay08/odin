import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { EntityRepository, Repository }         from 'typeorm';

@EntityRepository(OrganizationUserRbacPermissionEntity)
export class OrganizationsUsersRbacPermissionsRepository extends Repository<OrganizationUserRbacPermissionEntity> {


}
