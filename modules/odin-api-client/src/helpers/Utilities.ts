import * as fs from 'fs';
import * as os from 'os';
import { ENVIRONMENT, ENVIRONMENT_TYPES, ENVIRONMENTS } from './Environments';
import { SERVICE_NAME, SERVICES } from './Services';

export class Utilities {

    public static readonly ENVIRONMENTS: 'local' | 'docker' | 'k8';

    /**
     * RegExp for matching hostnames to determine where we are running from.
     *
     * @type {{prod: RegExp; local: RegExp; docker: RegExp}}
     */
    public static readonly ENVIROMENT_PATTERNS = {
        local: /mac|local|\\./i,
        docker: /^dev$/,
        prod: /^odin\\-/,
    };

    /**
     * Determine where we are running from based on the existence and contents
     * of /proc/1/cgroups. This file is only available on linux systems so that
     * would be a key indicator.
     *
     * @returns {ENVIRONMENT} Returns a docker, k8 or local object.
     */
    public static getEnvironment(): ENVIRONMENT {
        const hostname = os.hostname();

        if(hostname === ENVIRONMENT_TYPES.DOCKER) {

            return ENVIRONMENTS[0];

        } else if(fs.existsSync('/proc/1/cgroups')) {

            const contents = fs.readFileSync('/proc/1/cgroups');

            for(let i = 0; i < ENVIRONMENTS.length; i++) {
                if(contents.indexOf(ENVIRONMENTS[i].matchStr) > -1) {
                    return ENVIRONMENTS[i];
                }
            }

        } else {
            // localhost
            return ENVIRONMENTS[2];
        }
    }


    /**
     * Returns the correct base url to use based on the detected environment.
     * @param serviceName
     * @param debug
     */
    public static getBaseUrl(serviceName: SERVICE_NAME, debug: boolean = false): string {
        const environment = this.getEnvironment();

        const service = SERVICES[serviceName];

        try {
            if(debug) {
                console.log(environment);
            }
            if(!!!service) {
                throw `Could not locate the service "${serviceName}`;
            }
            if(environment.name === ENVIRONMENT_TYPES.DOCKER) {

                return `http://odin-haproxy:8080/${service.prefix}`;

            } else if(process.env.HTTP_API_URL) {

                // if you want to override with an HTTP url instead of the service to service in kubernetes
                return `https://${process.env.HTTP_API_URL}/${service.prefix}`;

            } else if(process.env.ENABLE_K8_ROUTING) {
                // If K8_BASE_URL it will route by service name (will be deprecated after the updated environments)
                // are in place. This is to prevent breaking changes and to support existing environment configurations.
                // If ENABLE_K8_ROUTING then it will route by service name
                return `http://${service.hostname}/${service.prefix}`;
            } else {
                return `http://localhost:${service.port}/${service.prefix}`;
            }
        } catch (e) {
            console.error('error in utilities set base url ', e);
        }
    }

}
