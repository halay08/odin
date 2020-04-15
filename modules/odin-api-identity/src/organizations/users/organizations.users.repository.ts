import { OrganizationUserEntity }       from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(OrganizationUserEntity)
export class OrganizationUserEntityRepository extends Repository<OrganizationUserEntity> {

}
