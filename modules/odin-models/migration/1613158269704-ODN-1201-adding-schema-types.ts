import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1201AddingSchemaTypes1613158269704 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE "schemas_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "organization_id" uuid NOT NULL, 
        "schema_id" uuid NOT NULL, 
        "name" character varying(32) NOT NULL, 
        "label" character varying(255) NOT NULL, 
        "description" character varying(255) NOT NULL, 
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "pk_schemas_types_id" PRIMARY KEY ("id"))
        `);

        // -- Constraint: fk_schema_id
        // -- ALTER TABLE public.schemas_columns DROP CONSTRAINT "fk_schema_id";

        await queryRunner.query(`ALTER TABLE schemas_types
        ADD CONSTRAINT "fk_schema_id" FOREIGN KEY (schema_id)
        REFERENCES public.schemas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE`);


        await queryRunner.query(`CREATE UNIQUE INDEX "idx_org_sid_name" ON schemas_types (organization_id, schema_id, name) `);

        await queryRunner.query(`ALTER TABLE schemas_columns ADD COLUMN IF NOT EXISTS schema_type_id uuid`);

        await queryRunner.query(`ALTER TABLE db_records ADD COLUMN IF NOT EXISTS schema_type_id uuid`);
        await queryRunner.query(`ALTER TABLE db_records ADD COLUMN IF NOT EXISTS type varchar(255)`);

        await queryRunner.query(`ALTER TABLE db_records_columns ADD COLUMN IF NOT EXISTS schema_type_id uuid`);
        await queryRunner.query(`ALTER TABLE db_records_columns ADD COLUMN IF NOT EXISTS type varchar(255)`);

        await queryRunner.query(`ALTER TABLE db_records_associations_columns ADD COLUMN IF NOT EXISTS schema_type_id uuid`);
        await queryRunner.query(`ALTER TABLE db_records_associations_columns ADD COLUMN IF NOT EXISTS type varchar(255)`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`DROP TABLE IF EXISTS schemas_types`);

        await queryRunner.query(`ALTER TABLE schemas_columns DROP COLUMN IF EXISTS schema_type_id`);

        await queryRunner.query(`ALTER TABLE db_records DROP COLUMN IF EXISTS schema_type_id`);
        await queryRunner.query(`ALTER TABLE db_records DROP COLUMN IF EXISTS type`);

        await queryRunner.query(`ALTER TABLE db_records_columns DROP COLUMN IF EXISTS schema_type_id`);
        await queryRunner.query(`ALTER TABLE db_records_columns DROP COLUMN IF EXISTS type`);

        await queryRunner.query(`ALTER TABLE db_records_associations_columns DROP COLUMN IF EXISTS schema_type_id`);
        await queryRunner.query(`ALTER TABLE db_records_associations_columns DROP COLUMN IF EXISTS type`);

    }

}
