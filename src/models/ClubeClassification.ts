import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

import Championship from './Championship'

@Entity('clubeClassification')
export default class ClubeClassification {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    position: number

    @Column()
    name: string

    @Column()
    linkShield: string

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

    @Column()
    lastMatchs: string

    @ManyToOne(() => Championship, championship => championship.clubes)
    @JoinColumn({ name: 'championshipId' })
    championshipId: Championship
}
