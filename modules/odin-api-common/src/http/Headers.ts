export class Headers {

    /**
     * Takes in headers from @Req() and returns the jwt token if present.
     *
     * @param headers @Req() headers
     */
    public static getJwtTokenFromHeaders(headers: any): string {
        if (headers[ 'authorization' ]) {
            return headers[ 'authorization' ].split(' ')[ 1 ];
        }
    }
}
