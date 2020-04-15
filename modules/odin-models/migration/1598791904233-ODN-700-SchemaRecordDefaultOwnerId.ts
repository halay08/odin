import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN700SchemaRecordDefaultOwnerId1598791904233 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN IF NOT EXISTS "record_default_owner_id" uuid NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN IF EXISTS "record_default_owner_id"`);
    }

}
