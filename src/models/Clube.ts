import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm'

import Standing from './Standing'
import Match from './Match'
import Users from './Users'
import IdApiClube from './IdApiClube'

@Entity('clube')
export default class Clube {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column()
    nameComplete: string

    @Column()
    shortCode: string

    @Column()
    logo: string

    @OneToMany(() => IdApiClube, idApiClube => idApiClube.clube, {
      cascade: ['insert', 'update']
    })
    idsApiClube: IdApiClube[]

    @OneToOne(() => Standing, standing => standing.clube, {
      cascade: ['insert', 'update']
    })
    class: Standing

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
