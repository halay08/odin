import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN811SchemaColumnsTransformProperty1607197153622 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_columns ADD COLUMN IF NOT EXISTS transform varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_columns DROP COLUMN IF EXISTS transform`);
    }

}
