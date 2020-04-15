import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { Module } from '@nestjs/common';
import { VoiceSipwisePhoneNumbersService } from './voice.sipwise.phone-numbers.service';

@Module({
    imports: [
        DbModule,
    ],
    providers: [ VoiceSipwisePhoneNumbersService ],
    exports: [ VoiceSipwisePhoneNumbersService ],
})
export class VoiceSipwisePhoneNumbersModule {
}
