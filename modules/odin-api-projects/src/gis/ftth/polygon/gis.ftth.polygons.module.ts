import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../../features/features.module';
import { GisFtthPolygonsController } from './gis.ftth.polygons.controller';
import { GisFtthPolygonsService } from './gis.ftth.polygons.service';

@Module({
    imports: [ FeaturesModule ],
    controllers: [ GisFtthPolygonsController ],
    providers: [ GisFtthPolygonsService ],
    exports: [ GisFtthPolygonsService ],
})
export class GisFtthPolygonsModule {
}



