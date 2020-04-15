import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsUUID } from "class-validator";
import { LogsConstants } from "../logs.constants";

export class LogsUserActivityCreateDto {

  @ApiProperty()
  @IsUUID()
  recordId: string;

  @ApiProperty()
  revision: any;

  @ApiProperty()
  @IsEnum(LogsConstants)
  public type: LogsConstants;

}
