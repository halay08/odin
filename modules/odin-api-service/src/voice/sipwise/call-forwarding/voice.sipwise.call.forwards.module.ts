import { Module } from '@nestjs/common';
import { VoiceSipwiseCallForwardsService } from './voice.sipwise.call.forwards.service';

@Module({
    providers: [ VoiceSipwiseCallForwardsService ],
    exports: [ VoiceSipwiseCallForwardsService ],
})
export class VoiceSipwiseCallForwardsModule {
}
