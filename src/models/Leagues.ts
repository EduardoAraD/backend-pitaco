import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm'

import Points from './Points'
import Users from './Users'
import Conquest from './Conquest'

@Entity('leagues')
export default class Leagues {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    taca: number;

    @OneToOne(() => Users, user => user.dono, {
      cascade: ['insert', 'update', 'remove']
    })
    @JoinColumn({ name: 'donoId' })
    dono: Users;

    @OneToMany(() => Points, point => point.leagueId, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'leagueId' })
    points: Points[];

    @OneToMany(() => Conquest, conquest => conquest.league, {
      cascade: ['insert', 'update']
    })
    conquests: Conquest[]
}
