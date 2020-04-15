import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
    ],
    controllers: [ OffersController ],
    providers: [ OffersService ],
    exports: [ OffersService ],
})
export class OffersModule {

}
