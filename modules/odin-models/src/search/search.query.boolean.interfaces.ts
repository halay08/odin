export interface FilterQuery {
  range: {
    [key: string]: {
      gte: string,
      lte: string
    }
  };
}

export interface TermQuery {
  [key: string]: any;
}

export interface QueryString {
  [key: string]: {
    match_all?: {};
    /**
     * A string of search terms.
     */
    query: string;
    /**
     * An array of fields to be included in the search terms
     */
    fields?: string[];
    /**
     * A string of search terms.
     */
    lenient: boolean;
    /**
     * A string of search terms.
     */
    default_operator: 'AND' | 'OR';
  }
}

export interface BooleanQuery {
  must: FilterQuery[] | TermQuery[] | QueryString[];
  must_not: FilterQuery[] | TermQuery[] | QueryString[];
  should: FilterQuery[] | TermQuery[] | QueryString[];
  filter: FilterQuery[] | TermQuery[] | QueryString[];
}
