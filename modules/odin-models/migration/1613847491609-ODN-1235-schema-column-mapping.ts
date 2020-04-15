import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1235SchemaColumnMapping1613847491609 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_columns ADD COLUMN IF NOT EXISTS mapping varchar(255)`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_columns DROP COLUMN IF EXISTS mapping`);

    }

}
