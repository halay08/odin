import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1227AddingSchemaUpsertOnCreate1613665595461 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas ADD COLUMN IF NOT EXISTS upsert_on_create boolean DEFAULT true`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas DROP COLUMN IF EXISTS upsert_on_create`);

    }

}
