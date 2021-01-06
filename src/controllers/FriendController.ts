import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Friend from '../models/Friend'
import Users from '../models/Users'
import Conquest from '../models/Conquest'

import UsersView from '../views/users_view'
import FriendView from '../views/friend_view'

import { MessageError, firstName } from '../functions'

export default {
  async getFriends (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email: email || '' }

      if (data.email === '') return response.status(400).send({ error: MessageError.EMAILNOTINFORMED })

      const UsersRepository = getRepository(Users)
      const userDB = await UsersRepository.findOne({ email: data.email }, { relations: ['friends'] })
      if (!userDB) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const ConquestRepository = getRepository(Conquest)
      const usersDB = await UsersRepository.find({ relations: ['heartClub', 'conquests', 'serFriend'] })
      const conquestsDB = await ConquestRepository.find({ relations: ['league', 'user'] })

      const friendsUser = userDB.friends.map(item => {
        const friend = usersDB.find(user => user.serFriend.find(userSerFriend => userSerFriend.id === item.id))
        friend.conquests = conquestsDB.filter(conquest => conquest.user.id === friend.id)
        return friend
      }).sort((a, b) => firstName(a.name, b.name))

      return response.json(UsersView.renderMany(friendsUser))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in get Friend, try again.' })
    }
  },

  async create (request: Request, response: Response) {
    try {
      const { emailUser, emailFriend } = request.body
      const data = { user: emailUser || '', friend: emailFriend || '' }

      if (data.user === '') {
        return response.status(400).send({ error: MessageError.EMAILNOTINFORMED })
      }
      if (data.friend === '') {
        return response.status(400).send({ error: MessageError.EMAILFRIENDNOTINFORMED })
      }
      if (data.user === data.friend) {
        return response.status(400).send({ error: MessageError.USERFRIENDEQUAL })
      }

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.user }, { relations: ['heartClub', 'conquests'] })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const friend = await UsersRepository.findOne({ email: data.friend }, { relations: ['heartClub', 'conquests'] })
      if (!friend) { return response.status(400).send({ error: MessageError.FRIENDNOTFOUND }) }

      const FriendRepository = getRepository(Friend)
      const friendExisting = await FriendRepository.findOne({ user, friend })
      if (friendExisting) {
        return response.status(400).send({ error: MessageError.FRIENDEXISTING })
      }

      const dataFriend = {
        user,
        friend
      }

      const friendSave = FriendRepository.create(dataFriend)
      const friendResult = await FriendRepository.save(friendSave)

      return response.json(FriendView.render(friendResult))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in create friend, try again.' })
    }
  },

  async getNotFriend (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email: email || '' }

      if (data.email === '') {
        return response.status(400).send({ error: MessageError.EMAILNOTINFORMED })
      }

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.email }, { relations: ['friends'] })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const FriendRepository = getRepository(Friend)
      const friendsDB = (await FriendRepository.find({ relations: ['user', 'friend'] }))
        .filter(item => item.user.id === user.id)

      const usersDB = await UsersRepository.find({ relations: ['heartClub'] })
      const listUsers = usersDB.filter(item => {
        const friend = friendsDB.find(friend => friend.friend.id === item.id)
        return !friend
      }).filter(item => item.id !== user.id)
        .sort((a, b) => firstName(a.name, b.name))

      return response.json(UsersView.renderMany(listUsers))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in not friend, try again.' })
    }
  },

  async getNotFriendPaginate (request: Request, response: Response) {
    try {
      const { email, page, limit, filter } = request.body
      const data = {
        email: email || '',
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 0,
        filter: filter || ''
      }

      if (data.email === '') return response.status(400).send({ error: MessageError.EMAILNOTINFORMED })

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.email }, { relations: ['friends'] })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const FriendRepository = getRepository(Friend)
      const friendsDB = (await FriendRepository.find({ relations: ['user', 'friend'] }))
        .filter(item => item.user.id === user.id)

      const usersDB = await UsersRepository.find({ relations: ['heartClub'] })
      const listUsers: Users[] = usersDB.filter(item => {
        const friend = friendsDB.find(friend => friend.friend.id === item.id)
        return !friend
      }).filter(item => item.id !== user.id &&
        item.name.includes(data.filter)
      ).sort((a, b) => firstName(a.name, b.name))

      const totalUsers = listUsers.length
      const usersResp = listUsers.splice(data.limit * (data.page - 1), data.limit)

      return response.json({
        limit: data.limit,
        page: data.page,
        filter: data.filter,
        users: UsersView.renderMany(usersResp),
        total: totalUsers
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in not friend, try again.' })
    }
  }
}
