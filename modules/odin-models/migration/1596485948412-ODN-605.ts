import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN6051596485948412 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records" ADD COLUMN "stage_updated_at" timestamp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records" DROP COLUMN "stage_updated_at"`);
    }

}
