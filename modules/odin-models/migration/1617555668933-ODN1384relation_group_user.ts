import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1384relationGroupUser1617555668933 implements MigrationInterface {
    name = 'ODN1384relationGroupUser1617555668933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "FK_3ee2e5990d4755ed40f75be53ec"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "FK_8976adf10ed0f27f48b02192844"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "PK_916589bba24e279ef060b921694"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "PK_8976adf10ed0f27f48b02192844" PRIMARY KEY ("group")`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP COLUMN "db_record"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "PK_8976adf10ed0f27f48b02192844"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP COLUMN "group"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD "record_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "PK_e995d019745c3224df40fcc7473" PRIMARY KEY ("record_id")`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD "group_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "PK_e995d019745c3224df40fcc7473"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "PK_0eb678baf50ad0f8053a5bab6ec" PRIMARY KEY ("record_id", "group_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_e995d019745c3224df40fcc747" ON "db_records_groups" ("record_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_af88c9a3c7efa2405cd1af1e92" ON "db_records_groups" ("group_id") `);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "FK_e995d019745c3224df40fcc7473" FOREIGN KEY ("record_id") REFERENCES "db_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "FK_af88c9a3c7efa2405cd1af1e927" FOREIGN KEY ("group_id") REFERENCES "organizations_users_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "FK_af88c9a3c7efa2405cd1af1e927"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "FK_e995d019745c3224df40fcc7473"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "PK_0eb678baf50ad0f8053a5bab6ec"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "PK_e995d019745c3224df40fcc7473" PRIMARY KEY ("record_id")`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP COLUMN "group_id"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "PK_e995d019745c3224df40fcc7473"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP COLUMN "record_id"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD "group" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "PK_8976adf10ed0f27f48b02192844" PRIMARY KEY ("group")`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD "db_record" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" DROP CONSTRAINT "PK_8976adf10ed0f27f48b02192844"`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "PK_916589bba24e279ef060b921694" PRIMARY KEY ("db_record", "group")`);
        await queryRunner.query(`CREATE INDEX "IDX_8976adf10ed0f27f48b0219284" ON "db_records_groups" ("group") `);
        await queryRunner.query(`CREATE INDEX "IDX_3ee2e5990d4755ed40f75be53e" ON "db_records_groups" ("db_record") `);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "FK_8976adf10ed0f27f48b02192844" FOREIGN KEY ("group") REFERENCES "organizations_users_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "db_records_groups" ADD CONSTRAINT "FK_3ee2e5990d4755ed40f75be53ec" FOREIGN KEY ("db_record") REFERENCES "db_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
