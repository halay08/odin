import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1384relationGroupUser1617301568820 implements MigrationInterface {
    name = 'ODN1384relationGroupUser1617301568820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "db_records_groups" ("db_record" uuid NOT NULL, "group" uuid NOT NULL, CONSTRAINT "PK_916589bba24e279ef060b921694" PRIMARY KEY ("db_record", "group"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3ee2e5990d4755ed40f75be53e" ON "db_records_groups" ("db_record") `);
        await queryRunner.query(`CREATE INDEX "IDX_8976adf10ed0f27f48b0219284" ON "db_records_groups" ("group") `);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "FK_3ee2e5990d4755ed40f75be53ec" FOREIGN KEY ("db_record") REFERENCES "db_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "FK_8976adf10ed0f27f48b02192844" FOREIGN KEY ("group") REFERENCES "organizations_users_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "FK_8976adf10ed0f27f48b02192844"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "FK_3ee2e5990d4755ed40f75be53ec"`);
        await queryRunner.query(`DROP TABLE "db_records_groups"`);
    }

}
