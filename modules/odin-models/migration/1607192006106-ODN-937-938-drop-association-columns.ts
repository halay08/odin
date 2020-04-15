import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN937938DropAssociationColumns1607192006106 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE db_records DROP COLUMN IF EXISTS rag_status`);
        await queryRunner.query(`ALTER TABLE db_records DROP COLUMN IF EXISTS rag_description`);
        await queryRunner.query(`ALTER TABLE db_records_associations DROP COLUMN IF EXISTS label`);
        await queryRunner.query(`ALTER TABLE db_records_associations DROP COLUMN IF EXISTS description`);
        await queryRunner.query(`ALTER TABLE db_records_associations DROP COLUMN IF EXISTS quantity`);
        await queryRunner.query(`ALTER TABLE db_records_associations DROP COLUMN IF EXISTS position`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE db_records ADD COLUMN IF NOT EXISTS rag_status integer DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE db_records ADD COLUMN IF NOT EXISTS rag_description character varying(255)`);
        await queryRunner.query(`ALTER TABLE db_records_associations ADD COLUMN IF NOT EXISTS label character varying(255)`);
        await queryRunner.query(`ALTER TABLE db_records_associations ADD COLUMN IF NOT EXISTS description character varying(255) DEFAULT null`);
        await queryRunner.query(`ALTER TABLE db_records_associations ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE db_records_associations ADD COLUMN IF NOT EXISTS position integer DEFAULT 0`);

    }

}
