import { EntityRepository, Repository } from "typeorm";
import { SchemaColumnOptionEntity }     from "@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity";

/**
 * Columns entity repository.
 */
@EntityRepository(SchemaColumnOptionEntity)
export class SchemasColumnsOptionsRepository extends Repository<SchemaColumnOptionEntity> {
}
