import { MigrationInterface, QueryRunner } from "typeorm";

export class ODIN5101595345982896 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ALTER
    await queryRunner.query(`ALTER TABLE "schemas" ALTER COLUMN "name" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "schemas" ALTER COLUMN "entity_name" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "schemas" ALTER COLUMN "module_name" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "schemas" ALTER COLUMN "record_number_prefix" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "schemas" ALTER COLUMN "description" TYPE VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE "schemas_columns" ALTER COLUMN "name" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "schemas_columns" ALTER COLUMN "default_value" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "schemas_columns" ALTER COLUMN "description" TYPE VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE "pipelines" ALTER COLUMN "module_name" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "pipelines" ALTER COLUMN "entity_name" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "pipelines" ALTER COLUMN "description" TYPE VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE "pipelines_stages" ALTER COLUMN "name" TYPE VARCHAR(55)`);
    await queryRunner.query(`ALTER TABLE "pipelines_stages" ALTER COLUMN "description" TYPE  VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE "db_records" ALTER COLUMN "record_number" TYPE VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE "db_records" ALTER COLUMN "rag_description" TYPE VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE "db_records_associations" ALTER COLUMN "label" TYPE VARCHAR(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
