import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import { emailValidade } from '../middlewares/validad'

import Pitaco from '../models/Pitaco'
import Users from '../models/Users'
import Points from '../models/Points'
import Match from '../models/Match'
import Championship from '../models/Championship'

import pitacoView from '../views/pitaco_view'
import matchView from '../views/match_view'

import { firstMatch, MessageError, stringForDate } from '../functions'

interface DataRequestCreate {
    email: string,
    pitacos: {
        id: number,
        golsHome: string,
        golsAway: string
    }[]
}
interface DataRequestShowUser {
  email: string,
  championshipId: number
  rodada: number
}

export default {
  async index (request: Request, response: Response) {
    try {
      const PitacoRepository = getRepository(Pitaco)

      const pitacosDB = await PitacoRepository.find({ relations: ['userId', 'matchId'] })

      const MatchRepository = getRepository(Match)
      const matchs = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway'] })
      const pitacos = pitacosDB.map(pitaco => {
        pitaco.matchId = matchs.find(match => match.id === pitaco.matchId.id)

        return pitaco
      })

      return response.json(pitacoView.renderMany(pitacos))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in pitaco, try again.' })
    }
  },

  async showUserRodada (request: Request, response: Response) {
    try {
      const { email, championship, rodada } = request.body
      const data = {
        email: email || '',
        championshipId: parseInt(championship, 10) || 0,
        rodada: parseInt(rodada, 10) || 1
      } as DataRequestShowUser

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.championshipId }, { relations: ['rodadas'] })
      if (!championshipDB) { return response.status(400).send({ error: MessageError.CHAMPIONSHIPNOTFOUND }) }

      const rodadaDB = championshipDB.rodadas.find((item) => item.number === data.rodada)

      const MatchRepository = getRepository(Match)
      const matchsDB = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] })
      const matchs = matchsDB.filter(match => match.rodadaId.id === rodadaDB.id)
        .sort((a, b) => firstMatch(a, b))

      const PitacoRepository = getRepository(Pitaco)
      const pitacosOfUser: Pitaco[] = []
      for (let i = 0; i < matchs.length; i++) {
        const pitaco = await PitacoRepository.findOne({ matchId: matchs[i], userId: user })
        if (pitaco) {
          pitaco.matchId = matchs[i]
          pitaco.userId = user
          pitacosOfUser.push(pitaco)
        }
      }

      return response.json({
        pitacos: pitacoView.renderMany(pitacosOfUser),
        matchs: matchView.renderMany(matchs)
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Show Pitacos of Rodada of User, try again.' })
    }
  },

  async showUserMatchsDay (request: Request, response: Response) {
    try {
      const { email, date } = request.body
      const data = { email: email || '', date: date || '' }

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      if (data.date === '') return response.status(400).send({ error: MessageError.DATENOTINFORMED })

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const MatchRepository = getRepository(Match)
      const matchsDB = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway'] })
      const matchs = matchsDB.filter(match => match.date === data.date)
        .sort((a, b) => firstMatch(a, b))

      const PitacoRepository = getRepository(Pitaco)
      const pitacosOfUser: Pitaco[] = []
      for (let i = 0; i < matchs.length; i++) {
        const pitaco = await PitacoRepository.findOne({ matchId: matchs[i], userId: user })
        if (pitaco) {
          pitaco.matchId = matchs[i]
          pitaco.userId = user
          pitacosOfUser.push(pitaco)
        }
      }

      return response.json({
        pitacos: pitacoView.renderMany(pitacosOfUser),
        matchs: matchView.renderMany(matchs)
      })
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Show Pitacos of day of User, try again.' })
    }
  },

  async createUpdate (request: Request, response: Response) {
    try {
      const { email, pitacos } = request.body
      const data = {
        email: email || '',
        pitacos: pitacos.map(item => {
          return {
            id: item.id || 0,
            golsHome: ('' + item.golsHome) || '',
            golsAway: ('' + item.golsAway) || ''
          }
        }) || []
      } as DataRequestCreate

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      if (data.pitacos.length === 0) {
        return response.status(400).send({ error: MessageError.PITACOSNOTINFORMED })
      }

      const UsersRepository = getRepository(Users)
      const user = await UsersRepository.findOne({ email: data.email })
      if (!user) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      const PitacoRepository = getRepository(Pitaco)
      const MatchRepository = getRepository(Match)

      const pitacosOfUser: Pitaco[] = []
      for (let i = 0; i < data.pitacos.length; i++) {
        if (data.pitacos[i].golsHome !== '' && data.pitacos[i].golsAway !== '') {
          const macthDB = await MatchRepository.findOne({ id: data.pitacos[i].id }, { relations: ['clubeHome', 'clubeAway'] })

          if (hourLimitPitacoDate(macthDB.date, macthDB.hour)) {
            const dataPitaco = {
              golsHome: parseInt(data.pitacos[i].golsHome),
              golsAway: parseInt(data.pitacos[i].golsAway),
              point: 0,
              exactScore: 0,
              userId: user,
              matchId: macthDB
            } as Pitaco

            const pitacoDB = await PitacoRepository.findOne({ matchId: dataPitaco.matchId, userId: user })
            if (!pitacoDB) {
              const pitacoUser = PitacoRepository.create(dataPitaco)
              await PitacoRepository.save(pitacoUser)

              pitacosOfUser.push(pitacoUser)
            } else {
              await PitacoRepository.update(pitacoDB.id, {
                golsHome: dataPitaco.golsHome,
                golsAway: dataPitaco.golsAway
              })

              pitacoDB.golsHome = dataPitaco.golsHome
              pitacoDB.golsAway = dataPitaco.golsAway
              pitacoDB.userId = user
              pitacoDB.matchId = macthDB

              pitacosOfUser.push(pitacoDB)
            }
          }
        }
      }

      return response.json(pitacoView.renderMany(pitacosOfUser))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on create pitaco, try again.' })
    }
  },

  async resultPitaco (match: Match, golsHome: number, golsAway: number) {
    const UsersRepository = getRepository(Users)
    const PitacoRepository = getRepository(Pitaco)
    const PointsRepository = getRepository(Points)

    const usersAll = await UsersRepository.find()

    for (let i = 0; i < usersAll.length; i++) {
      const pitaco = await PitacoRepository.findOne({ matchId: match, userId: usersAll[i] })
      if (pitaco) {
        const pointBefore = pitaco.point
        const exactScoreBefore = pitaco.exactScore
        const point = definePoints(golsHome, golsAway, pitaco)
        const exactScore = point === 10 ? 1 : 0

        await PitacoRepository.update(pitaco.id, { exactScore, point })
        const pointsOfUser = await PointsRepository.find({ userId: usersAll[i] })

        let j = 0
        for (j = 0; j < pointsOfUser.length; j++) {
          if (pointsOfUser[j].accept === 1) {
            await PointsRepository.update(pointsOfUser[j].id, {
              points: pointsOfUser[j].points + (point - pointBefore),
              exactScore: pointsOfUser[j].exactScore + (exactScore - exactScoreBefore)
            })
          }
        }
      }
    }
  }
}

function definePoints (golsHome: number, golsAway, pitaco: Pitaco): number {
  if (pitaco.golsHome === golsHome && pitaco.golsAway === golsAway) {
    return 10
  } else {
    let point = 0
    if ((pitaco.golsHome === pitaco.golsAway && golsHome === golsAway) ||
      (pitaco.golsHome < pitaco.golsAway && golsHome < golsAway) ||
      (pitaco.golsHome > pitaco.golsAway && golsHome > golsAway)) {
      point += 5
    }
    if (pitaco.golsHome === golsHome || pitaco.golsAway === golsAway) { point += 2 }
    return point
  }
}

function hourLimitPitacoDate (date: string, hour: string): boolean {
  const dateMatch = stringForDate(date, hour)
  dateMatch.setHours(dateMatch.getHours() - 2)
  const currentDate = new Date()
  currentDate.setHours(currentDate.getHours() - 3)

  if (dateMatch > currentDate) { return true }
  return false
}
