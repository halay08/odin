import { SearchQueryTypeHttp } from '@d19n/models/dist/search/search.query.type.http';
import { SearchResponseType } from '@d19n/models/dist/search/search.response.type';
import { ApiResponse, Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';

dotenv.config();

export class ElasticSearchClient {

    public static readonly DEFAULT_INDEX = 'db_record_values';

    public constructor(public readonly client: Client) {
        this.client = client;
    }

    public closeIndices<T>(index: string): Promise<ApiResponse<T>> {
        return this.client.indices.close({
            index: index,
        });
    }

    public openIndices<T>(index: string): Promise<ApiResponse<T>> {
        return this.client.indices.open({
            index: index,
        });
    }

    public updateSettings<T>(index: string, body: any): Promise<ApiResponse<T>> {
        return this.client.indices.putSettings({
            index: index,
            body: body,
        });
    }

    public createIndices<T>(index: string): Promise<ApiResponse<T>> {
        return this.client.indices.create({
            index: index,
        });
    }

    public deleteIndices<T>(index: string): Promise<ApiResponse<T>> {
        return this.client.indices.delete({
            index: index,
        });
    }

    public updateIndices<T>(index: string, body: T): Promise<ApiResponse<T>> {
        return this.client.indices.putMapping({
            index: index,
            body: body,
        });
    }

    public create<T>(body: T, index?: string): Promise<ApiResponse<T>> {
        return this.client.index({
            index: index || ElasticSearchClient.DEFAULT_INDEX,
            body,
        });
    }

    public async bulk(body: any): Promise<ApiResponse<any>> {
        try {
            console.log('SYNC ELASTIC SEARCH BULK');

            const res = await this.client.bulk({ body });
            console.log(res);

            return res;
        } catch (e) {
            console.error(e);
            if(e && e.meta && e.meta.body) {
                console.error('elastic search sync: error', e.meta.body.error);
            }
        }
    }

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
        search: SearchQueryTypeHttp,
        index?: string,
        debug?: boolean,
    ): Promise<SearchResponseType<T>> {
        console.log('search', search, index);

        return new Promise(async (resolve, reject) => {

            let filterQuery = {};
            // if ( !!rangeQuery ) {
            //     // "filter":{
            //     //     "range": {
            //     //         "createdAt": {
            //     //             "gte": "2020-01-22"
            //     //
            //     //         }
            //     //     }
            //     // }
            //     let range = {};
            //
            //     // rangeSplit [ 'createdAt:gte=2020-01-12', 'createdAt:lte=2020-02-30' ]
            //     for ( let r of search.range ) {
            //         const rSplit = r.split(':');
            //         console.log('rSplit', rSplit);
            //         // rSplit [ 'createdAt', 'lte=2020-02-30' ]
            //         const r1Split = rSplit[1].split('=');
            //         range = Object.assign({}, range, {
            //             [rSplit[0]]: {
            //                 [r1Split[0]]: r1Split[1],
            //             },
            //         });
            //     }
            //     filterQuery = { filter: { range } };
            // }

            let searchTerms = '';
            const terms = search.terms.split(' ');
            for(const term of terms) {
                console.log('term', term);
                console.log('term index of', term.indexOf('*'));
                if(term.indexOf('*') === -1) {
                    console.log('concat', term);
                    searchTerms = searchTerms.concat(`*${term}* `);
                }
            }
            console.log('searchTerms', searchTerms);
            console.log({
                'query': {
                    'bool': {
                        'must': {
                            'simple_query_string': {
                                'fields': [ search.fields || '*' ],
                                'query': search.terms || '*',
                                'lenient': true,
                            },
                        },
                        ...filterQuery,
                    },
                },
                'sort': search.sort ? [ '_score', search.sort ] : [ '_score', { 'updatedAt': { 'order': 'asc' } } ],
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
                ...filterQuery,
            });

            try {
                const fullTextResults = await this.client.search({
                    index: index,
                    from: (search.pageable.page || 0) * search.pageable.size,
                    size: search.pageable.size,
                    body: {
                        'query': {
                            'simple_query_string': {
                                'fields': [ search.fields || '*' ],
                                'query': !!searchTerms ? searchTerms : '*',
                                'default_operator': 'and',
                                'analyze_wildcard': true,
                                'lenient': true,
                            },
                            ...filterQuery,
                        },
                        'sort': search.sort ? [ '_score', search.sort ] : [
                            '_score',
                            { 'updatedAt': { 'order': 'desc' } },
                        ],
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

                if(debug) {
                    console.log(fullTextResults);
                }

                const searchResultsTotal = fullTextResults.body.hits ? fullTextResults.body.hits.total.value : 0;
                const searchResultsData = fullTextResults.body.hits ? fullTextResults.body.hits.hits.map(doc => doc._source) : [];
                // const searchResultHighlights = fullTextResults.body.hits ? fullTextResults.body.hits.hits.map(doc =>
                // doc.highlight ? doc.highlight : '') : [];

                console.log('searchResultsData', searchResultsData);

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
            return this.client.delete({ index: index || ElasticSearchClient.DEFAULT_INDEX, id }, { ignore: [ 404 ] });
        } catch (e) {
            console.error(e);
        }
    }

}
