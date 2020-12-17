import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm'

import Pitaco from './Pitaco'
import Leagues from './Leagues'
import Points from './Points'
import Conquest from './Conquest'
import Clube from './Clube'
import Friend from './Friend'

@Entity('users')
export default class Users {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    avatar: string;

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

    @OneToMany(() => Leagues, league => league.dono, {
      cascade: ['insert', 'update']
    })
    leagues: Leagues[];

    @OneToMany(() => Pitaco, pitaco => pitaco.userId, {
      cascade: ['insert', 'update']
    })
    pitacos: Pitaco[]

    @OneToMany(() => Conquest, conquest => conquest.user, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'userId' })
    conquests: Conquest[]

    @ManyToOne(() => Clube, clube => clube.fans)
    @JoinColumn({ name: 'clubeId' })
    heartClub: Clube

    @OneToMany(() => Friend, friend => friend.user, {
      cascade: ['insert', 'update']
    })
    friends: Friend[]

    @OneToMany(() => Friend, friend => friend.friend, {
      cascade: ['insert', 'update']
    })
    serFriend: Friend[]
}
