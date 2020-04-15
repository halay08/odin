import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import * as sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export class SendgridEmail {

    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    // TODO: Move this to a publish event to the notification module
    public static async passwordReset(to: string, from: string, subject: string, text: string, resetLink: string) {
        try {
            const msg = {
                to: to,
                from: from,
                subject: subject,
                text: `${text}`,
                html: `<strong>${text}</strong><br><a href="${resetLink}">${resetLink}</a>`,
            };
            const res = await sgMail.send(msg);
            return res;
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }


    // TODO: Move this to a publish event to the notification module
    public static async userRegistered(to: string, from: string, subject: string, text: string, activateLink: string) {
        try {
            const msg = {
                to: to,
                from: from,
                subject: subject,
                text: `${text}`,
                html: `<strong>${text}</strong><br><a href="${activateLink}">${activateLink}</a>`,
            };
            const res = await sgMail.send(msg);
            return res;
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

}
