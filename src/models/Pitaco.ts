import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('pitaco')
export default class Pitaco {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    golsHome: number;

    @Column()
    golsAway: number;

    @Column()
    matchId: number;
}
