import { MigrationInterface, QueryRunner } from "typeorm";

export class AadDefaultUserTable1757317413968 implements MigrationInterface {
    name = 'AadDefaultUserTable1757317413968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`profile\` \`profile\` varchar(255) NULL DEFAULT './images/e05658167c08c47c139abdef11df5e11.jpg'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`profile\` \`profile\` varchar(255) NULL`);
    }

}
