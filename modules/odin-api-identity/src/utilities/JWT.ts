import * as jwt        from 'jsonwebtoken';
import { JWTResponse } from './JWTResponse';

export class JWT {

    public static getToken(id: string): JWTResponse {

        const token = jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_EXPIRY });

        return { expiresIn: Number(process.env.JWT_EXPIRY), token };

    }

}
