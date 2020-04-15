import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { Module } from '@nestjs/common';
import { ContactHelpers } from '../../../common/contact.helpers';
import { OrderHelpers } from '../../../common/order.helpers';
import { VoiceSipwiseCustomerModule } from '../customer/voice.sipwise.customer.module';
import { VoiceSipwiseCustomerContactController } from './voice.sipwise.customer-contact.controller';
import { VoiceSipwiseCustomerContactService } from './voice.sipwise.customer-contact.service';

@Module({
    imports: [
        DbModule,
        VoiceSipwiseCustomerModule,
    ],
    controllers: [ VoiceSipwiseCustomerContactController ],
    providers: [ VoiceSipwiseCustomerContactService, OrderHelpers, ContactHelpers ],
    exports: [ VoiceSipwiseCustomerContactService ],
})
export class VoiceSipwiseCustomerContactModule {
}
