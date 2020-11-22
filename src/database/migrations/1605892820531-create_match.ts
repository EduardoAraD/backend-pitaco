import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createMatch1605892820531 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'match',
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
          name: 'matchIdApi',
          type: 'integer'
        },
        {
          name: 'status',
          type: 'varchar'
        },
        {
          name: 'statium',
          type: 'varchar'
        },
        {
          name: 'hour',
          type: 'varchar'
        },
        {
          name: 'date',
          type: 'varchar'
        },
        {
          name: 'clubeHome',
          type: 'varchar'
        },
        {
          name: 'clubeAway',
          type: 'varchar'
        },
        {
          name: 'linkClubeHome',
          type: 'varchar'
        },
        {
          name: 'linkClubeAway',
          type: 'varchar'
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
          name: 'rodadaId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'RodadaMatch',
          columnNames: ['rodadaId'],
          referencedTableName: 'rodada',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('match')
  }
}
