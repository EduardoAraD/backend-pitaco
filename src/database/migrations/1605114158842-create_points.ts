import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createPoints1605114158842 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'points',
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
          name: 'exactScore',
          type: 'integer'
        },
        {
          name: 'userId',
          type: 'integer'
        },
        {
          name: 'leagueId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'PointsUser',
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'PointsLeague',
          columnNames: ['leagueId'],
          referencedTableName: 'leagues',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('points')
  }
}
