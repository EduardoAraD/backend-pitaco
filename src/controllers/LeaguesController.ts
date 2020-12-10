import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Leagues from '@models/Leagues'
import Points from '@models/Points'
import Users from '@models/Users'

import LeaguesView from '@views/leagues_view'

interface DataRequestCreate {
  email: string;
  name: string;
  description: string;
  trophy: string;
}
interface DataRequestLeagueDono {
  email: string;
}

export default {
  async index (request: Request, response: Response) {
    try {
      const leaguesRepository = getRepository(Leagues)
      const pointsRepository = getRepository(Points)

      const leagues = await leaguesRepository.find({
        relations: ['dono']
      })

      const points = await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })

      leagues.map(league => {
        league.points = points.filter(point => league.id === point.leagueId.id)
        return league
      })

      return response.json(LeaguesView.renderMany(leagues))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on View Leagues, try again' })
    }
  },

  async show (request: Request, response: Response) {
    try {
      const { id } = request.params
      const data = { id: parseInt(id) }

      const leaguesRepository = getRepository(Leagues)
      const pointsRepository = getRepository(Points)

      const league = await leaguesRepository.findOne(data.id, {
        relations: ['dono']
      })
      if (!league) {
        return response.status(400).send({ error: 'Not found League' })
      }

      const points = await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })

      league.points = points.filter(point => league.id === point.leagueId.id)

      return response.json(LeaguesView.render(league))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on View League, try again' })
    }
  },

  async showLeagueDono (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email } as DataRequestLeagueDono

      const usersRepository = getRepository(Users)
      const user = await usersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      const leaguesRepository = getRepository(Leagues)
      const league = await leaguesRepository.findOne({ dono: user })
      if (!league) { return response.status(400).send({ error: 'League not found' }) }

      league.dono = user

      const pointsRepository = getRepository(Points)
      const points = await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })

      league.points = points.filter(point => league.id === point.leagueId.id)

      return response.json(LeaguesView.render(league))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on League of Dono, try again ' })
    }
  },

  async create (request: Request, response: Response) {
    try {
      const { email, description, trophy, name } = request.body
      const data = { email, name, description, trophy } as DataRequestCreate

      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      const leaguesRepository = getRepository(Leagues)
      const leagueExisting = await leaguesRepository.findOne({ dono: user })
      if (leagueExisting) { return response.status(400).send({ error: 'You already have league' }) }

      const dataPoint = {
        points: 0,
        exactScore: 0,
        userId: user
      }

      const points = []
      points.push(dataPoint)

      const dataLeague = {
        name: data.name,
        dono: user,
        description,
        trophy,
        points
      }

      const league = leaguesRepository.create(dataLeague)
      await leaguesRepository.save(league)

      return response.json(LeaguesView.render(league))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on create league, try again' })
    }
  },

  async delete (request: Request, response: Response) { // Pesando em colocar o email do dono tbm
    try {
      const { id } = request.params
      const { email } = request.body
      const data = { id: parseInt(id), email }

      const leaguesRepository = getRepository(Leagues)
      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email: data.email }, { relations: ['dono'] })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      if (!user.dono) { return response.status(400).send({ error: 'You have not league' }) }
      if (user.dono.id !== data.id) { return response.status(400).send({ error: 'League not found' }) }
      await leaguesRepository.delete({ id: data.id })

      return response.send()
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in delete League, nor try again' })
    }
  }
}
