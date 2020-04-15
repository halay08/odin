import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN993AddTimestampsToDbRecordTables1608828528123 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Update timestamp trigger

        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_set_timestamp_update ON db_records;`);
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION trigger_set_timestamp_update()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_update ON db_records;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_update
        BEFORE UPDATE ON db_records 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_update();`);


        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_update ON db_records_columns;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_update
        BEFORE UPDATE ON db_records_columns 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_update();`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_update ON db_records_associations;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_update
        BEFORE UPDATE ON db_records_associations 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_update();`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_update ON db_records_associations_columns;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_update
        BEFORE UPDATE ON db_records_associations_columns 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_update();`);


        // Insert timestamp trigger
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION trigger_set_timestamp_insert()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            NEW.created_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_insert ON db_records;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_insert
        BEFORE INSERT ON db_records 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_insert();`);


        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_insert ON db_records_columns;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_insert
        BEFORE INSERT ON db_records_columns 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_insert();`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_insert ON db_records_associations;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_insert
        BEFORE INSERT ON db_records_associations 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_insert();`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_insert ON db_records_associations_columns;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_insert
        BEFORE INSERT ON db_records_associations_columns 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_insert();`);


        // Delete timestamp trigger
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION trigger_set_timestamp_delete()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.deleted_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_delete ON db_records;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_delete
        BEFORE DELETE ON db_records 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_delete();`);


        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_delete ON db_records_columns;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_delete
        BEFORE DELETE ON db_records_columns 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_delete();`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_delete ON db_records_associations;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_delete
        BEFORE DELETE ON db_records_associations 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_delete();`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS set_timestamp_delete ON db_records_associations_columns;`);
        await queryRunner.query(`
        CREATE TRIGGER set_timestamp_delete
        BEFORE DELETE ON db_records_associations_columns 
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp_delete();`);


    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_set_timestamp_delete ON db_records;`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_set_timestamp_delete ON db_records_columns;`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_set_timestamp_delete ON db_records_associations;`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_set_timestamp_delete ON db_records_associations_columns;`);

    }

}
