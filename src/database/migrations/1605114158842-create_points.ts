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
          type: 'varchar'
        },
        {
          name: 'exactScore',
          type: 'varchar'
        },
        {
          name: 'user_id',
          type: 'integer'
        },
        {
          name: 'league_id',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'PointsUser',
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'PointsLeague',
          columnNames: ['league_id'],
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
