import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum NotificationServiceEnum {
    SENDGRID = 'SENDGRID',
}

export class TemplatesEmailCreateDto {

    @ApiProperty()
    @Length(1, 55)
    public name: string;

    @ApiProperty()
    @Length(1, 55)
    public label: string;

    @ApiProperty()
    @IsOptional()
    @Length(1, 55)
    public description?: string;

    @ApiProperty()
    @IsEnum(NotificationServiceEnum)
    public service: NotificationServiceEnum;

    @ApiProperty()
    @IsOptional()
    @IsString()
    public templateId?: string;

    @ApiProperty()
    @IsOptional()
    public dynamicTemplateData?: SendgridEmailEntity


}
