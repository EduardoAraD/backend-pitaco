import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Friend from '@models/Friend'
import Users from '@models/Users'
import Conquest from '@models/Conquest'

import UsersView from '@views/users_view'
import FriendView from '@views/friend_view'

export default {
  async getFriends (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email }
      const UsersRepository = getRepository(Users)
      const userDB = await UsersRepository.findOne({ email: data.email }, { relations: ['friends'] })
      if (!userDB) { return response.status(400).send({ error: 'User not found' }) }

      const ConquestRepository = getRepository(Conquest)
      const usersDB = await UsersRepository.find({ relations: ['heartClub', 'conquests', 'serFriend'] })
      const conquestsDB = await ConquestRepository.find({ relations: ['league', 'user'] })

      const friendsUser = userDB.friends.map(item => {
        const friend = usersDB.find(user => user.serFriend.find(userSerFriend => userSerFriend.id === item.id))
        friend.conquests = conquestsDB.filter(conquest => conquest.user.id === friend.id)
        return friend
      })

      return response.json(UsersView.renderMany(friendsUser))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in Get Friend, try again' })
    }
  },

  async create (request: Request, response: Response) {
    try {
      const { emailUser, emailFriend } = request.body
      const data = { user: emailUser, friend: emailFriend }

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.user }, { relations: ['heartClub', 'conquests'] })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }
      const friend = await UsersRepository.findOne({ email: data.friend }, { relations: ['heartClub', 'conquests'] })
      if (!friend) { return response.status(400).send({ error: 'Friend nor found' }) }

      const dataFriend = {
        user,
        friend
      }

      const FriendRepository = getRepository(Friend)

      const friendSave = FriendRepository.create(dataFriend)
      const friendResult = await FriendRepository.save(friendSave)

      return response.json(FriendView.render(friendResult))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in create friend, try again' })
    }
  },

  async getNotFriend (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email }

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.email }, { relations: ['friends'] })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      const usersDB = await UsersRepository.find({ relations: ['heartClub'] })
      const listUsers = usersDB.filter(item => {
        const friend = user.friends.find(friend => friend.friend.id === item.id)
        return !friend
      }).filter(item => item.id !== user.id)

      return response.json(UsersView.renderMany(listUsers))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in not friend, try again' })
    }
  }
}
