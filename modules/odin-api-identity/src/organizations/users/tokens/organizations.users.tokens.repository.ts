import { EntityRepository, Repository } from 'typeorm';
import { OrganizationUserTokenEntity } from "@d19n/models/dist/identity/organization/user/token/organization.user.token.entity";

@EntityRepository(OrganizationUserTokenEntity)
export class OrganizationsUsersTokensRepository extends Repository<OrganizationUserTokenEntity> {

}
