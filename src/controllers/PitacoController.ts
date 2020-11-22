import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Pitaco from '@models/Pitaco'
import Users from '@models/Users'
import Points from '@models/Points'

import pitacoView from '@views/pitaco_view'

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
  matchs: {
    matchIdApi: number
  }[]
}
interface DataRequestResultPitaco {
  matchIdApi: number,
  golsHome: number,
  golsAway: number
}

export default {
  async index (request: Request, response: Response) {
    const pitacoRepository = getRepository(Pitaco)

    const pitacos = await pitacoRepository.find({ relations: ['userId'] })

    return response.json(pitacoView.renderMany(pitacos))
  },

  async showUser (request: Request, response: Response) {
    const { email, matchs } = request.body
    const data = { email, matchs } as DataRequestShowUser

    const usersRepository = getRepository(Users)
    const user = await usersRepository.findOne({ email: data.email })
    if (!user) { return response.status(400).send({ error: 'User not found' }) }

    const pitacoRepository = getRepository(Pitaco)
    const pitacosOfUser: Pitaco[] = []

    let i = 0
    for (i = 0; i < data.matchs.length; i++) {
      const matchIdApi = data.matchs[i].matchIdApi
      const pitaco = await pitacoRepository.findOne({ matchIdApi, userId: user })
      if (pitaco) {
        pitaco.userId = user
        pitacosOfUser.push(pitaco)
      }
    }

    return response.json(pitacoView.renderMany(pitacosOfUser))
  },

  async createUpdate (request: Request, response: Response) {
    const { email, pitacos } = request.body
    const data = { email, pitacos } as DataRequestCreate

    const usersRepository = getRepository(Users)
    const user = await usersRepository.findOne({ email: data.email })
    if (!user) { return response.status(400).send({ error: 'User not found' }) }

    const pitacoRepository = getRepository(Pitaco)

    const pitacosOfUser: Pitaco[] = []
    let i = 0
    for (i = 0; i < data.pitacos.length; i++) {
      const dataPitaco = {
        matchIdApi: data.pitacos[i].matchIdApi,
        golsHome: data.pitacos[i].golsHome,
        golsAway: data.pitacos[i].golsAway,
        userId: user
      }

      const pitacoExist = await pitacoRepository.findOne({ matchIdApi: dataPitaco.matchIdApi, userId: user })
      if (!pitacoExist) {
        const pitacoUser = pitacoRepository.create(dataPitaco)
        await pitacoRepository.save(pitacoUser)

        pitacosOfUser.push(pitacoUser)
      } else {
        await pitacoRepository.update(pitacoExist.id, {
          golsHome: dataPitaco.golsHome,
          golsAway: dataPitaco.golsAway
        })

        pitacoExist.golsHome = dataPitaco.golsHome
        pitacoExist.golsAway = dataPitaco.golsAway
        pitacoExist.userId = user

        pitacosOfUser.push(pitacoExist)
      }
    }

    return response.json(pitacoView.renderMany(pitacosOfUser))
  },

  async resultPitaco (request: Request, response: Response) {
    const { matchId, golsHome, golsAway } = request.body
    const data = {
      matchIdApi: parseInt(matchId),
      golsHome: parseInt(golsHome),
      golsAway: parseInt(golsAway)
    } as DataRequestResultPitaco

    const usersRepository = getRepository(Users)
    const pitacoRepository = getRepository(Pitaco)
    const pointsRepository = getRepository(Points)

    const usersAll = await usersRepository.find()

    let i = 0
    for (i = 0; i < usersAll.length; i++) {
      const pitaco = await pitacoRepository.findOne({ matchIdApi: data.matchIdApi, userId: usersAll[i] })
      if (pitaco) {
        let point = 0
        let exactPlacar = 0
        if (pitaco.golsHome === data.golsHome && pitaco.golsAway === data.golsAway) {
          point = 10
          exactPlacar = 1
        } else {
          if ((pitaco.golsHome === pitaco.golsAway && data.golsHome === data.golsAway) ||
            (pitaco.golsHome < pitaco.golsAway && data.golsHome < data.golsAway) ||
            (pitaco.golsHome > pitaco.golsAway && data.golsHome > data.golsAway)) {
            point = 5
          }
        }
        const pointsOfUser = await pointsRepository.find({ userId: usersAll[i] })

        let j = 0
        for (j = 0; j < pointsOfUser.length; j++) {
          await pointsRepository.update(pointsOfUser[j].id, {
            points: pointsOfUser[j].points + point,
            exactScore: pointsOfUser[j].exactScore + exactPlacar
          })
        }
      }
    }

    return response.send()
  }
}
