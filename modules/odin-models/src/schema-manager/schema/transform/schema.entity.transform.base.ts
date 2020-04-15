import { Base } from '../../../Base';

export class SchemaEntityTransformBase extends Base {
  public name: string | undefined;
  public position: number | undefined;
  public moduleName: string | undefined;
  public entityName: string | undefined;
  public searchUrl: string | undefined;
  public getUrl: string | undefined;
  public putUrl: string | undefined;
  public postUrl: string | undefined;
  public deleteUrl: string | undefined;
  public isHidden: boolean | undefined;
  public isSequential: boolean | undefined;
  public hasTitle: boolean | undefined;
  public isTitleUnique: boolean | undefined;
  public isTitleRequired: boolean | undefined;
  public upsertOnCreate: boolean | undefined;
  public assignable: boolean | undefined;
  public queryable: boolean | undefined;
  public replicateable: boolean | undefined;
  public retrievable: boolean | undefined;
  public searchable: boolean | undefined;
  public triggerable: boolean | undefined;
  public undeletable: boolean | undefined;
  public updateable: boolean | undefined;
  public permissions: string[];

}
