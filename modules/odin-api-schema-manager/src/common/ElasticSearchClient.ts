import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';
import { BooleanQuery } from '@d19n/models/dist/search/search.query.boolean.interfaces';
import { SearchQueryTypeHttp } from '@d19n/models/dist/search/search.query.type.http';
import { SearchResponseType } from '@d19n/models/dist/search/search.response.type';
import { ApiResponse, Client } from '@elastic/elasticsearch';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import dotenv from 'dotenv';

dotenv.config();

export class ElasticSearchClient {

  public static readonly DEFAULT_INDEX = 'db_record_values';

  public constructor(public readonly client: Client) {
    this.client = client;
  }

  /**
   *
   * @param index
   */
  public createIndices<T>(index: string): Promise<ApiResponse<T>> {
    return this.client.indices.create({
      index: index,
    });
  }

  /**
   *
   * @param index
   * @param body
   */
  public updateIndices<T>(index: string, body: T): Promise<ApiResponse<T>> {
    return this.client.indices.putMapping({
      index: index,
      type: '',
      body: '',
    });
  }

  /**
   *
   * @param body
   * @param index
   */
  public create<T>(body: T, index?: string): Promise<ApiResponse<T>> {
    return this.client.index({
      index: index || ElasticSearchClient.DEFAULT_INDEX,
      body,
    });
  }

  /**
   *
   * @param body
   */
  public async bulk(body: any): Promise<ApiResponse<any>> {
    try {
      const res = await this.client.bulk({ body });

      return res;
    } catch (e) {
      console.error(e);
      if(e && e.meta && e.meta.body) {
        console.error('elastic search sync: error', e.meta.body.error);
      }
    }
  }

  /**
   *
   * @param body
   * @param id
   * @param index
   */
  public async sync<T>(body: T, id?: string, index?: string): Promise<ApiResponse<any>> {
    try {
      // Check if the record exists in the index
      const elasticSearchIndex = (await this.client.exists({
        index: index || ElasticSearchClient.DEFAULT_INDEX,
        id,
      })).body;

      if(id && elasticSearchIndex) {
        const res = await this.client.update({
          index: index || ElasticSearchClient.DEFAULT_INDEX,
          id,
          body: {
            doc: body,
          },
        });

        return res;
      } else {
        const res = await this.client.index({
          index: index || ElasticSearchClient.DEFAULT_INDEX,
          id,
          body: body,
        });

        return res;
      }
    } catch (e) {
      console.error(e);
      if(e && e.meta && e.meta.body) {
        console.error('elastic search sync: error', e.meta.body.failures, e.meta.body.error);
      }
    }
  }


