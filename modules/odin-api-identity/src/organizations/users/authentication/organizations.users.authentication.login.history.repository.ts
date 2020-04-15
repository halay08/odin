import { EntityRepository, Repository }             from "typeorm";
import { OrganizationUserEntityLoginHistoryEntity } from "./organizations.users.authentication.login.history.entity";

/**
 * Columns entity repository.
 */
@EntityRepository(OrganizationUserEntityLoginHistoryEntity)
export class OrganizationUserEntityLoginHistoryRepository extends Repository<OrganizationUserEntityLoginHistoryEntity> {
}

