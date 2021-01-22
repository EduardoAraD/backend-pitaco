import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

import Leagues from './Leagues'
import Users from './Users'

@Entity('conquest')
export default class Conquest {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    position: number

    @Column()
    description: string

    @ManyToOne(() => Users, user => user.conquests)
    @JoinColumn({ name: 'userId' })
    user: Users

    @ManyToOne(() => Leagues, league => league.conquests)
    @JoinColumn({ name: 'leagueId' })
    league: Leagues
}
