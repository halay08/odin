import { forwardRef, Module } from '@nestjs/common';
import { VisitsService } from "./visits.service";
import { VisitsController } from "./visits.controller";
import { SchemasModule } from "@d19n/schema-manager/dist/schemas/schemas.module";
import { DbModule } from "@d19n/schema-manager/dist/db/db.module";

@Module({
    imports: [
        SchemasModule,
        forwardRef(() => DbModule),
    ],
    controllers: [ VisitsController ],
    providers: [ VisitsService ],
    exports: [ VisitsService ],
})
export class VisitsModule {
}
