import { Headers } from '@d19n/common/dist/http/Headers';
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InitializeService } from './InitializeService';
import { Principal } from "@d19n/common/dist/decorators/Principal";
import { PrincipalGuard } from "@d19n/client/dist/guards/PrincipalGuard";
import * as dotenv from "dotenv";

dotenv.config();

@ApiTags('Initializer')
@ApiBearerAuth()
@Controller(`${process.env.MODULE_NAME}/v1.0`)
export class InitializeContoller {

    private readonly initializeService: InitializeService;

    public constructor(initializeService: InitializeService) {
        this.initializeService = initializeService;
    }

    @Get()
    @UseGuards(PrincipalGuard)
    public initialize(@Principal() principal: OrganizationUserEntity, @Req() request) {
        return this.initializeService.initialize(principal, Headers.getJwtTokenFromHeaders(request.headers));
    }

}
