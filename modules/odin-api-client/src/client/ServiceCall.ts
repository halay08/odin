import { Param } from './Param';

/**
 * Parameters object for invoking the service client.
 */
export class ServiceCall {

    /**
     * Broker facility to use.
     */
    public facility?: 'http' | 'rest' | 'amqp' = 'http';

    /**
     * Name of the service (i.e.: identity/users/login)
     */
    public service: string;

    /**
     * Base url.
     *
     * @type {string}
     */
    public baseUrl: string = 'http://localhost:8080';

    /**
     * Headers object (optional).
     */
    public headers?: { [key: string]: string };

    /**
     * HTTP method.
     */
    public method: 'get' | 'post' | 'delete' | 'put' | 'patch';

    /**
     * Query string parameters (key => value) array.
     */
    public params?: Param[];

    /**
     * HTTP body when performing a POST or PUT.
     */
    public body?: any;

    /**
     * Enable debug outputs.
     */
    public debug?: boolean;

}
