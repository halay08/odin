import { OrganizationUserEntity } from '../../identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '../../schema-manager/db/record/dto/db.record.create.update.dto';

export class CreateDbRecordRabbitmqDto {
  public principal: OrganizationUserEntity;
  public body: DbRecordCreateUpdateDto[];
  public query?: { skipRelate?: boolean, upsert?: boolean, queue?: boolean };
}
