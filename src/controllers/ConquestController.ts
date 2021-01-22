import { getRepository } from 'typeorm'

import Championship from '../models/Championship'
import Leagues from '../models/Leagues'
import Points from '../models/Points'
import Conquest from '../models/Conquest'

import { firstPoint } from '../functions'

export default {
  async createConquests (championship: Championship) {
    try {
      if (championship.finishConquest === 1) {
        return
      }

      const ChampionshipRepository = getRepository(Championship)
      ChampionshipRepository.update(championship.id, {
        finishConquest: 1
      })

      const LeagueRepository = getRepository(Leagues)
      const leaguesDB = await LeagueRepository.find({ championship: championship })

      const PointRepository = getRepository(Points)
      const pointsDB = await PointRepository.find({ relations: ['userId', 'leagueId'] })

      for (let i = 0; i < leaguesDB.length; i++) {
        const itemLeague = leaguesDB[i]
        const pointsOfLeague = pointsDB.filter(item => item.leagueId.id === itemLeague.id)
          .sort((a, b) => firstPoint(a, b))
        for (let j = 0; j < pointsOfLeague.length; j++) {
          const itemPoint = pointsOfLeague[j]
          const pos = j + 1
          if (pos === 1) {
            create(itemPoint, itemLeague, pos, 'Campeão')
          } else if (pos === 2) {
            create(itemPoint, itemLeague, pos, 'Vice-Campeão')
          } else if (pos === 3) {
            create(itemPoint, itemLeague, pos, 'Terceiro Melhor')
          } else {
            const val1Porcentage = pointsOfLeague.length * (1 / 100)
            const val5Porcentage = pointsOfLeague.length * (5 / 100)
            if (pos <= val1Porcentage) {
              create(itemPoint, itemLeague, pos, '1% Melhores')
            } else if (pos <= val5Porcentage) {
              create(itemPoint, itemLeague, pos, '5% Melhores')
            } else {
              break
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}

async function create (point: Points, league: Leagues, position: number, description: string) {
  const dataConquest = {
    position,
    description,
    league,
    user: point.userId
  } as Conquest

  const ConquestRepository = getRepository(Conquest)
  const conquestCreate = ConquestRepository.create(dataConquest)
  ConquestRepository.save(conquestCreate)
}
