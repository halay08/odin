import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1164SchemaManagerSequences1613599466396 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemas = await queryRunner.query('SELECT id, is_sequential, record_number FROM schemas');

        for (const schema of schemas) {
            if(schema.is_sequential) {
                const sequenceName = `${schema.id}_seq`;
                await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "${sequenceName}" START ${schema.record_number || 1} MAXVALUE 1000000000000`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemas = await queryRunner.query('SELECT id, is_sequential FROM schemas');

        for (const schema of schemas) {
            if(schema.is_sequential) {
                const sequenceName = `${schema.id}_seq`;
                await queryRunner.query(`DROP SEQUENCE IF EXISTS "${sequenceName}"`);
            }
        }
    }

}
