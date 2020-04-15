import { SearchQueryType } from '../../../search/search.query.type';

export class ViewsCreateUpdateDto {

  public title: string;
  public key: string;
  public moduleName: string;
  public entityName: string;
  public view: {
    columns: any,
    queryBuilder: any,
    search: { [key: string]: SearchQueryType }
  };

}
