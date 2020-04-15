import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN5561595797022280 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schemas" ADD "has_title" boolean NOT NULL DEFAULT true`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
