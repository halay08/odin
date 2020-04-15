import { ApiProperty } from '@nestjs/swagger';

export class SendgridEmailEntity {
  @ApiProperty()
  public to: any;
  @ApiProperty()
  public cc: any;
  @ApiProperty()
  public bcc: any;
  @ApiProperty()
  public from: any;
  @ApiProperty()
  public subject?: string;
  @ApiProperty()
  public body?: any;
  @ApiProperty()
  public attachments?: any;
  @ApiProperty()
  public links?: { [key: string]: string };
  @ApiProperty()
  public signature?: string;
  // Sendgrid template id
  @ApiProperty()
  public templateId?: string;
  // odin template label
  @ApiProperty()
  public templateLabel?: string;
  // Sendgrid dynamic template data
  @ApiProperty()
  public dynamicTemplateData?: { [key: string]: any };
}
