import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN780SavingUsersViews1602869484534 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE "db_records_views_ui" ( \ 
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), \ 
        "organization_id" uuid NOT NULL, \ 
        "user_id" uuid NOT NULL,  
        "title" varchar(255) NOT NULL, \ 
        "module_name" varchar(255) NOT NULL, \ 
        "entity_name" varchar(255) NOT NULL, \ 
        "key" varchar(255) NOT NULL,  
        "view" jsonb NOT NULL, \
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), \ 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), \ 
        "deleted_at" TIMESTAMP) \ 
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP TABLE "db_records_views_ui"`);
    }

}
