import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import Pitaco from './Pitaco'

import Rodada from './Rodada'

@Entity('match')
export default class Match {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    matchIdApi: number

    @Column()
    status: string

    @Column()
    stadium: string

    @Column()
    hour: string

    @Column()
    date: string

    @Column()
    clubeHome: string

    @Column()
    clubeAway: string

    @Column()
    linkClubeHome: string

    @Column()
    linkClubeAway: string

    @Column()
    golsHome: number

    @Column()
    golsAway: number

    @ManyToOne(() => Rodada, rodada => rodada.matchs)
    @JoinColumn({ name: 'rodadaId' })
    rodadaId: Rodada

    @OneToMany(() => Pitaco, pitaco => pitaco.matchId, {
      cascade: ['insert', 'update']
    })
    pitacos: Pitaco[]
}
