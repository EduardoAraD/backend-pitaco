import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Championship from '@models/Championship'
import ClubeClassification from '@models/ClubeClassification'
import Match from '@models/Match'

import standingsView from '@views/standings_view'
import rodadaView from '@views/rodada_view'
import { stringForDate } from 'src/functions'

interface DataRequestParams {
  id: number,
  rodadaId?: number
}

export default {
  async tabela (request: Request, response: Response) {
    const { id } = request.params
    const data = { id: parseInt(id) } as DataRequestParams

    const ChampionshipRepository = getRepository(Championship)
    const championshipDB = await ChampionshipRepository.findOne({ id: data.id })
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

    return response.json(standingsView.renderMany(standings))
  },

  async rodadas (request: Request, response: Response) {
    const { id } = request.params
    const data = { id: parseInt(id) } as DataRequestParams

    const ChampionshipRepository = getRepository(Championship)
    const championshipDB = await ChampionshipRepository.findOne({ id: data.id }, { relations: ['rodadas'] })
    if (!championshipDB) return response.status(400).json({ error: 'Championship not found' })

    const MatchRepository = getRepository(Match)
    const matchs = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] })
    const rodadas = championshipDB.rodadas.map(rodada => {
      rodada.matchs = matchs.filter(match => match.rodadaId.id === rodada.id)
      return rodada
    })

    return response.json(rodadaView.renderMany(rodadas))
  },

  async matchsRodada (request: Request, response: Response) {
    const { id, numRodada } = request.params
    const data = { id: parseInt(id), rodada: parseInt(numRodada) } as DataRequestParams

    const ChampionshipRepository = getRepository(Championship)
    const championshipDB = await ChampionshipRepository.findOne({ id: data.id }, { relations: ['rodadas'] })
    if (!championshipDB) return response.status(400).json({ error: 'Championship not found' })

    const rodada = championshipDB.rodadas.find(item => item.number === data.rodadaId)
    if (!rodada) return response.status(400).json({ error: 'Rodada not found' })

    const MatchRepository = getRepository(Match)
    const matchsDB = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] })
    rodada.matchs = matchsDB.filter(match => match.rodadaId.id === rodada.id)

    return response.json(rodadaView.renderItem(rodada))
  },

  async currentRodada (request: Request, response: Response) {
    const { id } = request.params
    const data = { id: parseInt(id) } as DataRequestParams

    const ChampionshipRepository = getRepository(Championship)
    const championshipDB = await ChampionshipRepository.findOne({ id: data.id }, { relations: ['rodadas'] })
    if (!championshipDB) return response.status(400).json({ error: 'Championship not found' })

    const rodada = championshipDB.rodadas.find(item => item.number === championshipDB.currentRodada)
    if (!rodada) return response.status(400).json({ error: 'Rodada not found' })

    const MatchRepository = getRepository(Match)
    const matchsDB = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] })
    rodada.matchs = matchsDB.filter(match => match.rodadaId.id === rodada.id)

    return response.json(rodadaView.renderItem(rodada))
  },

  async currentChampionship () {
    const ChampionshipRepository = getRepository(Championship)
    const championshipsDB = await ChampionshipRepository.find()

    const currentDate = new Date()
    let id = 0
    let menor = currentDate.getTime()
    for (let i = 0; i < championshipsDB.length; i++) {
      const dateStartChampionship = stringForDate(championshipsDB[i].startDate, '12:00:00')
      const dateEndChampionship = stringForDate(championshipsDB[i].endDate, '12:00:00')
      if (dateStartChampionship.getTime() <= currentDate.getTime() && dateEndChampionship.getTime() >= currentDate.getTime()) {
        return championshipsDB[i].id
      } else {
        const diffTimeStartCurrent = Math.abs(currentDate.getTime() - dateStartChampionship.getTime())
        const diffTimeEndCurrent = Math.abs(currentDate.getTime() - dateEndChampionship.getTime())
        const menorTimeChampionship = diffTimeStartCurrent <= diffTimeEndCurrent ? diffTimeStartCurrent : diffTimeEndCurrent

        if (menor > menorTimeChampionship) {
          menor = menorTimeChampionship
          id = championshipsDB[i].id
        }
      }
    }
    return id
  }
}
