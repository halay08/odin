import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN658DbRecordOwnerId1597857769949 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records" ADD COLUMN "owned_by_id" uuid`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records" DROP COLUMN "owned_by_id"`);
    }

}
