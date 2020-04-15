import { Module } from '@nestjs/common';
import { VoiceSipwiseCustomerController } from './voice.sipwise.customer.controller';
import { VoiceSipwiseCustomerService } from './voice.sipwise.customer.service';

@Module({
    imports: [],
    controllers: [ VoiceSipwiseCustomerController ],
    providers: [ VoiceSipwiseCustomerService ],
    exports: [ VoiceSipwiseCustomerService ],
})
export class VoiceSipwiseCustomerModule {
}
