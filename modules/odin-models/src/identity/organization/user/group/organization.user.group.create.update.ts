import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { OrganizationUserGroupEntity } from "./organization.user.group.entity";
import { Length } from "class-validator";

export class OrganizationUserGroupCreateUpdate {

    @ApiProperty({ example: "Sales Team A - Group" })
    @Length(3, 100)
    public name: string;

    @ApiProperty({ example: "Sales team A - can only search, view records in their group" })
    @Length(1, 160)
    public description: string;

    @ApiProperty({ example: [] })
    public groups: OrganizationUserGroupEntity[];

}
