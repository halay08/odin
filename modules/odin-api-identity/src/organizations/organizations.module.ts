import { Module }                        from '@nestjs/common';
import { TypeOrmModule }                 from '@nestjs/typeorm';
import { OrganizationEntityRepository }  from "./organizations.repository";
import { OrganizationEntitysController } from "./organizations.controller";
import { OrganizationEntitysService }    from "./organizations.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ OrganizationEntityRepository ])
    ],
    controllers: [ OrganizationEntitysController ],
    providers: [ OrganizationEntitysService ],
    exports: [ OrganizationEntitysService ]
})
export class OrganizationEntitysModule {

}
