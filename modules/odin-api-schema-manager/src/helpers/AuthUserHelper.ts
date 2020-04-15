import { HelpersIdentityApi } from '@d19n/client/dist/helpers/helpers.identity.api';
import dotenv from 'dotenv';


dotenv.config();

export class AuthUserHelper {

  public static async login(): Promise<{ headers: any }> {
    return new Promise((resolve, reject) => {
      HelpersIdentityApi.login<{ token: string }>(process.env.TEST_EMAIL, process.env.TEST_PASSWORD).subscribe(
        loginResponse => {
          if(!loginResponse.successful) {
            console.log(loginResponse);
          }
          return resolve({ headers: { authorization: 'Bearer ' + loginResponse.response.token } });
        });
    });
  }

}
