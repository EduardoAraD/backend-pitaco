import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createRodada1605897386707 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'rodada',
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
          type: 'integer'
        },
        {
          name: 'number',
          type: 'integer'
        },
        {
          name: 'prevRodada',
          type: 'integer'
        },
        {
          name: 'proxRodada',
          type: 'integer'
        },
        {
          name: 'championshipId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'ChampionshipRodada',
          columnNames: ['championshipId'],
          referencedTableName: 'championship',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rodada')
  }
}
