import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm'

import ClubeClassification from './ClubeClassification'
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
}
