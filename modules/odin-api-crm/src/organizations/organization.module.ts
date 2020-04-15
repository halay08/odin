import { Module } from '@nestjs/common';
import { OrganizationsService } from "./organizations.service";

@Module({
    imports: [],
    controllers: [ ],
    providers: [ OrganizationsService ],
    exports: [ OrganizationsService ],
})
export class OrganizationModule {
}
