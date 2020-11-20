import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'

import Rodada from './Rodada'

@Entity('match')
export default class Match {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    matchId: number

    @Column()
    numRodada: number

    @Column()
    status: string

    @Column()
    stadium: string

    @Column()
    timeHour: string

    @Column()
    day: string

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
}
