import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import Championship from '../models/Championship'
import Standing from '../models/Standing'
import Match from '../models/Match'
import Clube from '../models/Clube'

import standingsView from '../views/standings_view'
import rodadaView from '../views/rodada_view'
import ClubeView from '../views/clube_view'

import { firstMatch, firstName, MessageError, stringForDate } from '../functions'

import { Atualization } from './Atualization'

interface DataRequestParams {
  id: number,
  rodadaId?: number
}

export default {
  async tabela (request: Request, response: Response) {
    try {
      const { id } = request.params
      const data = { id: parseInt(id) || 0 } as DataRequestParams

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.id })
      if (!championshipDB) {
        return response.status(400).json({ error: MessageError.CHAMPIONSHIPNOTFOUND })
      }

      const StandingRepository = getRepository(Standing)
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
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in get tabela, try again.' })
    }
  },

  async rodadas (request: Request, response: Response) {
    try {
      const { id } = request.params
      const data = { id: parseInt(id) || 0 } as DataRequestParams

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.id }, { relations: ['rodadas'] })
      if (!championshipDB) return response.status(400).json({ error: MessageError.CHAMPIONSHIPNOTFOUND })

      const MatchRepository = getRepository(Match)
      const matchs = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] })
      const rodadas = championshipDB.rodadas.map(rodada => {
        rodada.matchs = matchs.filter(match => match.rodadaId.id === rodada.id)
          .sort((a, b) => firstMatch(a, b))
        return rodada
      })

      return response.json(rodadaView.renderMany(rodadas))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in rodadas, try again.' })
    }
  },

  async matchsRodada (request: Request, response: Response) {
    try {
      const { id, numRodada } = request.params
      const data = { id: parseInt(id) || 0, rodadaId: parseInt(numRodada) || 1 } as DataRequestParams

      const ChampionshipRepository = getRepository(Championship)
      const championshipDB = await ChampionshipRepository.findOne({ id: data.id }, { relations: ['rodadas'] })
      if (!championshipDB) return response.status(400).json({ error: MessageError.CHAMPIONSHIPNOTFOUND })

      const rodada = championshipDB.rodadas.find(item => item.number === data.rodadaId)
      if (!rodada) return response.status(400).json({ error: MessageError.RODADANOTFOUND })

      const MatchRepository = getRepository(Match)
      const matchsDB = await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] })
      rodada.matchs = matchsDB.filter(match => match.rodadaId.id === rodada.id)
        .sort((a, b) => firstMatch(a, b))

      return response.json(rodadaView.renderItem(rodada))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error in matchs Rodada, try again.' })
    }
  },

  async getClubes (request: Request, response: Response) {
    try {
      const ClubeRepository = getRepository(Clube)
      const clubesDB = (await ClubeRepository.find()).sort((a, b) => firstName(a.name, b.name))

      return response.json(ClubeView.renderMany(clubesDB))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Erro on get Clubes, try again.' })
    }
  },

  async currentChampionship () {
    const ChampionshipRepository = getRepository(Championship)
    const championshipsDB: Championship[] = await ChampionshipRepository.find()
    if (championshipsDB.length === 0) {
      return null
    }

    const currentDate = new Date()
    currentDate.setHours(currentDate.getHours() - 3)

    let championshipReturn: Championship = championshipsDB[0]
    let menor = currentDate.getTime()
    for (let i = 0; i < championshipsDB.length; i++) {
      const dateStartChampionship = stringForDate(championshipsDB[i].startDate, '12:00:00')
      const dateEndChampionship = stringForDate(championshipsDB[i].endDate, '12:00:00')
      if (dateStartChampionship.getTime() <= currentDate.getTime() && dateEndChampionship.getTime() >= currentDate.getTime()) {
        return championshipsDB[i]
      } else {
        const diffTimeStartCurrent = Math.abs(currentDate.getTime() - dateStartChampionship.getTime())
        const diffTimeEndCurrent = Math.abs(currentDate.getTime() - dateEndChampionship.getTime())
        const menorTimeChampionship = diffTimeStartCurrent <= diffTimeEndCurrent ? diffTimeStartCurrent : diffTimeEndCurrent

        if (menor > menorTimeChampionship) {
          menor = menorTimeChampionship
          championshipReturn = championshipsDB[i]
        }
      }
    }
    return championshipReturn
  },

  async AtualizationSportApi (request: Request, response: Response) {
    try {
      const { cod } = request.params
      if (cod === 'SKJASD') {
        await Atualization()
        return response.json({ message: 'Atualizado.' })
      }
      return response.send()
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Erro on Atualization of API, try again.' })
    }
  }
}
