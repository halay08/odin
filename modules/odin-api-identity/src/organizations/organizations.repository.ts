import { OrganizationEntity }           from '@d19n/models/dist/identity/organization/organization.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(OrganizationEntity)
export class OrganizationEntityRepository extends Repository<OrganizationEntity> {

    public getByName(name: string): Promise<OrganizationEntity> {

        return this.findOne({ where: { name } });

    }

}
