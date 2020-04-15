import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecordsUsersAssignments1614789132214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "db_records_organization_users_assignments" ("db_record_id" uuid NOT NULL, "organization_user_id" uuid NOT NULL, CONSTRAINT "PK_db_record_user_id" PRIMARY KEY ("db_record_id", "organization_user_id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_db_records_organization_users_assignments_user_id" ON "db_records_organization_users_assignments" ("db_record_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_db_records_organization_users_assignments_record_id" ON "db_records_organization_users_assignments" ("organization_user_id") `);
    await queryRunner.query(`ALTER TABLE "db_records_organization_users_assignments" ADD CONSTRAINT "FK_db_records_organization_users_assignments_record_id" FOREIGN KEY ("db_record_id") REFERENCES "db_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "db_records_organization_users_assignments" ADD CONSTRAINT "FK_db_records_organization_users_assignments_user_id" FOREIGN KEY ("organization_user_id") REFERENCES "organizations_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "db_records_organization_users_assignments"`);
    await queryRunner.query(`DROP INDEX "IDX_db_records_organization_users_assignments_record_id"`);
    await queryRunner.query(`DROP INDEX "IDX_db_records_organization_users_assignments_user_id"`);
    await queryRunner.query(`ALTER TABLE "FK_db_records_organization_users_assignments_record_id" DROP CONSTRAINT "FK_ac71ee6e3f0e3058bc22d6c75af"`);
    await queryRunner.query(`ALTER TABLE "FK_db_records_organization_users_assignments_user_id" DROP CONSTRAINT "FK_03e1f2f54473ea920939dd96c19"`);
  }
}


// add to OrganizationUserEntity
// @ManyToMany(type => DbRecordEntity, dbRecord => dbRecord.usersAssigned, { eager: true, cascade: true })
// @JoinTable({ name: 'db_records_organization_users_assignments' })
// public recordsAssigned: DbRecordEntity[];

// add to DbRecordEntity
// @ManyToMany(type => OrganizationUserEntity, user => user.recordsAssigned)
// public usersAssigned?: OrganizationUserEntity[];
