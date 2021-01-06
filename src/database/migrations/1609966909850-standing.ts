import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class standing1609966909850 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'standing',
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
          name: 'points',
          type: 'integer'
        },
        {
          name: 'wins',
          type: 'integer'
        },
        {
          name: 'draw',
          type: 'integer'
        },
        {
          name: 'matchs',
          type: 'integer'
        },
        {
          name: 'goalsScored',
          type: 'integer'
        },
        {
          name: 'goalsConceded',
          type: 'integer'
        },
        {
          name: 'utilization',
          type: 'integer'
        },
        {
          name: 'championshipId',
          type: 'integer'
        },
        {
          name: 'status',
          type: 'varchar'
        },
        {
          name: 'clubeId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'ChampionshipClubeClass',
          columnNames: ['championshipId'],
          referencedTableName: 'championship',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'ClubeClass',
          columnNames: ['clubeId'],
          referencedTableName: 'clube',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('standing')
  }
}
