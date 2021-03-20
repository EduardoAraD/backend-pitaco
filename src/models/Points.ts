import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm'

import Users from './Users'
import Leagues from './Leagues'

@Entity('points')
export default class Points {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    points: number;

    @Column()
    exactScore: number;

    @Column()
    accept: number;

    @ManyToOne(() => Users, user => user.points)
    @JoinColumn({ name: 'userId' })
    userId: Users;

    @ManyToOne(() => Leagues, league => league.points)
    @JoinColumn({ name: 'leagueId' })
    leagueId: Leagues;
}
