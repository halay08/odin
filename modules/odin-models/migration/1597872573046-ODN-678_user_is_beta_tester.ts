import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN678UserIsBetaTester1597872573046 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations_users" ADD COLUMN "is_beta_tester" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations_users" DROP COLUMN "is_beta_tester"`);
    }

}
