import { RPC_GET_SCHEMA_BY_ID } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IGetSchemaById } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import dotenv from 'dotenv';
import { SchemasService } from './schemas.service';

dotenv.config();

@Injectable()
export class SchemasRabbitmqServiceRpc {

  private schemasService: SchemasService;

  public constructor(schemasService: SchemasService) {
    this.schemasService = schemasService;
  }

  // RPC methods
  @RabbitRPC({
    exchange: process.env.MODULE_NAME,
    routingKey: `${process.env.MODULE_NAME}.${RPC_GET_SCHEMA_BY_ID}`,
    queue: `${process.env.MODULE_NAME}.${RPC_GET_SCHEMA_BY_ID}`,
  })
  public async getSchemaByOrganizationAndId(msg: IGetSchemaById) {
    try {

      const schema = await this.schemasService.getSchemaByOrganizationAndId(
        msg.principal.organization,
        { schemaId: msg.schemaId },
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
