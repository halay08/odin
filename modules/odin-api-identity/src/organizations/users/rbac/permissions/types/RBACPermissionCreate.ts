import { IsEnum, IsNotEmpty }                     from 'class-validator';
import { ApiProperty }                            from "@nestjs/swagger";
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from "@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type";

export class RBACPermissionCreate {

    @ApiProperty()
    @IsNotEmpty()
    public name: string;

    @ApiProperty()
    public description: string;

    @ApiProperty()
    @IsEnum(ORGANIZATION_USER_RBAC_PERMISSION_TYPE)
    public type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE;

}
