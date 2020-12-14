import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'

import Points from './Points'
import Users from './Users'
import Conquest from './Conquest'
import Championship from './Championship'

@Entity('leagues')
export default class Leagues {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    sistem: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    trophy: string;

    @ManyToOne(() => Championship, championship => championship.leagues)
    @JoinColumn({ name: 'championshipId' })
    championship: Championship

    @ManyToOne(() => Users, user => user.leagues)
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
