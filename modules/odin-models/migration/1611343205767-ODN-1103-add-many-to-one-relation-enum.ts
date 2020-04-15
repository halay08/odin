import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN1103AddManyToOneRelationEnum1611343205767 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

          await queryRunner.query(`ALTER TYPE schemas_associations_type_enum ADD VALUE IF NOT EXISTS 'MANY_TO_ONE'`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
