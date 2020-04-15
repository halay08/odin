import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserRbacRoleEntity } from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const odinapitoken = process.env.ODIN_API_TOKEN;

async function sync() {

    try {

        const httpClient = new BaseHttpClient();

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            entities: [],
        });


        const schemas = await pg.query('SELECT id FROM schemas');

        for(const schema of schemas) {

            // enable permissions for all schemas
            const permissionsRes = await httpClient.postRequest(
                Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                `v1.0/rbac/permissions/schemas/batch/${schema.id}`,
                odinapitoken,
                {}
            );

        }

        let schemasModules = await pg.query('SELECT DISTINCT(module_name) FROM schemas');

        schemasModules.push({module_name: 'IdentityManager'})

        const roleNames = [ 'Admin', 'Editor', 'ReadOnly' ];


        for(const schema of schemasModules) {

            const accessPermission: any = await httpClient.postRequest(
                Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                `v1.0/rbac/permissions`,
                odinapitoken,
                {
                    name: schema.module_name.toLowerCase() + '.access',
                    description: 'Access ' + schema.module_name,
                    type: 'DB_RECORD'
                }
            );


            const dataExportPermission: any = await httpClient.postRequest(
                Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                `v1.0/rbac/permissions`,
                odinapitoken,
                {
                    name: schema.module_name.toLowerCase() + '.data.export',
                    description: 'Export ' + schema.module_name + ' Data',
                    type: 'DB_RECORD'
                }
            );


            // Create roles

             const permissionsArr = await pg.query(`SELECT id, name FROM organizations_users_permissions WHERE name ILIKE '%${schema.module_name}%'`);

             const permissions = permissionsArr.filter((el: any) => (schema.module_name.toLowerCase() === el.name.split('.')[0]));

            for(const name of roleNames) {
                const role: any = await httpClient.postRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                    `v1.0/rbac/roles`,
                    odinapitoken,
                    {
                        name: schema.module_name + name,
                        description: schema.module_name + ' ' + name
                    }
                );

                if(name === 'Admin') {
                    // add all permissions from each schema
                    const adminPermisisons = permissions.map((el: any) => (el.id));
                    if(accessPermission.data !== undefined) adminPermisisons.push(accessPermission.data.id);
                    if(dataExportPermission.data !== undefined) adminPermisisons.push(dataExportPermission.data.id);
                    const adminRolesPermissions = await httpClient.postRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                        `v1.0/rbac/roles/${role.data.id}/permissions`,
                        odinapitoken,
                        {
                            permissionIds: adminPermisisons
                        }
                    );
                } else if(name === 'Editor') {
                    // add all permissions with search, get, update, delete
                    const editorPermisisons = permissions.filter((el: any) => ['search', 'get', 'update', 'delete'].some((text:any) => el.name.includes(text))).map((el: any) => (el.id));
                    if(accessPermission.data !== undefined) editorPermisisons.push(accessPermission.data.id);
                    if(dataExportPermission.data !== undefined) editorPermisisons.push(dataExportPermission.data.id);
                    const editorRolesPermissions = await httpClient.postRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                        `v1.0/rbac/roles/${role.data.id}/permissions`,
                        odinapitoken,
                        {
                            permissionIds: editorPermisisons
                        }
                    );
                } else if(name === 'ReadOnly') {
                    // add all permissions with search, get
                    const readOnlyPermisisons = permissions.filter((el: any) => ['search', 'get'].some((text:any) => el.name.includes(text))).map((el: any) => (el.id));
                    if(accessPermission.data !== undefined) readOnlyPermisisons.push(accessPermission.data.id)
                    const readOnlyRolesPermissions = await httpClient.postRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                        `v1.0/rbac/roles/${role.data.id}/permissions`,
                        odinapitoken,
                        {
                            permissionIds: readOnlyPermisisons
                        }
                    );
                }
            }

        }

    } catch (e) {
        console.error(e);
    }
}

sync();
