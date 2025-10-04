import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressEntity1756203772642 implements MigrationInterface {
  name = 'AddAddressEntity1756203772642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`address\` (\`id\` int NOT NULL AUTO_INCREMENT, \`address_line_1\` varchar(255) NOT NULL, \`address_line_2\` varchar(255) NULL, \`city\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`postal_code\` int NOT NULL, \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`address\` ADD CONSTRAINT \`FK_d25f1ea79e282cc8a42bd616aa3\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`address\` DROP FOREIGN KEY \`FK_d25f1ea79e282cc8a42bd616aa3\``,
    );
    await queryRunner.query(`DROP TABLE \`address\``);
  }
}
