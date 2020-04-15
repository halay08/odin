import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN993OptimizeReadWrites1608759340628 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE db_records_associations ADD COLUMN IF NOT EXISTS parent_entity varchar(255)`);
        await queryRunner.query(`ALTER TABLE db_records_associations ADD COLUMN IF NOT EXISTS child_entity varchar(255)`);
        await queryRunner.query(`ALTER TABLE db_records ADD COLUMN IF NOT EXISTS entity varchar(255)`);
        await queryRunner.query(`ALTER TABLE db_records_columns ADD COLUMN IF NOT EXISTS column_name varchar(255)`);
        await queryRunner.query(`ALTER TABLE db_records_associations_columns ADD COLUMN IF NOT EXISTS column_name varchar(255)`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE db_records_associations DROP COLUMN IF EXISTS parent_entity`);
        await queryRunner.query(`ALTER TABLE db_records_associations DROP COLUMN IF EXISTS child_entity`);
        await queryRunner.query(`ALTER TABLE db_records DROP COLUMN IF EXISTS entity`);
        await queryRunner.query(`ALTER TABLE db_records_columns DROP COLUMN IF EXISTS column_name`);
        await queryRunner.query(`ALTER TABLE db_records_associations_columns DROP COLUMN IF EXISTS column_name`);


    }

}
