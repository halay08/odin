import {MigrationInterface, QueryRunner} from "typeorm";

export class ragStatus1596163306386 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records" ALTER COLUMN "rag_status" SET DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

    }
