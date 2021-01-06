import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class clube1609965963997 implements MigrationInterface {
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
          name: 'nameComplete',
          type: 'varchar'
        },
        {
          name: 'shortCode',
          type: 'varchar'
        },
        {
          name: 'logo',
          type: 'varchar'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clube')
  }
}
