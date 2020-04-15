import * as crypto from 'crypto';

export class Random {

    public static getRandomCryptoString(length: number): string {

        return crypto.randomBytes(length).toString('hex');

    }

    public static getRandomNumber(min: number, max: number): number {

        return Math.floor(Math.random() * (max - min + 1)) + min;

    }

    public static getRandomElement<T>(arr: Array<T>): T {

        return arr[ Math.floor(Math.random() * arr.length) ];

    }

}
