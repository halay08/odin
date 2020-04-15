export class ServiceResponse<T> {

    public code: number;
    public message: string;
    public response: T;
    public facility: 'http' | 'mq';

    /**
     * Automatically set to true if the response code is >= 200 and <= 300.
     */
    public successful: boolean;

}
