/**
 * Search input wrapper.
 */
import { SearchPageableType } from "./search.pageable.type";

// https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html


export class SearchQueryTypeHttp {

  /**
   * Will be deprecated in favor of the boolean query structure
   * A string of search terms.
   */
  public terms: string;
  /**
   * A string of fields separated by commas
   */
  public fields?: string;

  /**
   * New query structure to match elastic search query structures supported in Odin 07-2020
   * The clause (query) must appear in matching documents and will contribute to the score.
   * BooleanQuery
   */
  public boolean?: string;

  /**
   * will use this recordId before using the findInSchema, findInSchemaAssociation
   * which will locate one or many records associated to the recordId being passed in.
   * i.e Account,Contact,Product
   */
  public recordId?: string;

  /**
   * Will query data from a specific Schema
   * i.e Account,Contact,Product
   */
  public findInSchema?: string;

  /**
   * Will query data from a specific Schema from 'findInSchema' associated schemas
   * i.e Contact,Product
   */
  public findInChildSchema?: string;
  /**
   * An array of objects
   *[{ "BuildingNumber": { "order": "asc" } }, ]
   */
  public sort?: string;
  /**
   * Pageable.
   */
  public pageable: SearchPageableType;
  /**
   * Single or array of schema id's.
   */
  public schemas?: string;

  /**
   * Constructor.
   *
   * @param request Http Request from nestjs.
   */
  public constructor(request: any) {

    this.pageable = new SearchPageableType(request);

    this.terms = request.query.terms;
    this.boolean = request.query.boolean;
    this.fields = request.query.fields;
    this.sort = request.query.sort;
    this.schemas = request.query.schemas;
    this.recordId = request.query.recordId;
    this.findInSchema = request.query.findInSchema;
    this.findInChildSchema = request.query.findInChildSchema;

  }
}

