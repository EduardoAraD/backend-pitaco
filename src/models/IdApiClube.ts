import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm'
import Clube from './Clube'

@Entity('idApiClube')
export default class IdApiClube {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    idApi: number

    @ManyToOne(() => Clube, clube => clube.idsApiClube)
    @JoinColumn({ name: 'clubeId' })
    clube: Clube
}
