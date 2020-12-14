import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Leagues from '@models/Leagues'
import Points from '@models/Points'
import Users from '@models/Users'

import LeaguesView from '@views/leagues_view'
import PointView from '@views/points_view'

import Clube from '@models/Clube'
import Championship from '@models/Championship'

interface DataRequestCreate {
  email: string;
  name: string;
  description: string;
  trophy: string;
  championship: number
}
interface DataRequestLeagueDono {
  championship: number,
  email: string;
}

export default {
  async index (request: Request, response: Response) {
    try {
      const leaguesRepository = getRepository(Leagues)

      const leagues = (await leaguesRepository.find({
        relations: ['dono', 'championship']
      })).filter(item => item.sistem === 0)
        .map(item => { item.points = []; return item })

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
        relations: ['dono', 'championship']
      })
      if (!league) {
        return response.status(400).send({ error: 'Not found League' })
      }

      const points = await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })

      league.points = points.filter(point => league.id === point.leagueId.id && point.accept === 1)

      return response.json(LeaguesView.render(league))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on View League, try again' })
    }
  },

  async solicitationLeague (request: Request, response: Response) {
    try {
      const { id } = request.params
      const data = { id: parseInt(id) }

      const PointsRepository = getRepository(Points)

      const UsersRepository = getRepository(Users)
      const usersDB = await UsersRepository.find({ relations: ['heartClub'] })

      const pointsDB = (await PointsRepository.find({ relations: ['userId', 'leagueId'] }))
        .filter(item => item.leagueId.id === data.id && item.accept === 0)
        .map(item => {
          item.userId = usersDB.find(itemUser => item.userId.id === itemUser.id)
          return item
        })

      return response.send(PointView.renderMany(pointsDB))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Solicitation League, try again' })
    }
  },

  async leaguePitaco (request: Request, response: Response) {
    try {
      const { id } = request.body
      const data = { id: parseInt(id) }

      const leaguesRepository = getRepository(Leagues)
      const pointsRepository = getRepository(Points)

      const leagueDB = await leaguesRepository.find({ relations: ['championship'] })
      const league = leagueDB.find(item => item.sistem === 1 && item.championship.id === data.id &&
        item.name === 'Pitaco League')

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
      return response.status(400).send({ error: 'Error on Pitaco League, try again' })
    }
  },

  async leagueHeartClub (request: Request, response: Response) {
    try {
      const { id, clubeId } = request.body
      const data = { id: parseInt(id), clube: parseInt(clubeId) }

      const leaguesRepository = getRepository(Leagues)
      const pointsRepository = getRepository(Points)
      const ClubeRepository = getRepository(Clube)
      const UsersRepository = getRepository(Users)

      const leagueDB = (await leaguesRepository.find({ relations: ['championship'] }))
        .filter(item => item.sistem === 1 && item.championship.id === data.id)

      const leaguePitaco = leagueDB.find(item => item.name === 'Pitaco League')

      const clubeDB = await ClubeRepository.findOne({ id: data.clube })
      const leagueClub = leagueDB.find(item => item.name === `Liga ${clubeDB.name}`)

      const usersDB = await UsersRepository.find({ heartClub: clubeDB })

      if (!leagueClub && !leaguePitaco) {
        return response.status(400).send({ error: 'Not found League' })
      }

      const points = await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })

      leagueClub.points = points.filter(point => leaguePitaco.id === point.leagueId.id)
        .map(point => {
          point.userId = usersDB.find(item => item.id === point.userId.id)
          point.userId.heartClub = clubeDB
          return point
        })

      return response.json(LeaguesView.render(leagueClub))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on HeartClub League, try again' })
    }
  },

  async showLeagueDono (request: Request, response: Response) {
    try {
      const { championship, email } = request.body
      const data = { championship: parseInt(championship), email } as DataRequestLeagueDono

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.championship })
      if (!championshipDB) { return response.status(400).send({ error: 'Championship not found ' }) }

      const usersRepository = getRepository(Users)
      const user = await usersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      const leaguesRepository = getRepository(Leagues)
      const league = await leaguesRepository.findOne({ dono: user, championship })
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

  async leagueGuestUser (request: Request, response: Response) {
    try {
      const { championship, email } = request.body
      const data = { championship: parseInt(championship), email }

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.championship })
      if (!championshipDB) { return response.status(400).send({ error: 'Championship not found ' }) }

      const usersRepository = getRepository(Users)
      const user = await usersRepository.findOne({ email: data.email }, { relations: ['heartClub'] })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      const LeagueRepository = getRepository(Leagues)
      const leaguesDB = (await LeagueRepository.find({ relations: ['dono'] }))
        .filter(item => item.sistem === 0 && item.dono.id !== user.id)

      const PointRepository = getRepository(Points)
      const pointsDB = await PointRepository.find({ relations: ['userId', 'leagueId'] })
      const pointsOfUser = pointsDB.filter(item => item.userId.id === user.id)

      const leagueGuest = leaguesDB.filter(league => {
        for (let i = 0; i < pointsOfUser.length; i++) {
          if (league.id === pointsOfUser[i].leagueId.id) { return true }
        }
        return false
      })

      const leagues = leagueGuest.map(item => {
        item.points = pointsDB.filter(point => point.leagueId.id === item.id)
        return item
      })

      return response.json(LeaguesView.renderMany(leagues))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on LeagueGuest of User, try again' })
    }
  },

  async create (request: Request, response: Response) {
    try {
      const { email, description, trophy, name, championship } = request.body
      const data = { email, name, description, trophy, championship: parseInt(championship) } as DataRequestCreate

      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.championship })
      if (!championshipDB) { return response.status(400).send({ error: 'Championship not found' }) }

      const leaguesRepository = getRepository(Leagues)
      const leagueExisting = await leaguesRepository.findOne({ dono: user, championship: championshipDB })
      if (leagueExisting) { return response.status(400).send({ error: 'You already have league' }) }

      const dataPoint = {
        points: 0,
        exactScore: 0,
        accept: 1,
        userId: user
      }

      const points = []
      points.push(dataPoint)

      const dataLeague = {
        name: data.name,
        dono: user,
        description,
        trophy,
        points,
        sistem: 0,
        championship: championshipDB
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

      const user = await usersRepository.findOne({ email: data.email }, { relations: ['leagues'] })
      if (!user) { return response.status(400).send({ error: 'User not found' }) }

      const league = user.leagues.find(item => item.id === data.id)
      if (!league) { return response.status(400).send({ error: 'You have not league' }) }

      await leaguesRepository.delete({ id: data.id })

      return response.send()
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in delete League, nor try again' })
    }
  }
}
