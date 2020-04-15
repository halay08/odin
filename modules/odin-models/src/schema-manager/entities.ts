import { OrganizationAppEntity } from '../identity/organization/app/organization.app.entity';
import { OrganizationEntity } from '../identity/organization/organization.entity';
import { OrganizationUserGroupEntity } from '../identity/organization/user/group/organization.user.group.entity';
import { OrganizationUserEntity } from '../identity/organization/user/organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '../identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { OrganizationUserRbacRoleEntity } from '../identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { LogsUserActivityEntity } from '../logs/user-activity/logs.user.activity.entity';
import { DbRecordAssociationColumnEntity } from './db/record/association-column/db.record.association.column.entity';
import { DbRecordAssociationEntity } from './db/record/association/db.record.association.entity';
import { DbRecordColumnEntity } from './db/record/column/db.record.column.entity';
import { DbRecordEntity } from './db/record/db.record.entity';
import { PipelineEntity } from './pipeline/pipeline.entity';
import { PipelineStageEntity } from './pipeline/stage/pipeline.stage.entity';
import { SchemaAssociationEntity } from './schema/association/schema.association.entity';
import { SchemaColumnOptionEntity } from './schema/column/option/schema.column.option.entity';
import { SchemaColumnEntity } from './schema/column/schema.column.entity';
import { SchemaColumnValidatorEntity } from './schema/column/validator/schema.column.validator.entity';
import { SchemaEntity } from './schema/schema.entity';
import { SchemaTypeEntity } from './schema/types/schema.type.entity';
import { ViewEntity } from './views/view.entity';

/**
 * These are the required entities for the schema manager
 */
export const schemaManagerEntities = [

  LogsUserActivityEntity,

  OrganizationEntity,
  OrganizationAppEntity,
  SchemaEntity,
  SchemaTypeEntity,
  SchemaAssociationEntity,
  SchemaColumnEntity,
  SchemaColumnOptionEntity,
  SchemaColumnValidatorEntity,
  PipelineEntity,
  PipelineStageEntity,
  ViewEntity,
  //
  // DB
  //
  DbRecordEntity,
  DbRecordColumnEntity,
  DbRecordAssociationEntity,
  DbRecordAssociationColumnEntity,
  //
  // Identity
  //
  OrganizationUserGroupEntity,
  OrganizationUserRbacRoleEntity,
  OrganizationUserEntity,
  OrganizationUserRbacPermissionEntity,
];
