import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import { descriptionValidade, emailValidade, nameValidade } from '../middlewares/validad'

import Leagues from '../models/Leagues'
import Points from '../models/Points'
import Users from '../models/Users'
import Clube from '../models/Clube'
import Championship from '../models/Championship'
import Rodada from '../models/Rodada'
import Match from '../models/Match'
import Pitaco from '../models/Pitaco'

import LeaguesView from '../views/leagues_view'
import PointView from '../views/points_view'

import { firstName, firstPoint, MessageError } from '../functions'

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
      const { championship } = request.body
      const data = { id: parseInt(championship, 10) || 0 }

      const leaguesRepository = getRepository(Leagues)

      const leagues = (await leaguesRepository.find({
        relations: ['dono', 'championship']
      })).filter(item => item.sistem === 0 && item.championship.id === data.id)
        .map(item => { item.points = []; return item })

      return response.json(LeaguesView.renderMany(leagues))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on View Leagues, try again.' })
    }
  },

  async indexPage (request: Request, response: Response) {
    try {
      const { championship, page, limit, filter } = request.body
      const data = {
        id: parseInt(championship, 10) || 0,
        page: parseInt(page, 10) || 0,
        limit: parseInt(limit, 10) || 0,
        filter: filter || ''
      }

      const leaguesRepository = getRepository(Leagues)

      const leagues = (await leaguesRepository.find({
        relations: ['dono', 'championship']
      })).filter(item => item.sistem === 0 && item.championship.id === data.id &&
        item.name.includes(data.filter))
        .map(item => { item.points = []; return item })

      const totalLeague = leagues.length
      const leaguesResp = leagues.splice(data.limit * (data.page - 1), data.limit)

      return response.json({
        limit: data.limit,
        page: data.page,
        filter: data.filter,
        leagues: LeaguesView.renderMany(leaguesResp),
        total: totalLeague
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on View Leagues, try again.' })
    }
  },

  async show (request: Request, response: Response) {
    try {
      const { id } = request.params
      const data = { id: parseInt(id) || 0 }

      const leaguesRepository = getRepository(Leagues)
      const pointsRepository = getRepository(Points)

      const league = await leaguesRepository.findOne(data.id, {
        relations: ['dono', 'championship']
      })
      if (!league) {
        return response.status(400).send({ error: MessageError.LEAGUENOTFOUND })
      }

      const points = await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })

      league.points = points.filter(point => league.id === point.leagueId.id && point.accept === 1)
        .sort((a, b) => firstPoint(a, b))

      return response.json(LeaguesView.render(league))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on View League, try again.' })
    }
  },

  async showPointsUser (request: Request, response: Response) {
    try {
      const { id, page, limit } = request.body
      const data = {
        id: parseInt(id, 10) || 0,
        page: parseInt(page, 10) || 0,
        limit: parseInt(limit, 10) || 0
      }

      const PointsRepository = getRepository(Points)
      const pointsDB = (await PointsRepository.find({
        relations: ['userId', 'leagueId']
      })).filter(point => data.id === point.leagueId.id && point.accept === 1)
        .sort((a, b) => firstPoint(a, b))

      const totalPoints = pointsDB.length
      const points = pointsDB.splice(data.limit * (data.page - 1), data.limit)

      return response.json({
        limit: data.limit,
        page: data.page,
        points: PointView.renderMany(points),
        total: totalPoints
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Show Point in League, try again.' })
    }
  },

  async showPointsUserHeartClub (request: Request, response: Response) {
    try {
      const { id, clubeId, page, limit } = request.body
      const data = {
        id: parseInt(id, 10) || 0,
        clube: parseInt(clubeId, 10) || 0,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 0
      }

      const ClubeRepository = getRepository(Clube)
      const clubeDB = await ClubeRepository.findOne({ id: data.clube })
      if (!clubeDB) { return response.status(400).send({ error: MessageError.CLUBNOTFOUND }) }

      const UserRepository = getRepository(Users)
      const usersDB = await UserRepository.find({ heartClub: clubeDB })

      const PointsRepository = getRepository(Points)
      const pointsDB = (await PointsRepository.find({
        relations: ['userId', 'leagueId']
      })).filter(point => data.id === point.leagueId.id && point.accept === 1)
        .filter(point => {
          const pointTemp = usersDB.find(item => item.id === point.userId.id)
          return !!pointTemp
        }).sort((a, b) => firstPoint(a, b))

      const totalPoints = pointsDB.length
      const points = pointsDB.splice(data.limit * (data.page - 1), data.limit)

      return response.json({
        limit: data.limit,
        page: data.page,
        points: PointView.renderMany(points),
        total: totalPoints
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Show Point in League HeartClub, try again.' })
    }
  },

  async showPointsUserLastRodada (request: Request, response: Response) {
    try {
      const { id, page, limit, championship } = request.body
      const data = {
        id: parseInt(id, 10) || 0,
        page: parseInt(page, 10) || 0,
        limit: parseInt(limit, 10) || 0,
        championship: parseInt(championship, 10) || 0
      }

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne(data.championship)
      if (!championshipDB) { return response.status(400).send({ error: MessageError.CHAMPIONSHIPNOTFOUND }) }

      const RodadaRepository = getRepository(Rodada)
      const rodadaDB = await RodadaRepository.findOne({ number: championshipDB.currentRodada, championshipId: championshipDB })
      if (!rodadaDB) { return response.status(400).send({ error: MessageError.RODADANOTFOUND }) }

      const MatchRepository = getRepository(Match)
      const matchs = await MatchRepository.find({ rodadaId: rodadaDB })

      const PointsRepository = getRepository(Points)
      const usersLeague = (await PointsRepository.find({
        relations: ['userId', 'leagueId']
      })).filter(point => data.id === point.leagueId.id && point.accept === 1)
        .map(item => item.userId)

      const PitacoRepository = getRepository(Pitaco)

      const pointsDB: Points[] = []
      for (let i = 0; i < usersLeague.length; i++) {
        const itemUser = usersLeague[i]
        let points = 0
        let exactScore = 0
        for (let j = 0; j < matchs.length; j++) {
          const itemMatch = matchs[j]
          const pitacoDB = await PitacoRepository.findOne({ userId: itemUser, matchId: itemMatch })
          if (pitacoDB) {
            points += pitacoDB.point
            exactScore += pitacoDB.exactScore
          }
        }

        const pointUser = {
          accept: 1,
          exactScore: exactScore,
          points: points,
          userId: itemUser
        } as Points

        pointsDB.push(pointUser)
      }

      const totalPoints = pointsDB.length
      const points = pointsDB.sort((a, b) => firstPoint(a, b)).splice(data.limit * (data.page - 1), data.limit)

      return response.json({
        limit: data.limit,
        page: data.page,
        points: PointView.renderMany(points),
        total: totalPoints,
        rodada: rodadaDB.number
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Show Point in a last rodada in League, try again.' })
    }
  },

  async showPointsUserHeartClubLastRodada (request: Request, response: Response) {
    try {
      const { id, clubeId, page, limit, championship } = request.body
      const data = {
        id: parseInt(id, 10) || 0,
        clube: parseInt(clubeId, 10) || 0,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 0,
        championship: parseInt(championship, 10) || 0
      }

      const ClubeRepository = getRepository(Clube)
      const clubeDB = await ClubeRepository.findOne({ id: data.clube })
      if (!clubeDB) { return response.status(400).send({ error: MessageError.CLUBNOTFOUND }) }

      const UserRepository = getRepository(Users)
      const usersDB = await UserRepository.find({ heartClub: clubeDB })

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne(data.championship)
      if (!championshipDB) { return response.status(400).send({ error: MessageError.CHAMPIONSHIPNOTFOUND }) }

      const RodadaRepository = getRepository(Rodada)
      const rodadaDB = await RodadaRepository.findOne({ number: championshipDB.currentRodada, championshipId: championshipDB })
      if (!rodadaDB) { return response.status(400).send({ error: MessageError.RODADANOTFOUND }) }

      const MatchRepository = getRepository(Match)
      const matchs = await MatchRepository.find({ rodadaId: rodadaDB })

      const PitacoRepository = getRepository(Pitaco)

      const pointsDB: Points[] = []
      for (let i = 0; i < usersDB.length; i++) {
        const itemUser = usersDB[i]
        let points = 0
        let exactScore = 0
        for (let j = 0; j < matchs.length; j++) {
          const itemMatch = matchs[j]
          const pitacoDB = await PitacoRepository.findOne({ userId: itemUser, matchId: itemMatch })
          if (pitacoDB) {
            points += pitacoDB.point
            exactScore += pitacoDB.exactScore
          }
        }

        const pointUser = {
          accept: 1,
          exactScore: exactScore,
          points: points,
          userId: itemUser
        } as Points

        pointsDB.push(pointUser)
      }

      const totalPoints = pointsDB.length
      const points = pointsDB.sort((a, b) => firstPoint(a, b)).splice(data.limit * (data.page - 1), data.limit)

      return response.json({
        limit: data.limit,
        page: data.page,
        points: PointView.renderMany(points),
        total: totalPoints,
        rodada: rodadaDB.number
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Show Point in League HeartClub, try again.' })
    }
  },

  async leaguePitaco (request: Request, response: Response) {
    try {
      const { championship, email } = request.body
      const data = { id: parseInt(championship, 10) || 0, email: email || '' }

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      const UserRepository = getRepository(Users)
      const leaguesRepository = getRepository(Leagues)
      const pointsRepository = getRepository(Points)

      const leagueDB = await leaguesRepository.find({ relations: ['championship'] })
      const league = leagueDB.find(item => item.sistem === 1 && item.championship.id === data.id &&
        item.name === 'Pitaco League')

      if (!league) {
        return response.status(400).send({ error: MessageError.LEAGUENOTFOUND })
      }

      const user = await UserRepository.findOne({ email: data.email }, { relations: ['heartClub'] })
      if (!user) {
        return response.status(400).send({ error: MessageError.USERNOTFOUND })
      }

      league.points = []

      const points = (await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })).filter(point => league.id === point.leagueId.id)
        .sort((a, b) => firstPoint(a, b))

      const point = points.find(item => item.userId.id === user.id)
      const position = points.indexOf(point)

      return response.json(LeaguesView.renderPoint(league, position, point))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Pitaco League, try again.' })
    }
  },

  async leagueHeartClub (request: Request, response: Response) {
    try {
      const { championship, clubeId, email } = request.body
      const data = {
        id: parseInt(championship, 10) || 0,
        clube: parseInt(clubeId, 10) || 0,
        email: email || ''
      }

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      const leaguesRepository = getRepository(Leagues)
      const pointsRepository = getRepository(Points)
      const ClubeRepository = getRepository(Clube)
      const UsersRepository = getRepository(Users)

      const leaguePitaco = (await leaguesRepository.find({ relations: ['championship'] }))
        .find(item => item.sistem === 1 && item.championship.id === data.id && item.name === 'Pitaco League')
      if (!leaguePitaco) {
        return response.status(400).send({ error: MessageError.LEAGUENOTFOUND })
      }

      const clubeDB = await ClubeRepository.findOne({ id: data.clube })
      if (!clubeDB) { return response.status(400).send({ error: MessageError.CLUBNOTFOUND }) }

      const usersDB = await UsersRepository.find({ heartClub: clubeDB })
      const user = usersDB.find(item => item.email === data.email)
      if (!user) return response.status(400).send({ error: MessageError.USERNOTFOUND })

      const points = await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })

      const pointsClub = points.filter(point => leaguePitaco.id === point.leagueId.id)
        .filter(point => {
          const pointTemp = usersDB.find(item => item.id === point.userId.id)
          return !!pointTemp
        }).map(point => {
          point.userId.heartClub = clubeDB
          return point
        }).sort((a, b) => firstPoint(a, b))

      const leagueClub: Leagues = {
        ...leaguePitaco,
        name: `Liga ${clubeDB.name}`,
        description: `Liga dos torcedores do ${clubeDB.name}`,
        trophy: clubeDB.logo,
        points: []
      }

      const point = pointsClub.find(item => item.userId.id === user.id)
      const position = pointsClub.indexOf(point)

      return response.json(LeaguesView.renderPoint(leagueClub, position, point))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on HeartClub League, try again.' })
    }
  },

  async showLeagueDono (request: Request, response: Response) {
    try {
      const { championship, email } = request.body
      const data = { championship: parseInt(championship) || 0, email: email || '' } as DataRequestLeagueDono

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.championship })
      if (!championshipDB) { return response.status(400).send({ error: MessageError.CHAMPIONSHIPNOTFOUND }) }

      const usersRepository = getRepository(Users)
      const user = await usersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const leaguesRepository = getRepository(Leagues)
      const league = await leaguesRepository.findOne({ dono: user, championship })
      if (!league) { return response.status(400).send({ error: MessageError.USERNOTHAVELEAGUE }) }

      league.dono = user
      league.points = []

      const pointsRepository = getRepository(Points)
      const points = (await pointsRepository.find({
        relations: ['userId', 'leagueId']
      })).filter(point => league.id === point.leagueId.id && point.accept === 1)
        .sort((a, b) => firstPoint(a, b))

      const point = points.find(item => item.userId.id === user.id)
      const position = points.indexOf(point)

      return response.json(LeaguesView.renderPoint(league, position, point))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on League of Dono, try again.' })
    }
  },

  async leagueGuestUser (request: Request, response: Response) {
    try {
      const { championship, email } = request.body
      const data = { championship: parseInt(championship) || 0, email: email || '' }

      const error = emailValidade(data.email)
      if (error !== '') {
        return response.status(400).send({ error })
      }

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.championship })
      if (!championshipDB) { return response.status(400).send({ error: MessageError.CHAMPIONSHIPNOTFOUND }) }

      const usersRepository = getRepository(Users)
      const user = await usersRepository.findOne({ email: data.email }, { relations: ['heartClub'] })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const LeagueRepository = getRepository(Leagues)
      const leaguesDB = (await LeagueRepository.find({ relations: ['dono'] }))
        .filter(item => item.sistem === 0 && item.dono.id !== user.id)

      const PointRepository = getRepository(Points)
      const pointsDB = await PointRepository.find({ relations: ['userId', 'leagueId'] })
      const pointsOfUser = pointsDB.filter(item => item.userId.id === user.id && item.accept === 1)

      const leagueGuest = leaguesDB.filter(league => {
        for (let i = 0; i < pointsOfUser.length; i++) {
          if (league.id === pointsOfUser[i].leagueId.id) { return true }
        }
        return false
      })

      const leagues = leagueGuest.map(item => {
        item.points = []
        const points = pointsDB.filter(point => point.leagueId.id === item.id)
          .sort((a, b) => firstPoint(a, b))

        const point = points.find(item => item.userId.id === user.id)
        const position = points.indexOf(point)

        return LeaguesView.renderPoint(item, position, point)
      })

      return response.json(leagues)
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on LeagueGuest of User, try again.' })
    }
  },

  async leagueOfUser (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email: email || '' }

      const error = emailValidade(data.email)
      if (error !== '') {
        return response.status(400).send({ error })
      }

      const usersRepository = getRepository(Users)
      const user = await usersRepository.findOne({ email: data.email }, { relations: ['heartClub'] })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const LeagueRepository = getRepository(Leagues)
      const leaguesDB = (await LeagueRepository.find({ relations: ['dono'] }))
        .filter(item => item.sistem === 0)

      const PointRepository = getRepository(Points)
      const pointsDB = await PointRepository.find({ relations: ['userId', 'leagueId'] })
      const pointsOfUser = pointsDB.filter(item => item.userId.id === user.id && item.accept === 1)

      const leagueGuest = leaguesDB.filter(league => {
        for (let i = 0; i < pointsOfUser.length; i++) {
          if (league.id === pointsOfUser[i].leagueId.id) { return true }
        }
        return false
      })

      const leagues = leagueGuest.map(item => {
        item.points = []
        const points = pointsDB.filter(point => point.leagueId.id === item.id)
          .sort((a, b) => firstPoint(a, b))

        const point = points.find(item => item.userId.id === user.id)
        const position = points.indexOf(point)

        return LeaguesView.renderPoint(item, position, point)
      })

      return response.json(leagues)
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in league of User, try again.' })
    }
  },

  async create (request: Request, response: Response) {
    try {
      const { email, description, trophy, name, championship } = request.body
      const data = {
        email: email || '',
        name: name || '',
        description: description || '',
        trophy: trophy || '',
        championship: parseInt(championship, 10) || 0
      } as DataRequestCreate

      let error = emailValidade(data.email)
      if (error !== '') {
        return response.status(400).send({ error })
      }
      error = nameValidade(data.name)
      if (error !== '') {
        return response.status(400).send({ error })
      }
      error = descriptionValidade(data.description)
      if (error !== '') {
        return response.status(400).send({ error })
      }
      if (data.trophy === '') {
        return response.status(400).send({ error: MessageError.TROPHYNOTINFORMED })
      }

      const usersRepository = getRepository(Users)
      const user = await usersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.championship })
      if (!championshipDB) { return response.status(400).send({ error: MessageError.CHAMPIONSHIPNOTFOUND }) }

      const leaguesRepository = getRepository(Leagues)
      const leagueExisting = await leaguesRepository.findOne({ dono: user, championship: championshipDB })
      if (leagueExisting) { return response.status(400).send({ error: MessageError.USERHAVELEAGUE }) }

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
      return response.status(400).send({ error: 'Error on create league, try again.' })
    }
  },

  async delete (request: Request, response: Response) {
    try {
      const { id } = request.params
      const { email } = request.body
      const data = { id: parseInt(id) || 0, email: email || '' }

      const error = emailValidade(data.email)
      if (error !== '') {
        return response.status(400).send({ error })
      }

      const leaguesRepository = getRepository(Leagues)
      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email: data.email }, { relations: ['leagues'] })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const league = user.leagues.find(item => item.id === data.id)
      if (!league) { return response.status(400).send({ error: MessageError.USERNOTHAVELEAGUE }) }

      await leaguesRepository.delete({ id: data.id })

      return response.send()
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in delete League, nor try again.' })
    }
  },

  async createSolicitation (request: Request, response: Response) {
    try {
      const { id } = request.params
      const { email } = request.body
      const data = { id: parseInt(id, 10) || 0, email: email || '' }

      const error = emailValidade(data.email)
      if (error !== '') {
        return response.status(400).send({ error })
      }

      const LeagueRepository = getRepository(Leagues)
      const leagueDB = await LeagueRepository.findOne({ id: data.id })
      if (!leagueDB) { return response.status(400).send({ error: MessageError.LEAGUENOTFOUND }) }

      const UsersRepository = getRepository(Users)
      const userDB = await UsersRepository.findOne({ email: data.email })
      if (!userDB) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const PointsRepository = getRepository(Points)
      const pointDB = await PointsRepository.findOne({ leagueId: leagueDB, userId: userDB })

      if (pointDB) { return response.status(400).send({ error: MessageError.SOLICITATIONEXISTING }) }

      const dataPoint = {
        points: 0,
        exactScore: 0,
        accept: 0,
        userId: userDB,
        leagueId: leagueDB
      }

      const pointSave = PointsRepository.create(dataPoint)
      const pointResul = await PointsRepository.save(pointSave)

      return response.json(PointView.render(pointResul))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in result Solicitation, try again.' })
    }
  },

  async solicitationLeague (request: Request, response: Response) {
    try {
      const { id } = request.params
      const data = { id: parseInt(id) || 0 }

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
      return response.status(400).send({ error: 'Error on Solicitation League, try again.' })
    }
  },

  async resultSolicitation (request: Request, response: Response) {
    try {
      const { id, email, result } = request.body
      const data = {
        id: parseInt(id, 10) || 0,
        email: email || '',
        result: result === 'true'
      }

      const error = emailValidade(data.email)
      if (error !== '') {
        return response.status(400).send({ error })
      }

      const LeagueRepository = getRepository(Leagues)
      const leagueDB = await LeagueRepository.findOne({ id: data.id })
      if (!leagueDB) { return response.status(400).send({ error: MessageError.LEAGUENOTFOUND }) }

      const UsersRepository = getRepository(Users)
      const userDB = await UsersRepository.findOne({ email: data.email })
      if (!userDB) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const PointsRepository = getRepository(Points)
      const pointDB = await PointsRepository.findOne({ leagueId: leagueDB, userId: userDB, accept: 0 })

      if (!pointDB) { return response.status(400).send({ error: MessageError.SOLICITATIONNOTFOUND }) }

      if (data.result) {
        await PointsRepository.update(pointDB.id, {
          accept: 1
        })
      } else {
        await PointsRepository.delete(pointDB.id)
      }

      return response.send()
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in result Solicitation, try again.' })
    }
  },

  async commonLeagues (request: Request, response: Response) {
    try {
      const { emailUser, emailFriend } = request.body
      const data = { user: emailUser || '', friend: emailFriend || '' }

      if (data.friend === '') {
        return response.status(400).send({ error: MessageError.EMAILFRIENDNOTINFORMED })
      }
      const error = emailValidade(data.user)
      if (error !== '') {
        return response.status(400).send({ error })
      }

      const PointRepository = getRepository(Points)
      const pointsDB = await PointRepository.find({ relations: ['leagueId', 'userId'] })
      const pointsUser = pointsDB.filter(item => item.userId.email === data.user && item.accept === 1)
      const pointFriend = pointsDB.filter(item => item.userId.email === data.friend && item.accept === 1)

      const CommomLeagues = pointsUser.filter(itemUser =>
        !!(pointFriend.find(itemFriend =>
          itemFriend.leagueId.id === itemUser.leagueId.id))
      ).map(item => item.leagueId).sort((a, b) => firstName(a.name, b.name))

      const leagues = []
      const LeagueRepository = getRepository(Leagues)
      for (let i = 0; i < CommomLeagues.length; i++) {
        const league = CommomLeagues[i]
        const leagueDB = await LeagueRepository.findOne({ id: league.id }, { relations: ['dono'] })
        leagueDB.points = []
        leagues.push(leagueDB)
      }

      return response.json(LeaguesView.renderMany(leagues))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Erro on Commom Leagues, try again.' })
    }
  }
}
