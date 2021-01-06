import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm'

import Championship from './Championship'
import Clube from './Clube'

@Entity('standing')
export default class Standing {
    @PrimaryGeneratedColumn('increment')
    id: number

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
    utilization: number

    @Column()
    status: string

    @ManyToOne(() => Championship, championship => championship.standings)
    @JoinColumn({ name: 'championshipId' })
    championshipId: Championship

    @OneToOne(() => Clube, clube => clube.class, {
      cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'clubeId' })
    clube: Clube
}
