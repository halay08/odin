import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
    ],
    controllers: [],
    providers: [ AccountsService ],
    exports: [ AccountsService ],
})
export class AccountsModule {
}
