import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class championship1609966627607 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'championship',
      columns: [
        {
          name: 'id',
          type: 'integer',
          unsigned: true,
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'name',
          type: 'varchar'
        },
        {
          name: 'startDate',
          type: 'varchar'
        },
        {
          name: 'endDate',
          type: 'varchar'
        },
        {
          name: 'currentRodada',
          type: 'integer'
        },
        {
          name: 'seasonId',
          type: 'integer'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('championship')
  }
}
