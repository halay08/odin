import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(SchemaTypeEntity)
export class SchemasTypesRepository extends Repository<SchemaTypeEntity> {
}
