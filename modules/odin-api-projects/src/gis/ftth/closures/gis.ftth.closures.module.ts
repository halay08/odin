import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { GisFtthModule } from '../gis.ftth.module';
import { GisFtthClosuresController } from './gis.ftth.closures.controller';
import { GisFtthClosuresService } from './gis.ftth.closures.service';

@Module({
    imports: [ DbModule, SchemasModule, GisFtthModule ],
    controllers: [ GisFtthClosuresController ],
    providers: [ GisFtthClosuresService ],
    exports: [ GisFtthClosuresService ],
})
export class GisFtthClosuresModule {
}



