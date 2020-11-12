import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'

import Users from './Users'
import Leagues from './Leagues'

@Entity('association-user-league')
export default class AssociationLeagueUser {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Leagues, league => league.users)
    @JoinColumn({ name: 'leagueId' })
    leagueId: Leagues;

    @ManyToOne(() => Users, user => user.leagues)
    @JoinColumn({ name: 'userId' })
    userId: Users;
}
