import { APIClient } from '../common/APIClient';
import { SERVICE_NAME } from './Services';
import { Utilities } from './Utilities';

export class HelpersNotificationsApi {

    /**
     *
     * @param body
     * @param headers
     * @param debug
     */
    public static async sendDynamicEmail<R, T>(
        body: T,
        headers,
        debug?: boolean,
    ): Promise<R> {
        return await APIClient.call<R>({
            facility: 'http',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.NOTIFICATION_MODULE),
            service: `v1.0/sendgrid/dynamic_template`,
            method: 'post',
            headers: { Authorization: headers.authorization },
            body,
            debug,
        });
    }
}
