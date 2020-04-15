import { IsNotEmpty }           from 'class-validator';
import { RBACPermissionCreate } from '../../permissions/types/RBACPermissionCreate';
import { ApiProperty }          from "@nestjs/swagger";

export class RBACRoleCreate {

    @ApiProperty()
    @IsNotEmpty()
    public name: string;

    @ApiProperty()
    public description: string;

    public permissions?: Array<RBACPermissionCreate>;

}
