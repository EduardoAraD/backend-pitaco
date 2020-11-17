import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Leagues from '@models/Leagues'
import Points from '@models/Points'
import Users from '@models/Users'

import LeaguesView from '@views/leagues_view'

interface DataRequestCreate {
  email: string;
  name: string;
}
interface DataRequestLeagueDono {
  email: string;
}

export default {
  async index (request: Request, response: Response) {
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
  },

  async show (request: Request, response: Response) {
    const { id } = request.params
    const data = { id: parseInt(id) }

    const leaguesRepository = getRepository(Leagues)
    const pointsRepository = getRepository(Points)

    const league = await leaguesRepository.findOne(data.id, {
      relations: ['dono']
    })

    const points = await pointsRepository.find({
      relations: ['userId', 'leagueId']
    })

    league.points = points.filter(point => league.id === point.leagueId.id)

    return response.json(LeaguesView.render(league))
  },

  async showLeagueDono (request: Request, response: Response) {
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
  },

  async create (request: Request, response: Response) {
    const { email, name } = request.body
    const data = { email, name } as DataRequestCreate

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
      points
    }

    const league = leaguesRepository.create(dataLeague)
    await leaguesRepository.save(league)

    return response.json(LeaguesView.render(league))
  },

  async delete (request: Request, response: Response) { // Pesando em colocar o email do dono tbm
    const { id } = request.params
    const data = { id: parseInt(id) }

    const leaguesRepository = getRepository(Leagues)
    await leaguesRepository.delete({ id: data.id })

    return response.send()
  }
}
