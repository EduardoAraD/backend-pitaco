import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createPitaco1605119390719 implements MigrationInterface {
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
          name: 'userId',
          type: 'integer'
        },
        {
          name: 'matchId',
          type: 'integer'
        },
        {
          name: 'matchIdSistem',
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
          columnNames: ['matchIdSistem'],
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
