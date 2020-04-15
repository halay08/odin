import { SendgridControllerHelpers } from "../helpers/sendgrid.controller.helpers";
import { SendgridEmailEntity } from "@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity";

describe('sendgrid controller integration test', () => {

    test('send a new order confirmation', async done => {

        const newEmail = new SendgridEmailEntity();
        newEmail.to = 'frank@truglioventures.com';
        newEmail.subject = 'Order Confirmation';
        newEmail.from = 'hello@test.com';
        newEmail.templateId = 'd-0a6faa57e13b485ba9a6782ff4306a9a';
        newEmail.dynamicTemplateData = {
            subject: 'OR-002 - Order Confirmation',
            contactFirstName: 'Frank',
            orderItems: [
                {
                    lineItemName: 'YouFibre 50',
                    "lineItemDescription": "Average speed of 50 Mbps* Unlimited data",
                    lineItemTotal: '20.00',
                },
                { lineItemName: 'YouPhone', lineItemDescription: '', lineItemTotal: '3.00' },
                { lineItemName: 'YouMesh', lineItemDescription: '', lineItemTotal: '7.00' },
            ],
            orderSummary: {
                subtotal: '30.00',
                totalDiscount: null,
                totalTax: '6.00',
                totalDue: '36.00',
            },
            organizationName: 'Abc corporation',
        };

        const res = await SendgridControllerHelpers.sendOrderConfirmationEmail(newEmail);

        console.log('res', res);

        done()
    });

});
