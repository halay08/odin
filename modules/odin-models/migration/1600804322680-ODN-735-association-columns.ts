import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN735AssociationColumns1600804322680 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "schemas_associations" DROP COLUMN "required_on_parent_create"`);
        await queryRunner.query(`ALTER TABLE "schemas_associations" DROP COLUMN "required_on_child_create"`);
        await queryRunner.query(`ALTER TABLE "schemas_associations" ADD COLUMN "has_column_mappings" boolean NULL DEFAULT false`);

        await queryRunner.query(`CREATE TABLE "db_records_associations_columns" ( \ 
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), \ 
        "organization_id" uuid NOT NULL, \ 
        "db_record_association_id" uuid NOT NULL, \ 
        "schema_id" uuid NOT NULL,  
        "column_id" uuid NOT NULL, \ 
        "record_id" uuid NOT NULL, \ 
        "last_modified_by_id" uuid, CONSTRAINT "PK_921b33e35774e203402x5a31yz3" PRIMARY KEY ("id"), \
        "value" text, \ 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), \ 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), \ 
        "deleted_at" TIMESTAMP) \ 
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP TABLE "db_records_associations_columns"`);
    }

}
