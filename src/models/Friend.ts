import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Users from './Users'

@Entity('friend')
export default class Friend {
    @PrimaryGeneratedColumn('increment')
    id: number

    @ManyToOne(() => Users, user => user.friends)
    @JoinColumn({ name: 'userId' })
    user: Users

    @ManyToOne(() => Users, user => user.serFriend)
    @JoinColumn({ name: 'friend' })
    friend: Users
}
