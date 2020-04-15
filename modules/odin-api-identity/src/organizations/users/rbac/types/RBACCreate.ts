import { ApiProperty }                            from "@nestjs/swagger";
import { IsEnum }                                 from "class-validator";
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from "@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type";

export class RBACCreate {

    @ApiProperty()
    public name: string;

    @ApiProperty()
    @IsEnum(ORGANIZATION_USER_RBAC_PERMISSION_TYPE)
    public permissionType: ORGANIZATION_USER_RBAC_PERMISSION_TYPE

}
