import * as dotenv from "dotenv";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";


dotenv.config();

export class AuthUserHelper {

    public static async login(): Promise<{ headers: any, token: any }> {
        return new Promise((resolve, reject) => {
            HelpersIdentityApi.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD).subscribe(loginResponse => {
                if(!loginResponse.successful) {
                    console.log(loginResponse);
                }
                return resolve({
                    headers: { authorization: 'Bearer ' + loginResponse.response.token },
                    token: loginResponse.response.token,
                });
            });
        });
    }

}
