import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Pitaco from '@models/Pitaco'
import Users from '@models/Users'

interface DataRequestCreate {
    email: string,
    pitacos: {
        matchId: number,
        golsHome: number,
        golsAway: number
    }[]
}

export default {
  async index (request: Request, response: Response) {
    const pitacoRepository = getRepository(Pitaco)

    const pitacos = await pitacoRepository.find({ relations: ['userId'] })

    return response.json(pitacos)
  },

  show () {},

  async create (request: Request, response: Response) {
    const { email, pitacos } = request.body
    const data = {
      email,
      pitacos
    } as DataRequestCreate

    const usersRepository = getRepository(Users)
    const user = await usersRepository.findOne({ email: data.email })
    if (!user) { return response.status(400).send({ error: 'User not found' }) }

    const pitacoRepository = getRepository(Pitaco)

    const pitacosOfUser = []
    let i = 0
    for (i = 0; i < data.pitacos.length; i++) {
      const dataPitaco = {
        matchId: data.pitacos[i].matchId,
        golsHome: data.pitacos[i].golsHome,
        golsAway: data.pitacos[i].golsAway,
        userId: user
      }

      const pitacoUser = pitacoRepository.create(dataPitaco)
      await pitacoRepository.save(pitacoUser)
      pitacosOfUser.push(pitacoUser)
    }

    return response.json(pitacosOfUser)
  },

  update () {},

  resultPitaco () {}
}
