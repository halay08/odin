import { Module } from '@nestjs/common';
import { VoiceSipwiseSubscriberPreferenceController } from './voice.sipwise.subscriber.preference.controller';
import { VoiceSipwiseSubscriberPreferenceService } from './voice.sipwise.subscriber.preference.service';

@Module({
    imports: [],
    controllers: [ VoiceSipwiseSubscriberPreferenceController ],
    providers: [ VoiceSipwiseSubscriberPreferenceService ],
    exports: [ VoiceSipwiseSubscriberPreferenceService ],
})
export class VoiceSipwiseSubscriberPreferenceModule {
}
