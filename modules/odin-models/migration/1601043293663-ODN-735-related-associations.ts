import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN735RelatedAssociations1601043293663 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "db_records_associations" ADD COLUMN "related_association_id" uuid NULL DEFAULT null`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "db_records_associations" DROP COLUMN "related_association_id"`);
    }

}
