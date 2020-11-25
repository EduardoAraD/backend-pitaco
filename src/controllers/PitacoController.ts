import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Pitaco from '@models/Pitaco'
import Users from '@models/Users'
import Points from '@models/Points'
import Match from '@models/Match'

import pitacoView from '@views/pitaco_view'
import matchView from '@views/match_view'

interface DataRequestCreate {
    email: string,
    pitacos: {
        matchIdApi: number,
        golsHome: number,
        golsAway: number
    }[]
}
interface DataRequestShowUser {
  email: string,
  rodadaId: number
}

export default {
  async index (request: Request, response: Response) {
    const PitacoRepository = getRepository(Pitaco)

    const pitacosDB = await PitacoRepository.find({ relations: ['userId', 'matchId'] })

    const MatchRepository = getRepository(Match)
    const matchs = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway'] })
    const pitacos = pitacosDB.map(pitaco => {
      pitaco.matchId = matchs.find(match => match.id === pitaco.matchId.id)

      return pitaco
    })

    return response.json(pitacoView.renderMany(pitacos))
  },

  async showUserRodada (request: Request, response: Response) { // - confuso
    const { email, rodadaId } = request.body
    const data = { email, rodadaId } as DataRequestShowUser

    const UsersRepository = getRepository(Users)
    const user = await UsersRepository.findOne({ email: data.email })
    if (!user) { return response.status(400).send({ error: 'User not found' }) }

    const MatchRepository = getRepository(Match)
    const matchsDB = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] })
    const matchs = matchsDB.filter(match => match.rodadaId.id === data.rodadaId)

    const PitacoRepository = getRepository(Pitaco)
    const pitacosOfUser: Pitaco[] = []
    for (let i = 0; i < matchs.length; i++) {
      const pitaco = await PitacoRepository.findOne({ matchId: matchs[i], userId: user })
      if (pitaco) {
        pitaco.matchId = matchs[i]
        pitacosOfUser.push(pitaco)
      }
    }

    return response.json({
      pitacos: pitacoView.renderMany(pitacosOfUser),
      matchs: matchView.renderMany(matchs)
    })
  },

  async createUpdate (request: Request, response: Response) {
    const { email, pitacos } = request.body
    const data = { email, pitacos } as DataRequestCreate

    const UsersRepository = getRepository(Users)
    const user = await UsersRepository.findOne({ email: data.email })
    if (!user) { return response.status(400).send({ error: 'User not found' }) }

    const PitacoRepository = getRepository(Pitaco)
    const MatchRepository = getRepository(Match)

    const pitacosOfUser: Pitaco[] = []
    for (let i = 0; i < data.pitacos.length; i++) {
      const macthDB = await MatchRepository.findOne({ matchIdApi: data.pitacos[i].matchIdApi })

      if (hourLimitPitacoDate(macthDB.date, macthDB.hour)) {
        const dataPitaco = {
          golsHome: data.pitacos[i].golsHome,
          golsAway: data.pitacos[i].golsAway,
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

    return response.json(pitacoView.renderMany(pitacosOfUser))
  },

  async resultPitaco (match: Match, golsHome: number, golsAway: number) {
    const UsersRepository = getRepository(Users)
    const PitacoRepository = getRepository(Pitaco)
    const PointsRepository = getRepository(Points)

    const usersAll = await UsersRepository.find()

    let i = 0
    for (i = 0; i < usersAll.length; i++) {
      const pitaco = await PitacoRepository.findOne({ matchId: match, userId: usersAll[i] })
      if (pitaco) {
        const point = definePoints(golsHome, golsAway, pitaco)
        const exactScore = point === 10 ? 1 : 0

        await PitacoRepository.update(pitaco.id, { exactScore, point })
        const pointsOfUser = await PointsRepository.find({ userId: usersAll[i] })

        let j = 0
        for (j = 0; j < pointsOfUser.length; j++) {
          await PointsRepository.update(pointsOfUser[j].id, {
            points: pointsOfUser[j].points + point,
            exactScore: pointsOfUser[j].exactScore + exactScore
          })
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
  const year = date.slice(-4)
  const mouht = date.slice(3, 5)
  const day = date.slice(0, 2)
  const dateMatch = new Date(`${year}-${mouht}-${day} ${hour}`)
  dateMatch.setHours(dateMatch.getHours() - 2)
  const currentDate = new Date()
  if (dateMatch > currentDate) { return true }
  return false
}
