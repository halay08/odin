import * as dotenv from 'dotenv';
import { ApiResponse, Client } from '@elastic/elasticsearch';
import { SearchResponseType } from "@d19n/models/dist/search/search.response.type";
import { SchemaColumnValidatorTypes } from "@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types";
import { SearchQueryTypeHttp } from "@d19n/models/dist/search/search.query.type.http";

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
            console.log(res);

            return res;
        } catch (e) {
            console.error(e);
            if(e && e.meta && e.meta.body) {
                console.error("elastic search sync: error", e.meta.body.error);
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
                console.error("elastic search sync: error", e.meta.body.failures, e.meta.body.error);
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
        search: SearchQueryTypeHttp,
        index?: string,
        debug?: boolean,
    ): Promise<SearchResponseType<T>> {

        return new Promise(async (resolve, reject) => {

            let filterQuery = {};

            let searchTerms = '';
            const terms = search.terms.split(' ');

            for(const term of terms) {
                if(term.indexOf('*') === -1) {
                    // check if UUID then do not add wild card
                    const regexp = new RegExp(SchemaColumnValidatorTypes.UUID.pattern, 'igm');
                    // There is value to validate
                    const isUUID = regexp.test(term);
                    console.log('isUUID', isUUID);
                    if(isUUID) {
                        searchTerms = searchTerms.concat(`${term}`);
                    } else {
                        searchTerms = searchTerms.concat(`${term}* `);
                    }
                }
            }

            let searchFields = [];
            if(!!search.fields) {
                const fields = search.fields.split(',');
                for(const field of fields) {
                    searchFields.push(field);
                }
            }

            console.log('search', search);

            console.log('query', {
                index: index,
                from: (search.pageable.page || 0) * search.pageable.size,
                size: search.pageable.size || 50,
                "query_string": {
                    "fields": searchFields.length > 0 ? searchFields : [ '*' ],
                    "query": !!searchTerms ? searchTerms : '*',
                    "default_operator": "AND",
                    "lenient": true,
                },
                ...filterQuery,
            });

            try {
                const fullTextResults = await this.client.search({
                    index: index,
                    from: (search.pageable.page || 0) * search.pageable.size,
                    size: search.pageable.size || 50,
                    body: {
                        "query": {
                            "query_string": {
                                "fields": searchFields.length > 0 ? searchFields : [ '*' ],
                                "query": !!searchTerms ? searchTerms : '*',
                                "default_operator": "AND",
                                "lenient": true,
                            },
                            ...filterQuery,
                        },
                        "sort": !!search.sort ? [ "_score", ...JSON.parse(search.sort) ] : [ "_score" ],
                        "highlight": {
                            "fields": {
                                "properties.*": {
                                    "pre_tags": [
                                        "<!=",
                                    ],
                                    "post_tags": [
                                        "=>",
                                    ],
                                },
                            },
                        },
                    },
                }, {
                    ignore: [ 404 ],
                    maxRetries: 3,
                });

                if(debug) {
                    console.log(fullTextResults);
                }

                const searchResultsTotal = fullTextResults.body.hits ? fullTextResults.body.hits.total.value : 0;
                const searchResultsData = fullTextResults.body.hits ? fullTextResults.body.hits.hits.map(doc => doc._source) : [];
                // const searchResultHighlights = fullTextResults.body.hits ? fullTextResults.body.hits.hits.map(doc =>
                // doc.highlight ? doc.highlight : '') : [];

                return resolve(new SearchResponseType<T>(search, searchResultsTotal, { data: searchResultsData }, []));
            } catch (e) {
                console.error(e.meta);
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
        }
    }

}
