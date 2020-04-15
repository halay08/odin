import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { OrganizationUserStatus } from './organization.user.status';

export class OrganizationUserUpdate {

  @ApiProperty()
  public firstname?: string;

  @ApiProperty()
  public lastname?: string;

  @ApiProperty()
  public email?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isBetaTester?: boolean;

  @ApiProperty()
  @IsEnum(OrganizationUserStatus)
  public status?: OrganizationUserStatus;

}
