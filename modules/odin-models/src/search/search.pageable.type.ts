export class SearchPageableType {

  /**
   * Page offset (starting page -- starts at zero).
   *
   * @type {number}
   */
  public page?: number = 0;
  /**
   * Maximum number of results to return per page.
   *
   * @type {number}
   */
  public size?: number = 20;

  /**
   * Constructor with default values.
   *
   * @param request
   */
  public constructor(request: any) {
    this.page = request.query.page;
    this.size = request.query.size;
  }

}

