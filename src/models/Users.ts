import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne } from 'typeorm'

import AssociationLeagueUser from './AssociatioLeagueUser'
import Leagues from './Leagues'
import Points from './Points'

@Entity('users')
export default class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    codeResetPassword: string;

    @Column()
    codeResetExpires: string;

    @OneToMany(() => Points, point => point.userId, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'userId' })
    points: Points[];

    @OneToOne(() => Leagues, league => league.dono)
    dono: Leagues;

    @OneToMany(() => AssociationLeagueUser, association => association.userId, {
      cascade: ['insert', 'update']
    })
    leagues: AssociationLeagueUser[]
}
