import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { Module } from '@nestjs/common';
import { OrderHelpers } from '../../../common/order.helpers';
import { VoiceSipwiseCustomerContactModule } from '../customer-contacts/voice.sipwise.customer-contact.module';
import { VoiceSipwiseCustomerModule } from '../customer/voice.sipwise.customer.module';
import { VoiceSipwisePhoneNumbersModule } from '../phonenumbers/voice.sipwise.phone-numbers.module';
import { VoiceSipwiseSubscriberModule } from '../subscriber/voice.sipwise.subscriber.module';
import { VoiceSipwiseFlowsController } from './voice.sipwise.flows.controller';
import { VoiceSipwiseFlowsService } from './voice.sipwise.flows.service';

@Module({
    imports: [
        DbModule,
        VoiceSipwiseCustomerContactModule,
        VoiceSipwiseCustomerModule,
        VoiceSipwiseSubscriberModule,
        VoiceSipwisePhoneNumbersModule,
    ],
    controllers: [ VoiceSipwiseFlowsController ],
    providers: [ VoiceSipwiseFlowsService, OrderHelpers ],
    exports: [ VoiceSipwiseFlowsService ],
})
export class VoiceSipwiseFlowsModule {
}
