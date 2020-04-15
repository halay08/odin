import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

enum WorkOrderTypeEnum {
    INSTALL = 'INSTALL',
    SERVICE = 'SERVICE',
    BUILD = 'BUILD',
}

export class WorkOrderWithAppointmentCreateDto {
    @ApiProperty()
    public Date?: string;
    @ApiProperty()
    public TimeBlock?: string;
    @ApiProperty()
    @IsOptional()
    @IsEnum(WorkOrderTypeEnum)
    public Type?: WorkOrderTypeEnum;
    @ApiProperty()
    public skipCustomerNotification?: boolean = false;
    @ApiProperty()
    public orderItems: DbRecordAssociationCreateUpdateDto[]
}
