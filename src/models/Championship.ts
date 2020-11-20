import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne } from 'typeorm'

import ClubeClassification from './ClubeClassification'
import Rodada from './Rodada'

@Entity('championship')
export default class Championship {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @OneToMany(() => Rodada, rodada => rodada.championshipId, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'championshipId' })
    rodadas: Rodada[];

    @OneToOne(() => ClubeClassification, clube => clube.championshipId, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'championshipId' })
    clubes: ClubeClassification
}
