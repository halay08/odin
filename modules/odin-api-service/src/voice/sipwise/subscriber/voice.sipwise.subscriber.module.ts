import { Module } from '@nestjs/common';
import { VoiceSipwiseCallForwardsModule } from '../call-forwarding/voice.sipwise.call.forwards.module';
import { VoiceSipwiseSubscriberController } from './voice.sipwise.subscriber.controller';
import { VoiceSipwiseSubscriberService } from './voice.sipwise.subscriber.service';

@Module({
    imports: [
        VoiceSipwiseCallForwardsModule,
    ],
    controllers: [ VoiceSipwiseSubscriberController ],
    providers: [ VoiceSipwiseSubscriberService ],
    exports: [ VoiceSipwiseSubscriberService ],
})
export class VoiceSipwiseSubscriberModule {
}
