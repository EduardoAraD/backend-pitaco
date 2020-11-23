import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm'

import Championship from './Championship'
import Clube from './Clube'

@Entity('clubeClassification')
export default class ClubeClassification {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    position: number

    @Column()
    points: number

    @Column()
    wins: number

    @Column()
    draw: number

    @Column()
    matchs: number

    @Column()
    goalsScored: number

    @Column()
    goalsConceded: number

    @Column()
    positionVariation: number

    @Column()
    utilization: number

    @ManyToOne(() => Championship, championship => championship.standings)
    @JoinColumn({ name: 'championshipId' })
    championshipId: Championship

    @OneToOne(() => Clube, clube => clube.class, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'clubeId' })
    clube: Clube
}
