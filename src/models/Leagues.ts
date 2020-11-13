import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm'

import Points from './Points'
import Users from './Users'

@Entity('leagues')
export default class Leagues {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

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
}
