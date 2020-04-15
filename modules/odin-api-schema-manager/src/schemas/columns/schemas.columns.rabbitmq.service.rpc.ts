import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import dotenv from 'dotenv';
import { SchemasColumnsService } from './schemas.columns.service';

dotenv.config();

@Injectable()
export class SchemasColumnsRabbitmqServiceRpc {

  private schemasColumnsService: SchemasColumnsService;

  public constructor(schemasColumnsService: SchemasColumnsService) {
    this.schemasColumnsService = schemasColumnsService;
  }

  // RPC methods
  @RabbitRPC({
    exchange: process.env.MODULE_NAME,
    routingKey: `${process.env.MODULE_NAME}.getColumnBySchemaIdAndColumnId`,
    queue: `${process.env.MODULE_NAME}.getColumnBySchemaIdAndColumnId`,
  })
  public async getSchemaByOrganizationAndId(msg: any) {

    try {

      const schema = await this.schemasColumnsService.getByOrganizationAndSchemaIdAndId(
        msg.principal.organization,
        msg.schemaId,
        msg.columnId,
      )

      if(schema) {
        return {
          statusCode: 200,
          message: 'success',
          data: schema,
        };
      } else {
        return {
          statusCode: 404,
          message: 'schema not found',
          data: undefined,
        };
      }
    } catch (e) {
      console.error(e);
      return {
        statusCode: 500,
        message: e.message,
        data: undefined,
      }
    }
  }
}
