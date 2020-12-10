import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm'

import ClubeClassification from './ClubeClassification'
import Match from './Match'
import Users from './Users'

@Entity('clube')
export default class Clube {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column()
    shortCode: string

    @Column()
    logo: string

    @Column()
    clubeIdApi: number

    @OneToOne(() => ClubeClassification, classification => classification.clube, {
      cascade: ['insert', 'update']
    })
    class: ClubeClassification

    @OneToMany(() => Match, match => match.clubeHome, {
      cascade: ['insert', 'update']
    })
    matchsHome: Match[]

    @OneToMany(() => Match, match => match.clubeAway, {
      cascade: ['insert', 'update']
    })
    matchsAway: Match[]

    @OneToMany(() => Users, user => user.heartClub, {
      cascade: ['insert', 'update']
    })
    fans: Users
}
