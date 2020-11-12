import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class associationUserLeague1605117872102 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'association-user-league',
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
          name: 'AssociationUser',
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'AssociationLeague',
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
    await queryRunner.dropTable('association-user-league')
  }
}
