import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'

import Clube from './Clube'
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
    golsHome: number

    @Column()
    golsAway: number

    @Column()
    finishPitaco: number

    @ManyToOne(() => Rodada, rodada => rodada.matchs)
    @JoinColumn({ name: 'rodadaId' })
    rodadaId: Rodada

    @ManyToOne(() => Clube, clube => clube.matchsHome)
    @JoinColumn({ name: 'clubeHomeId' })
    clubeHome: Clube

    @ManyToOne(() => Clube, clube => clube.matchsAway)
    @JoinColumn({ name: 'clubeAwayId' })
    clubeAway: Clube

    @OneToMany(() => Pitaco, pitaco => pitaco.matchId, {
      cascade: ['insert', 'update']
    })
    pitacos: Pitaco[]
}
