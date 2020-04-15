import {MigrationInterface, QueryRunner} from "typeorm";

export class odinConnectQueries1598030880274 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE queries( \
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, \
            organization_id uuid  NOT NULL, \
            user_id uuid  NOT NULL, \
            name VARCHAR(55) NOT NULL, \
            description VARCHAR(255) NOT NULL, \
            type VARCHAR(55) NOT NULL, \
            query TEXT NOT NULL, \
            params jsonb NULL,
            created_at TIMESTAMP NOT NULL DEFAULT now(), \
            updated_at TIMESTAMP NOT NULL DEFAULT now(), \
            is_deleted boolean NOT NULL DEFAULT false
        )`);
        await queryRunner.query(`ALTER TABLE "queries" ADD CONSTRAINT "FK_organization_id_queries" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queries" DROP CONSTRAINT "FK_organization_id_queries"`, undefined);
        await queryRunner.query(`DROP TABLE "queries"`);
    }

}
