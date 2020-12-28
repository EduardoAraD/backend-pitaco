import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class idsClube1609158381746 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'idApiClube',
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
          name: 'idApi',
          type: 'integer'
        },
        {
          name: 'clubeId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'idClubeClube',
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
    await queryRunner.dropTable('idApiClube')
  }
}
