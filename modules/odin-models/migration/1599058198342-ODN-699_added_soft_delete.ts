import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN699AddedSoftDelete1599058198342 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // drop is_deleted column
        await queryRunner.query(`ALTER TABLE "organizations_users_permissions" DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users_groups"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_associations"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_columns_options"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_columns_validators"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "forms"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "forms_sections"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_columns"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records_columns"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records_associations"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "pipelines"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "pipelines_stages"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users_roles"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_apps"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users_rbac_tokens"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "logs"."user_activity"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);
        await queryRunner.query(`ALTER TABLE "queries"  DROP COLUMN IF EXISTS "is_deleted"`, undefined);

        // Create deleted_at column
        await queryRunner.query(`ALTER TABLE "db_records_columns" ADD IF NOT EXISTS "deleted_at" TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records_associations" ADD IF NOT EXISTS "deleted_at" TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records" ADD IF NOT EXISTS "deleted_at" TIMESTAMP`, undefined);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "organizations_users_permissions" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users_groups" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_associations" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_columns_options" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_columns_validators" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "forms" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "forms_sections" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "schemas_columns" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records_columns" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records_associations" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "pipelines" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "pipelines_stages" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users_roles" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_apps" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "organizations_users_rbac_tokens" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "logs"."user_activity" ADD "is_deleted" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "queries" ADD "is_deleted" boolean`, undefined);

        await queryRunner.query(`ALTER TABLE "db_records_columns" DROP COLUMN "deleted_at"`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records_associations" DROP COLUMN "deleted_at"`, undefined);
        await queryRunner.query(`ALTER TABLE "db_records" DROP COLUMN "deleted_at"`, undefined);
    }

}
