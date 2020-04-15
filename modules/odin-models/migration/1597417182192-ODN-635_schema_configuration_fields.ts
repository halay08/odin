import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN635SchemaConfigurationFields1597417182192 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "queryable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "replicateable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "retrievable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "searchable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "triggerable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "undeletable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "schemas" ADD COLUMN "updateable" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "queryable"`);
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "replicateable"`);
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "retrievable"`);
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "searchable"`);
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "triggerable"`);
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "undeletable"`);
        await queryRunner.query(`ALTER TABLE "schemas" DROP COLUMN "updateable"`);
    }

}
