import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class conquest1609967364220 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'conquest',
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
          name: 'position',
          type: 'integer'
        },
        {
          name: 'leagueId',
          type: 'integer'
        },
        {
          name: 'userId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'ConquestUser',
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'ConquestLeague',
          columnNames: ['leagueId'],
          referencedTableName: 'league',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('conquest')
  }
}
