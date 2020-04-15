import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN711ExternalId1599826255999 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "db_records" ADD IF NOT EXISTS "external_id" VARCHAR(255) NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records" ADD IF NOT EXISTS "external_app_id" VARCHAR(255) NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records" DROP COLUMN IF EXISTS "external_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records" DROP COLUMN IF EXISTS "external_app_id"`, undefined);
    }

}
