import {MigrationInterface, QueryRunner} from "typeorm";

export class changeSchemaColumnCoumnType1601486025101 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_columns ALTER COLUMN type TYPE VARCHAR(255)`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
