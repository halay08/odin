import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { ContactHelpers } from '../../../../common/contact.helpers';
import { OrderHelpers } from '../../../../common/order.helpers';
import { VoiceSipwiseSubscriberModule } from '../../../../voice/sipwise/subscriber/voice.sipwise.subscriber.module';
import { NetworkAdtranOltModule } from '../../olt/network.adtran.olt.module';
import { NetworkAdtranOnuVoiceController } from './network.adtran.onu.voice.controller';
import { NetworkAdtranOnuVoiceService } from './network.adtran.onu.voice.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        VoiceSipwiseSubscriberModule,
        NetworkAdtranOltModule,
    ],
    controllers: [ NetworkAdtranOnuVoiceController ],
    providers: [ NetworkAdtranOnuVoiceService, OrderHelpers, ContactHelpers ],
    exports: [ NetworkAdtranOnuVoiceService ],
})
export class NetworkAdtranOnuVoiceModule {
}
