import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN595Pipelines1596812686718 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pipelines" ADD COLUMN "key" VARCHAR(255)`);
        await queryRunner.query(`UPDATE "pipelines" set key = pipelines.name`);
        await queryRunner.query(`ALTER TABLE "pipelines" ALTER COLUMN "key" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" ADD COLUMN "key" VARCHAR(255)`);
        await queryRunner.query(`UPDATE "pipelines_stages" set key = pipelines_stages.name`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" ALTER COLUMN "key" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" ADD COLUMN "is_success" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" ADD COLUMN "is_fail" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" ADD COLUMN "is_default" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pipelines" DROP COLUMN "key"`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" DROP COLUMN "key" `);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" DROP COLUMN "is_success"`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" DROP COLUMN "is_fail"`);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" DROP COLUMN "is_default"`);
    }
}
