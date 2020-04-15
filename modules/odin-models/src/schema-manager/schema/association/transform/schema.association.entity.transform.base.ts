import { Base } from '../../../../Base';

export class SchemaAssociationEntityTransformBase extends Base {
  public label: string | undefined;
  public type: string | undefined;
  public position: number | undefined;
  public parentActions: string | undefined;
  public childActions: string | undefined;
  public hasColumnMappings: boolean | undefined;
  public cascadeDeleteChildRecord: boolean | undefined;
  public findInSchema: string | undefined;
  public findInChildSchema: string | undefined;
  public getUrl: string | undefined;
  public postUrl: string | undefined;
  public putUrl: string | undefined;
  public deleteUrl: string | undefined;
}
