import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createLeague1605116102907 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'leagues',
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
          name: 'description',
          type: 'varchar'
        },
        {
          name: 'trophy',
          type: 'varchar'
        },
        {
          name: 'donoId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'LeagueDono',
          columnNames: ['donoId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('leagues')
  }
}
