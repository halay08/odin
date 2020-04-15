import { Base } from '../../../../Base';
import { OrganizationAppEntity } from '../../../../identity/organization/app/organization.app.entity';
import { MetadataLinks } from '../../../metadata.links';
import { PipelineStageEntity } from '../../../pipeline/stage/pipeline.stage.entity';

export class DbRecordEntityTransformBase extends Base {
  public title?: string;
  public type?: string;
  public externalId?: string;
  public externalApp?: OrganizationAppEntity;
  public recordNumber?: string;
  public stage?: PipelineStageEntity;
  public createdBy?: { id: string | null, fullName: string | null } | null;
  public lastModifiedBy?: { id: string | null, fullName: string | null } | null;
  public ownedBy?: { id: string | null, fullName: string | null } | null;
  public links?: MetadataLinks[];
}
