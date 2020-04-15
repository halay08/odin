import {MigrationInterface, QueryRunner} from "typeorm";

export class addWebUrlToOrganization1607043726215 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS web_url varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE organizations DROP COLUMN IF EXISTS web_url`);

    }

}
