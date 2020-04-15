import { Module }                             from '@nestjs/common';
import { TypeOrmModule }                      from '@nestjs/typeorm';
import { OrganizationsUsersTokensRepository } from "./organizations.users.tokens.repository";
import { OrganizationsUsersTokensController } from "./organizations.users.tokens.controller";
import { OrganizationsUsersTokensService }    from "./organizations.users.tokens.service";
import { OrganizationEntitysModule }          from "../../organizations.module";


@Module({
    imports: [
        OrganizationEntitysModule,
        TypeOrmModule.forFeature([
            OrganizationsUsersTokensRepository
        ])
    ],
    controllers: [
        OrganizationsUsersTokensController
    ],
    providers: [
        OrganizationsUsersTokensService
    ],
    exports: [
        OrganizationsUsersTokensService
    ]

})
export class OrganizationsUsersTokensModule {
}
