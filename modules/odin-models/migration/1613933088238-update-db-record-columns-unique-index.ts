import {MigrationInterface, QueryRunner} from "typeorm";

export class updateDbRecordColumnsUniqueIndex1613933088238 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP INDEX IF EXISTS public."IDX_2ab9649d7d7a01e5f1d11bb48e"`);

        // -- 21/02/2021
        // -- modified unique index for schemas_columns
        // -- allows multiple names to be used with schema types
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_sc_unq_sid_orgid_stid_name"
        ON public.schemas_columns USING btree
        (schema_id ASC NULLS LAST, organization_id ASC NULLS LAST, schema_type_id ASC NULLS LAST, name COLLATE pg_catalog."default" ASC NULLS LAST)
        TABLESPACE pg_default`);

        // await queryRunner.query(`ALTER TABLE db_records_columns ADD CONSTRAINT IF NOT EXISTS c_dbrc_org_id_rid_col_id UNIQUE (organization_id, record_id, column_id);`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
