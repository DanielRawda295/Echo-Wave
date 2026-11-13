import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SecuritySessions1794528000000 implements MigrationInterface {
  name = 'SecuritySessions1794528000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "echowave"."user" ADD "tokenVersion" integer NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_user_google_subject" ON "echowave"."user" ("googleId") WHERE "googleId" IS NOT NULL',
    );
    await queryRunner.query(
      'CREATE TABLE "echowave"."media_cleanup_jobs" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_media_cleanup_jobs" PRIMARY KEY ("id"), CONSTRAINT "UQ_media_cleanup_jobs_url" UNIQUE ("url"))',
    );
    await queryRunner.query(
      'ALTER TABLE "echowave"."media_cleanup_jobs" ENABLE ROW LEVEL SECURITY',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "echowave"."media_cleanup_jobs"');
    await queryRunner.query('DROP INDEX "echowave"."UQ_user_google_subject"');
    await queryRunner.query(
      'ALTER TABLE "echowave"."user" DROP COLUMN "tokenVersion"',
    );
  }
}
