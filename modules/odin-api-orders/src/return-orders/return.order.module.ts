import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { ReturnOrderService } from './return.order.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
    ],
    controllers: [],
    providers: [ ReturnOrderService ],
    exports: [ ReturnOrderService ],
})
export class ReturnOrderModule {

}
