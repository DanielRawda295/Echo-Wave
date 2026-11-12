import type { MigrationInterface, QueryRunner } from 'typeorm';

// Static schema snapshot. Future entity changes require a new migration.
export class InitialEchoWave1794441600000 implements MigrationInterface {
  name = 'InitialEchoWave1794441600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE \"echowave\".\"deactivated_accounts\" (\"id\" SERIAL NOT NULL, \"email\" character varying NOT NULL, \"googleId\" character varying, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT \"UQ_29136498c70f18d4f92ab10f952\" UNIQUE (\"email\"), CONSTRAINT \"PK_82260e79ed7b7300edb2bd16c76\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TABLE \"echowave\".\"user\" (\"id\" SERIAL NOT NULL, \"email\" character varying NOT NULL, \"password\" character varying, \"role\" character varying NOT NULL DEFAULT 'listener', \"googleId\" character varying, \"username\" character varying, \"avatar\" character varying, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT \"UQ_e12875dfb3b1d92d7d7c5377e22\" UNIQUE (\"email\"), CONSTRAINT \"PK_cace4a159ff9f2512dd42373760\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TABLE \"echowave\".\"track\" (\"id\" SERIAL NOT NULL, \"title\" character varying NOT NULL, \"artist\" character varying NOT NULL, \"genre\" character varying, \"fileUrl\" character varying NOT NULL, \"coverUrl\" character varying, \"playCount\" integer NOT NULL DEFAULT '0', \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"uploaderId\" integer, CONSTRAINT \"PK_0631b9bcf521f8fab3a15f2c37e\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TABLE \"echowave\".\"playlist\" (\"id\" SERIAL NOT NULL, \"name\" character varying NOT NULL, \"items\" jsonb NOT NULL DEFAULT '[]', \"creatorId\" integer, CONSTRAINT \"PK_538c2893e2024fabc7ae65ad142\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TABLE \"echowave\".\"otp_codes\" (\"id\" SERIAL NOT NULL, \"email\" character varying NOT NULL, \"code\" character varying NOT NULL, \"isUsed\" boolean NOT NULL DEFAULT false, \"expiresAt\" TIMESTAMP NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT \"PK_9d0487965ac1837d57fec4d6a26\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TABLE \"echowave\".\"track_likes\" (\"id\" SERIAL NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"trackId\" integer, \"userId\" integer, CONSTRAINT \"UQ_a2a7fcbeed6900ec28a77616cac\" UNIQUE (\"trackId\", \"userId\"), CONSTRAINT \"PK_81c79eef7d466e389e350c3bfbb\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TABLE \"echowave\".\"track_comments\" (\"id\" SERIAL NOT NULL, \"text\" text NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"trackId\" integer, \"userId\" integer, CONSTRAINT \"PK_8fea94dd5123b9c89f10f5f72f6\" PRIMARY KEY (\"id\"))");
    await queryRunner.query("CREATE TABLE \"echowave\".\"playlist_tracks_track\" (\"playlistId\" integer NOT NULL, \"trackId\" integer NOT NULL, CONSTRAINT \"PK_b1696ca1b814cd664fc3e50dbbc\" PRIMARY KEY (\"playlistId\", \"trackId\"))");
    await queryRunner.query("CREATE INDEX \"IDX_53e780b9e2955ef02466636cda\" ON \"echowave\".\"playlist_tracks_track\" (\"playlistId\") ");
    await queryRunner.query("CREATE INDEX \"IDX_54dd1e92dd268df3dcc0cbb643\" ON \"echowave\".\"playlist_tracks_track\" (\"trackId\") ");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track\" ADD CONSTRAINT \"FK_f2d52e431ade00477512f633f27\" FOREIGN KEY (\"uploaderId\") REFERENCES \"echowave\".\"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist\" ADD CONSTRAINT \"FK_2b2e2d0e397930853ded06a8d6b\" FOREIGN KEY (\"creatorId\") REFERENCES \"echowave\".\"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_likes\" ADD CONSTRAINT \"FK_5a35f9e4a91abbd3c609c66089a\" FOREIGN KEY (\"trackId\") REFERENCES \"echowave\".\"track\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_likes\" ADD CONSTRAINT \"FK_123a03a1836f8348e794dc2eed5\" FOREIGN KEY (\"userId\") REFERENCES \"echowave\".\"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_comments\" ADD CONSTRAINT \"FK_fc3085aaee63f7435b3504dbe86\" FOREIGN KEY (\"trackId\") REFERENCES \"echowave\".\"track\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_comments\" ADD CONSTRAINT \"FK_5eed6b0258b94139e0f05ab3326\" FOREIGN KEY (\"userId\") REFERENCES \"echowave\".\"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist_tracks_track\" ADD CONSTRAINT \"FK_53e780b9e2955ef02466636cda7\" FOREIGN KEY (\"playlistId\") REFERENCES \"echowave\".\"playlist\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE");
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist_tracks_track\" ADD CONSTRAINT \"FK_54dd1e92dd268df3dcc0cbb643c\" FOREIGN KEY (\"trackId\") REFERENCES \"echowave\".\"track\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE");
    await queryRunner.query("ALTER TABLE \"echowave\".\"deactivated_accounts\" ENABLE ROW LEVEL SECURITY");
    await queryRunner.query("ALTER TABLE \"echowave\".\"user\" ENABLE ROW LEVEL SECURITY");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track\" ENABLE ROW LEVEL SECURITY");
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist\" ENABLE ROW LEVEL SECURITY");
    await queryRunner.query("ALTER TABLE \"echowave\".\"otp_codes\" ENABLE ROW LEVEL SECURITY");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_likes\" ENABLE ROW LEVEL SECURITY");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_comments\" ENABLE ROW LEVEL SECURITY");
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist_tracks_track\" ENABLE ROW LEVEL SECURITY");
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist_tracks_track\" DROP CONSTRAINT \"FK_54dd1e92dd268df3dcc0cbb643c\"");
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist_tracks_track\" DROP CONSTRAINT \"FK_53e780b9e2955ef02466636cda7\"");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_comments\" DROP CONSTRAINT \"FK_5eed6b0258b94139e0f05ab3326\"");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_comments\" DROP CONSTRAINT \"FK_fc3085aaee63f7435b3504dbe86\"");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_likes\" DROP CONSTRAINT \"FK_123a03a1836f8348e794dc2eed5\"");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track_likes\" DROP CONSTRAINT \"FK_5a35f9e4a91abbd3c609c66089a\"");
    await queryRunner.query("ALTER TABLE \"echowave\".\"playlist\" DROP CONSTRAINT \"FK_2b2e2d0e397930853ded06a8d6b\"");
    await queryRunner.query("ALTER TABLE \"echowave\".\"track\" DROP CONSTRAINT \"FK_f2d52e431ade00477512f633f27\"");
    await queryRunner.query("DROP INDEX \"echowave\".\"IDX_54dd1e92dd268df3dcc0cbb643\"");
    await queryRunner.query("DROP INDEX \"echowave\".\"IDX_53e780b9e2955ef02466636cda\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"playlist_tracks_track\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"track_comments\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"track_likes\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"otp_codes\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"playlist\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"track\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"user\"");
    await queryRunner.query("DROP TABLE \"echowave\".\"deactivated_accounts\"");
  }
}
