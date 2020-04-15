/**
 * Page object.
 */
export class SearchPageType {

    /**
     * Total number of records a query can return.
     *
     * @type {number}
     */
    public readonly totalRecords: number = 0;
    /**
     * Current number of records returned (paginated).
     *
     * @type {number}
     */
    public readonly currentRecords: number = 0;

    /**
     * Boolean set by the API
     */
    public hasMore: boolean;

    /**
     * Boolean set by the API
     */
    public isFirstPage: boolean;

    /**
     * Boolean set by the API
     */
    public isLastPage: boolean;

    /**
     * Number set by the API
     */
    public totalPages: number;

    /**
     * Constructor.
     *
     * @param {number} totalRecords
     * @param {number} currentRecords
     * @param hasMore
     * @param isFirstPage
     * @param isLastPage
     * @param totalPages
     */
    public constructor(
        totalRecords: number,
        currentRecords: number,
        hasMore: boolean,
        isFirstPage: boolean,
        isLastPage: boolean,
        totalPages: number,
    ) {

        this.totalRecords = totalRecords;
        this.currentRecords = currentRecords;
        this.hasMore = hasMore;
        this.isFirstPage = isFirstPage;
        this.isLastPage = isLastPage;
        this.totalPages = totalPages;

    }

}
