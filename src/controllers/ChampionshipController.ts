import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Championship from '@models/Championship'
import ClubeClassification from '@models/ClubeClassification'

export default {
  async tabela (request: Request, response: Response) {
    const { id } = request.params

    const ChampionshipRepository = getRepository(Championship)
    const championshipDB = await ChampionshipRepository.findOne({ id: parseInt(id) })
    if (!championshipDB) {
      return response.status(400).json({ error: 'Championship not exist' })
    }

    const StandingRepository = getRepository(ClubeClassification)
    const standings = (await StandingRepository.find({ relations: ['clube', 'championshipId'] }))
      .filter(item => item.championshipId.id === championshipDB.id)
      .sort((a, b) => {
        if (a.points < b.points) return 1
        else if (a.points === b.points) {
          if (a.wins < b.wins) return 1
          else if (a.wins === b.wins) {
            if (a.goalsScored - a.goalsConceded < b.goalsScored - b.goalsConceded) return 1
            else if (a.goalsScored - a.goalsConceded === b.goalsScored - b.goalsConceded) {
              if (a.goalsScored < b.goalsScored) return 1
              else if (a.goalsScored === b.goalsScored) return 0
            }
          }
        }
        return -1
      })

    return response.json({ standings })
  },
fazer
  async rodadas (request: Request, response: Response) {},

  async matchsRodada (request: Request, response: Response) {}
}
