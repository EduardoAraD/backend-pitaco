import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm'

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
    matchId: number;

    @ManyToOne(() => Users, user => user.pitacos)
    @JoinColumn({ name: 'userId' })
    userId: Users
}
