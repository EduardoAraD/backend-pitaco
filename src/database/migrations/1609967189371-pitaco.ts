import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class pitaco1609967189371 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'pitaco',
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
          name: 'golsHome',
          type: 'integer'
        },
        {
          name: 'golsAway',
          type: 'integer'
        },
        {
          name: 'point',
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
          name: 'matchId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'PitacoUser',
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'PitacoMatch',
          columnNames: ['matchId'],
          referencedTableName: 'match',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pitaco')
  }
}
