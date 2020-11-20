import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createClubeClassification1605894318241 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'clubeClassification',
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
          name: 'points',
          type: 'integer'
        },
        {
          name: 'wins',
          type: 'integer'
        },
        {
          name: 'draw',
          type: 'integer'
        },
        {
          name: 'macths',
          type: 'integer'
        },
        {
          name: 'goalsScored',
          type: 'integer'
        },
        {
          name: 'goalsConceded',
          type: 'integer'
        },
        {
          name: 'position',
          type: 'integer'
        },
        {
          name: 'championshipId',
          type: 'integer'
        }
      ],
      foreignKeys: [
        {
          name: 'ChampionshipClube',
          columnNames: ['championshipId'],
          referencedTableName: 'championship',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clubeClassification')
  }
}
