import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createClube1606069343066 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'clube',
      columns: [
        {
          name: 'id',
          type: 'integer',
          unsigned: true,
          isPrimary: true,
          isGenerated: true
        },
        {
          name: 'name',
          type: 'varchar'
        },
        {
          name: 'shortCode',
          type: 'varchar'
        },
        {
          name: 'logo',
          type: 'varchar'
        },
        {
          name: 'clubeIdApi',
          type: 'integer'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clube')
  }
}
