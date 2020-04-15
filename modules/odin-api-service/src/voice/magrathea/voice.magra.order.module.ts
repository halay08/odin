import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { ContactHelpers } from '../../common/contact.helpers';
import { OrderHelpers } from '../../common/order.helpers';
import { VoiceMagraOrderController } from './voice.magra.order.controller';
import { VoiceMagraOrderService } from './voice.magra.order.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
    ],
    controllers: [ VoiceMagraOrderController ],
    providers: [ VoiceMagraOrderService, OrderHelpers, ContactHelpers ],
    exports: [ VoiceMagraOrderService ],
})
export class VoiceMagraOrderModule {
}
