import { ISendDynamicEmail } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';

@Injectable()
export class SendgridEmailServiceRpc {

    public constructor(private readonly sendgridService: SendgridService) {
        this.sendgridService = sendgridService;
    }


    // RPC methods
    @RabbitRPC({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.SendResetPasswordEmail`,
        queue: `${process.env.MODULE_NAME}.SendResetPasswordEmail`,
    })
    public async passwordReset(msg: ISendDynamicEmail): Promise<any> {
        try {

            const res = await this.sendgridService.sendPasswordResetEmail(msg.principal, msg.body)

            return res;

        } catch (e) {
            return {
                statusCode: 500,
                message: e.message,
                data: undefined,
            }
        }
    }

}
