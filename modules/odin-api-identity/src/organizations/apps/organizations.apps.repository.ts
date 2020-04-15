import { EntityRepository, Repository } from 'typeorm';
import { OrganizationAppEntity }        from "@d19n/models/dist/identity/organization/app/organization.app.entity";

@EntityRepository(OrganizationAppEntity)
export class OrganizationsAppsRepository extends Repository<OrganizationAppEntity> {

}
