import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1228AddingSchemaAssignableProperty1613690440000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas ADD COLUMN IF NOT EXISTS assignable boolean DEFAULT false`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas DROP COLUMN IF EXISTS assignable`);

    }

}
