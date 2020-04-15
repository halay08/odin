import {MigrationInterface, QueryRunner} from "typeorm";

export class ragStatus1595461836601 implements MigrationInterface {
    name = 'ragStatus1595461836601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records" ALTER COLUMN "rag_status" SET DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