  /**
   *
   * @param search
   * @param index
   * @param debug
   */
  public async search<T>(
    principal: OrganizationUserEntity,
    search: SearchQueryTypeHttp,
    index?: string,
    debug?: boolean,
  ): Promise<SearchResponseType<T>> {

    return new Promise(async (resolve, reject) => {
      try {
        let size = 50;
        if(!!search.pageable.size && !isNaN(search.pageable.size)) {
          size = Number(search.pageable.size);
        }

        let page = 0;
        if(!!search.pageable.page && !isNaN(search.pageable.page)) {
          page = Number(search.pageable.page);
          if(!isNaN(size) && page > 0) {
            page = page * Number(search.pageable.size);
          }
        }

        let searchFields = [];
        if(!!search.fields) {
          try {
          // if the format is ["field1", "field2"]
            const parsed = JSON.parse(search.fields);
            searchFields = parsed;
          } catch (e) {
          // if the format is field1, field2, field3
            const splitFields = search.fields.split(',');
            if(splitFields) {
              for(const field of splitFields) {
                searchFields.push(field);
              }
            }
          }
        }

        let queryBody: BooleanQuery = {
          must: [],
          must_not: [],
          should: [],
          filter: [],
        };

        if(!!search.boolean) {
          queryBody = Object.assign({}, queryBody, JSON.parse(search.boolean));
        }

        let principalGroupsArray=[]
        if(principal?.groups?.length){
          principalGroupsArray = principal.groups.map(group => group.id)
        }

        const permissionsQuery = {
          "bool": {
            "should": [
              {
                "bool": {
                  "must": {
                    "terms": {
                      "groups.id.keyword": principalGroupsArray
                    }
                  }
                }
              },
              {
                "bool": {
                  "must_not": {
                    "exists": { "field": "groups" }
                  }
                }
              }
            ]
          }
        }

        if(!!search.terms) {
          const defaultOperator = 'AND';
          let searchTerms = '';
          const terms = search.terms.split(' ');

          if(terms.length < 1) {

            searchTerms = `${search.terms}`;

          } else {
            for(const term of terms) {
              if(term.indexOf('*') === -1) {
              // check if UUID then do not add wild card
                const regexp = new RegExp(SchemaColumnValidatorTypes.UUID.pattern, 'igm');
                // There is value to validate
                const isUUID = regexp.test(term);
                if(isUUID) {
                  searchTerms = searchTerms.concat(`${term}* `);
                } else {
                  searchTerms = `${search.terms}*`;
                }
              }
            }
          }

          if(!!searchTerms) {
            queryBody.must.push(
            // @ts-ignore
              {
                query_string: {
                  fields: searchFields.length > 0 ? searchFields : [ 'title', 'recordNumber' ],
                  query: searchTerms,
                  default_operator: defaultOperator,
                  lenient: true,
                  analyze_wildcard: true,
                  boost: 1.0,
                  rewrite: 'constant_score',
                }
              }, permissionsQuery);
          }

        } else {
          // return a default search query
          queryBody.must.push(
          // @ts-ignore
            permissionsQuery
          );
        }

      
        console.log({
          index: index,
          from: page,
          size: size,
          'query': {
            'bool': JSON.stringify({
              ...queryBody,
            }),
          },
          'sort': !!search.sort ? [ '_score', ...JSON.parse(search.sort) ] : [ '_score' ],
          'highlight': {
            'fields': {
              'properties.*': {
                'pre_tags': [
                  '<!=',
                ],
                'post_tags': [
                  '=>',
                ],
              },
            },
          },
        });

        const fullTextResults = await this.client.search({
          index: index,
          from: page,
          size: size,
          body: {
            'query': {
              'bool': {
                ...queryBody,
              },
            },
            'sort': !!search.sort ? [ '_score', ...JSON.parse(search.sort) ] : [ '_score' ],
            'highlight': {
              'fields': {
                'properties.*': {
                  'pre_tags': [
                    '<!=',
                  ],
                  'post_tags': [
                    '=>',
                  ],
                },
              },
            },
          },
        }, {
          ignore: [ 404 ],
          maxRetries: 3,
        });

        console.log(fullTextResults);

        const searchResultsTotal = fullTextResults.body.hits ? fullTextResults.body.hits.total.value : 0;
        const searchResultsData = fullTextResults.body.hits ? fullTextResults.body.hits.hits.map(doc => doc._source) : [];
        // const searchResultHighlights = fullTextResults.body.hits ? fullTextResults.body.hits.hits.map(doc =>
        // doc.highlight ? doc.highlight : '') : [];
        const responseQuery = Object.assign({}, search, { boolean: queryBody });

        return resolve(new SearchResponseType<T>(responseQuery, searchResultsTotal, { data: searchResultsData }, []));
      } catch (e) {
        console.error('ERROR', e);
        if(e.meta && e.meta.body) {
          // status code 400 will have a meta.body.error
          console.error(e.meta.body.error);
        }
        return resolve(new SearchResponseType<T>(search, 0, { data: [] }, []));
      }
    });
  }


  /**
   *
   * @param id
   * @param index
   */
  public async deleteById(id: string, index?: string): Promise<ApiResponse<any>> {
    try {
      return this.client.delete({ index, id }, { ignore: [ 404 ] });
    } catch (e) {
      console.error(e);
      console.error('ERROR', e);
      if(e.meta && e.meta.body) {
        // status code 400 will have a meta.body.error
        console.error(e.meta.body);
        console.error(e.meta.body.error);
      }
    }
  }

}
