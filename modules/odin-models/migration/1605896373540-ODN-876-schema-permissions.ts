import {MigrationInterface, QueryRunner} from "typeorm";

export class ODN876SchemaPermissions1605896373540 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "organizations_schemas_permissions_links" ("permission_id" uuid NOT NULL, "schema_id" uuid NOT NULL, CONSTRAINT "PK_5c78024bdf0ed7e67b717494698" PRIMARY KEY ("permission_id", "schema_id"))`);
        await queryRunner.query(`CREATE TABLE "organizations_schemas_columns_permissions_links" ("permission_id" uuid NOT NULL, "schema_column_id" uuid NOT NULL, CONSTRAINT "PK_5c78024bxy0ed7e23b717494698" PRIMARY KEY ("permission_id", "schema_column_id"))`);

        await queryRunner.query(`ALTER TABLE public.organizations_schemas_columns_permissions_links
        ADD CONSTRAINT "FK_e20ab75c095290ed118998371235" FOREIGN KEY (permission_id)
        REFERENCES public.organizations_users_permissions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE;`);

        await queryRunner.query(`ALTER TABLE public.organizations_schemas_columns_permissions_links
        ADD CONSTRAINT "FK_e20ab75c095290ed1189983734asd" FOREIGN KEY (schema_column_id)
        REFERENCES public.schemas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE;`);

        await queryRunner.query(`ALTER TABLE public.organizations_schemas_permissions_links
        ADD CONSTRAINT "FK_e20ab75c095290ed118998jes235" FOREIGN KEY (permission_id)
        REFERENCES public.organizations_users_permissions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE;`);

        await queryRunner.query(`ALTER TABLE public.organizations_schemas_permissions_links
        ADD CONSTRAINT "FK_e20ab75c095290873189983734asd" FOREIGN KEY (schema_id)
        REFERENCES public.schemas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP TABLE "organizations_schemas_permissions_links"`);
        await queryRunner.query(`DROP TABLE "organizations_schemas_columns_permissions_links"`);
    }

}
