import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1293SchemaColumnPosition1616012612037 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_columns ADD COLUMN IF NOT EXISTS column_position integer DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_columns DROP COLUMN IF EXISTS column_position`);

    }

}
