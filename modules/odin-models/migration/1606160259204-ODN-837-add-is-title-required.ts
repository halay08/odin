import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN837AddIsTitleRequired1606160259204 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE schemas ADD COLUMN IF NOT EXISTS is_title_required boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE schemas ADD COLUMN IF NOT EXISTS position integer DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
