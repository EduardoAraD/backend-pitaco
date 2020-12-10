import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createUser1605096522040 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
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
          name: 'password',
          type: 'varchar'
        },
        {
          name: 'avatar',
          type: 'varchar'
        },
        {
          name: 'email',
          type: 'varchar'
        },
        {
          name: 'codeResetPassword',
          type: 'varchar'
        },
        {
          name: 'codeResetExpires',
          type: 'varchar'
        },
        {
          name: 'clubeId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'HeartClube',
          columnNames: ['clubeId'],
          referencedTableName: 'clube',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}
