import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm'

import Match from './Match'
import Users from './Users'

@Entity('pitaco')
export default class Pitaco {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    golsHome: number;

    @Column()
    golsAway: number;

    @Column()
    point: number;

    @Column()
    exactScore: number;

    @ManyToOne(() => Users, user => user.pitacos)
    @JoinColumn({ name: 'userId' })
    userId: Users;

    @ManyToOne(() => Match, match => match.pitacos)
    @JoinColumn({ name: 'matchId' })
    matchId: Match
}
