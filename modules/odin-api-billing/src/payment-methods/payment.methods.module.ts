import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { GocardlessModule } from '../gocardless/gocardless.module';
import { PaymentMethodsController } from './payment.methods.controller';
import { PaymentMethodsService } from './payment.methods.service';

@Module({
    imports: [
        GocardlessModule,
        DbModule,
        SchemasModule,
    ],
    controllers: [ PaymentMethodsController ],
    providers: [ PaymentMethodsService ],
    exports: [ PaymentMethodsService ],
})

export class PaymentMethodsModule {
}
