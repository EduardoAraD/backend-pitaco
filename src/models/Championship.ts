import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm'

import ClubeClassification from './ClubeClassification'
import Leagues from './Leagues'
import Rodada from './Rodada'

@Entity('championship')
export default class Championship {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column()
    startDate: string

    @Column()
    endDate: string

    @Column()
    currentRodada: number

    @Column()
    seasonId: number

    @OneToMany(() => Rodada, rodada => rodada.championshipId, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'championshipId' })
    rodadas: Rodada[];

    @OneToMany(() => ClubeClassification, clube => clube.championshipId, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'championshipId' })
    standings: ClubeClassification[]

    @OneToMany(() => Leagues, league => league.championship, {
      cascade: ['insert', 'update']
    })
    leagues: Leagues[]
}
