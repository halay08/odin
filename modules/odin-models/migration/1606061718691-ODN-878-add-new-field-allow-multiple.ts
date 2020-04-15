import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN878AddNewFieldAllowMultiple1606061718691 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_associations ADD COLUMN allow_multiple boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE schemas_associations DROP COLUMN allow_multiple`);
    }

}
