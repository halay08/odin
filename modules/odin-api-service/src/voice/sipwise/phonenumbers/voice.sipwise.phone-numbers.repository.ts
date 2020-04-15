import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import moment = require('moment');

export class VoiceSipwisePhoneNumbersRepository {

    private connection: Connection;

    constructor(
        @InjectConnection('odinDb') connection: Connection,
    ) {
        this.connection = connection;
    }


    /**
     *
     * @param tableName
     */
    public async getPhoneNumberByOrderId(principal: OrganizationUserEntity, orderId: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.connection.query(`SELECT * FROM voice.phone_numbers WHERE odin_order_id = ${orderId}`);
                return resolve(response);
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(500, e.message, e));
            }
        });
    }

    /**
     *
     * @param tableName
     */
    public async getPhoneNumberByContactId(principal: OrganizationUserEntity, contactId: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.connection.query(`SELECT * FROM voice.phone_numbers WHERE odin_contact_id = ${contactId}`);
                return resolve(response);
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(500, e.message, e));
            }
        });
    }

    /**
     *
     * @param tableName
     */
    public async getNextAvailablePhoneNumber(principal: OrganizationUserEntity): Promise<{ id: number, area_code: number, country_code: number, subscriber_number: number }> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.connection.query(`SELECT * FROM voice.phone_numbers WHERE id > 100 AND odin_order_id IS NULL and odin_contact_id IS NULL LIMIT 10`);
                return resolve(response[0]);
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(500, e.message, e));
            }
        });
    }

    /**
     *
     * @param tableName
     */
    public async updatePhoneNumberById(
        principal: OrganizationUserEntity,
        phoneNumberId: number,
        odinOrderId: string,
        odinContactId: string,
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                const response = await this.connection.query(`
                UPDATE
                    voice.phone_numbers
                SET
                    odin_order_id = '${odinOrderId}',
                    odin_contact_id = '${odinContactId}',
                    last_modified_by_id = '${principal.id}',
                    updated_at = '${moment().utc().toISOString()}'
                WHERE id = ${phoneNumberId} \
                AND odin_order_id IS NULL
                AND odin_contact_id IS NULL`);

                return resolve(response);
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(500, e.message, e));
            }
        });
    }
}
