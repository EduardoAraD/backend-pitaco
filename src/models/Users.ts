import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne } from 'typeorm'

import Pitaco from './Pitaco'
import Leagues from './Leagues'
import Points from './Points'
import Conquest from './Conquest'

@Entity('users')
export default class Users {
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

    @OneToMany(() => Pitaco, pitaco => pitaco.userId, {
      cascade: ['insert', 'update']
    })
    pitacos: Pitaco[]

    @OneToMany(() => Conquest, conquest => conquest.user, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'userId' })
    conquests: Conquest[]
}
