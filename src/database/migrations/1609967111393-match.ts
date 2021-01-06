import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class match1609967111393 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'match',
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
          name: 'matchIdApi',
          type: 'integer'
        },
        {
          name: 'status',
          type: 'varchar'
        },
        {
          name: 'stadium',
          type: 'varchar'
        },
        {
          name: 'hour',
          type: 'varchar'
        },
        {
          name: 'date',
          type: 'varchar'
        },
        {
          name: 'golsHome',
          type: 'integer'
        },
        {
          name: 'golsAway',
          type: 'integer'
        },
        {
          name: 'rodadaId',
          type: 'integer'
        },
        {
          name: 'clubeHomeId',
          type: 'integer'
        },
        {
          name: 'clubeAwayId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'RodadaMatch',
          columnNames: ['rodadaId'],
          referencedTableName: 'rodada',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'ClubeHome',
          columnNames: ['clubeHomeId'],
          referencedTableName: 'clube',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'ClubeAway',
          columnNames: ['clubeAwayId'],
          referencedTableName: 'clube',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('match')
  }
}
