import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import Championship from './Championship'
import Match from './Match'

@Entity('rodada')
export default class Rodada {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @ManyToOne(() => Championship, championship => championship.rodadas)
    @JoinColumn({ name: 'championshipId' })
    championshipId: Championship

    @OneToMany(() => Match, match => match.rodadaId, {
      cascade: ['insert', 'update']
    })
    @JoinColumn()
    matchs: Match[]
}
