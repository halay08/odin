import * as dotenv from "dotenv";
import { ServiceResponse } from "@d19n/client/dist/client/ServiceResponse";
import { ServiceClient } from "@d19n/client/dist/client/ServiceClient";
import { Utilities } from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { SchemaEntity } from "@d19n/models/dist/schema-manager/schema/schema.entity";
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { DbRecordEntity } from "@d19n/models/dist/schema-manager/db/record/db.record.entity";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { DbRecordCreateUpdateDto } from "@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto";
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";


dotenv.config();

export class SchemaManagerTestHelpers {
    public static async login(): Promise<ServiceResponse<IdentityOrganizationUserLoginResponse>> {
        return new Promise((resolve, reject) => {
            HelpersIdentityApi.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD).subscribe(loginResponse => {
                if(!loginResponse.successful) {
                    console.log(loginResponse);
                }
                resolve(loginResponse);
            });
        });
    }


    /**
     * Get a schema by module and entity name
     * @param moduleName
     * @param entityName
     */
    public static async getSchemaByModuleAndEntity(
        moduleName: string,
        entityName: string,
    ): Promise<ServiceResponse<ApiResponseType<SchemaEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<SchemaEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                service: `v1.0/schemas/bymodule?moduleName=${moduleName}&entityName=${entityName}`,
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }


    /**
     * Create one or many records in the database
     * @param entityName
     * @param createRecords
     */
    public static async dbServicePostRequest(
        entityName: string,
        createRecords: DbRecordCreateUpdateDto[],
    ): Promise<ServiceResponse<ApiResponseType<DbRecordEntityTransform[]>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<DbRecordEntityTransform[]>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                service: `v1.0/db/${entityName}`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body: createRecords,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }


    /**
     * Get a single record from the database
     * @param size
     * @param offset
     * @param terms
     * @param schemaId
     */
    public static async dbServiceSearchRequest(
        size: number,
        offset: number,
        terms: string,
        schemaId: string,
    ): Promise<ServiceResponse<any>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<any>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                service: `v1.0/db/search?size=${size}&offset=${offset}&terms=${terms || "*"}&schemas=${schemaId}`,
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    /**
     * Get a single record from the database
     * @param recordId
     */
    public static async dbServiceGetRequest(recordId: string): Promise<ServiceResponse<ApiResponseType<DbRecordEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<DbRecordEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                service: `v1.0/db/${recordId}`,
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

}
