import { forwardRef, Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { SchemasModule } from '../../schemas/schemas.module';
import { BucketsController } from './buckets/buckets.controller';
import { BucketsService } from './buckets/buckets.service';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';

@Module({
  imports: [
    forwardRef(() => DbModule),
    forwardRef(() => SchemasModule),
  ],
  controllers: [ FilesController, BucketsController ],
  providers: [ FilesService, BucketsService ],
  exports: [ FilesService, BucketsService ],
})
export class AwsS3Module {
}
