import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN595SchemaIsTitleColumn1597369528413 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "is_title_unique" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "is_title_unique"`);
    }

}
