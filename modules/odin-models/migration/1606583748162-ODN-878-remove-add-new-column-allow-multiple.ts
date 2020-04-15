import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN878RemoveAddNewColumnAllowMultiple1606583748162 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE schemas_associations DROP COLUMN allow_multiple`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE schemas_associations ADD COLUMN allow_multiple boolean DEFAULT false`);
    }

}
