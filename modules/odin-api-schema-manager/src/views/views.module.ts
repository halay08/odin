import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewsController } from './views.controller';
import { ViewsRepository } from './views.repository';
import { ViewsService } from './views.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([ ViewsRepository ]),
  ],
  controllers: [ ViewsController ],
  providers: [ ViewsService ],
  exports: [ ViewsService ],
})
export class ViewsModule {
}
