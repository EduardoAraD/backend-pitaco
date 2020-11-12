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
          name: 'user_id',
          type: 'integer'
        },
        {
          name: 'match_id',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'PitacoUser',
          columnNames: ['user_id'],
          referencedTableName: 'users',
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
