import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import api from '../services/api'

import Championship from '@models/Championship'
import ClubeClassification from '@models/ClubeClassification'
import Clube from '@models/Clube'
import Rodada from '@models/Rodada'
import Match from '@models/Match'

interface DataRequestChampionship {
  name: string,
  startDate: string,
  endDate: string,
  seasonId: number
}
interface DataRodadaMatch {
  numRodada: number,
  match: Match
}

const fetchData = async (url: string, params?: string) => {
  const result = await api.get(`${url}?apikey=${process.env.KEY_API}${params ? `&${params}` : ''}`)
  return result.data.data
}

async function initAll (request: Request, response: Response, paramsChampionship: DataRequestChampionship) {
  try {
    const resultMyLeagues = await fetchData('/soccer/leagues', 'subscribed=true')
    const myLeagueFilter = resultMyLeagues.find(item => item.league_id === 693)

    const dataResultChampionship = {
      name: `${myLeagueFilter.name} ${paramsChampionship.name}`,
      startDate: paramsChampionship.startDate,
      endDate: paramsChampionship.endDate,
      seasonId: paramsChampionship.seasonId
    } as DataRequestChampionship

    const clubesSaves: Clube[] = []
    const ClubeRepository = getRepository(Clube)
    const clubesDB = await ClubeRepository.find()
    const resultClubes = await fetchData('/soccer/teams', `country_id=${myLeagueFilter.country_id}`)

    for (let i = 0; i < resultClubes.length; i++) {
      const dataClube = {
        name: resultClubes[i].name.slice(0, -3),
        shortCode: resultClubes[i].short_code,
        clubeIdApi: parseInt(resultClubes[i].team_id),
        logo: resultClubes[i].logo
      } as Clube

      const clubeDB = clubesDB.find(itemClube => itemClube.clubeIdApi === dataClube.clubeIdApi)
      if (!clubeDB) {
        const clubeCreate = ClubeRepository.create(dataClube)
        const clubeSave = await ClubeRepository.save(clubeCreate)

        clubesSaves.push(clubeSave)
      } else {
        clubesSaves.push(clubeDB)
      }
    }

    const resultStandings = await fetchData('/soccer/standings',
      `season_id=${dataResultChampionship.seasonId}`)

    const standing = resultStandings.standings
    const standingChampionship: ClubeClassification[] = []

    for (let j = 0; j < standing.length; j++) {
      const utilization = (parseInt(standing[j].overall.won) * 3 + parseInt(standing[j].overall.draw)) /
        (parseInt(standing[j].overall.games_played) * 3)

      const itemStanding = {
        position: j + 1,
        points: parseInt(standing[j].points),
        clube: clubesSaves.find(clube => clube.clubeIdApi === parseInt(standing[j].team_id)),
        wins: parseInt(standing[j].overall.won),
        draw: parseInt(standing[j].overall.draw),
        matchs: parseInt(standing[j].overall.games_played),
        goalsScored: parseInt(standing[j].overall.goals_scored),
        goalsConceded: parseInt(standing[j].overall.goals_against),
        positionVariation: 0,
        utilization: parseInt((utilization * 100).toFixed(2))
      } as ClubeClassification

      standingChampionship.push(itemStanding)
    }

    const matches: DataRodadaMatch[] = []
    const resultMatchs = await fetchData('/soccer/matches',
      `season_id=${dataResultChampionship.seasonId}&date_from=${dataResultChampionship.startDate}`)
    for (let k = 0; k < resultMatchs.length; k++) {
      const itemResultMatch = resultMatchs[k]
      const dataMatch = {
        status: itemResultMatch.status,
        stadium: itemResultMatch.venue.name,
        date: itemResultMatch.match_start.slice(0, 10),
        hour: itemResultMatch.match_start.slice(11),
        matchIdApi: parseInt(itemResultMatch.match_id),
        golsHome: parseInt(itemResultMatch.stats.home_score),
        golsAway: parseInt(itemResultMatch.stats.away_score),
        clubeHome: clubesSaves.find(clube => clube.clubeIdApi === parseInt(itemResultMatch.home_team.team_id)),
        clubeAway: clubesSaves.find(clube => clube.clubeIdApi === parseInt(itemResultMatch.away_team.team_id))
      } as Match

      const dataRodadaMatch = {
        numRodada: parseInt(itemResultMatch.round.name),
        match: dataMatch
      } as DataRodadaMatch

      matches.push(dataRodadaMatch)
    }

    const rodadasChampionship: Rodada[] = []
    const resultRodada = await fetchData('/soccer/rounds', `season_id=${dataResultChampionship.seasonId}`)
    for (let i = 0; i < resultRodada.length; i++) {
      const dataRodada = {
        name: resultRodada[i].name,
        number: parseInt(resultRodada[i].name)
      }
      let matchsFilter: Match[] = []
      const matchsOfRodada = matches.filter(match => match.numRodada === dataRodada.number)
      if (matchsOfRodada.length > 10) {
        matchsFilter = filterMatchRodada(matchsOfRodada)
      } else {
        matchsFilter = matchsOfRodada.map(item => item.match)
      }

      const rodadaChamspionship = {
        name: dataRodada.name,
        number: dataRodada.number,
        matchs: matchsFilter
      } as Rodada

      rodadasChampionship.push(rodadaChamspionship)
    }

    const dataChampionship = {
      name: dataResultChampionship.name,
      startDate: dataResultChampionship.startDate,
      endDate: dataResultChampionship.endDate,
      seasonId: dataResultChampionship.seasonId,
      standings: standingChampionship,
      rodadas: rodadasChampionship
    } as Championship

    const ChampionshipRepository = getRepository(Championship)
    const championshipCreate = ChampionshipRepository.create(dataChampionship)
    const championshipSave = await ChampionshipRepository.save(championshipCreate)

    return response.json(championshipSave)
  } catch (err) {
    console.log(err)
    return response.status(400).json({ error: 'Error not found, try again' })
  }
}

async function Atualization (request: Request, response: Response) {
  try {
    const resultChampionship = await fetchData('/soccer/seasons', 'league_id=693')
    const championshipFilter = resultChampionship[resultChampionship.length - 1]

    const dataResultChampionship = {
      name: championshipFilter.name,
      startDate: championshipFilter.start_date,
      endDate: championshipFilter.end_date,
      seasonId: parseInt(championshipFilter.season_id)
    } as DataRequestChampionship

    const ChampionshipRepositoty = getRepository(Championship)
    const championshipDB = await ChampionshipRepositoty.findOne({ seasonId: dataResultChampionship.seasonId })
    if (!championshipDB) {
      return await initAll(request, response, dataResultChampionship)
    }

    const matchsLive = await fetchData('/soccer/matches', `season_id=${championshipDB.seasonId}&live=true`)
    if (matchsLive.length === 0) {
      return response.json({ message: 'Not matches' })
    }

    const MatchRepository = getRepository(Match)
    const RodadaRepository = getRepository(Rodada)
    const ClubeRepository = getRepository(Clube)

    let updateStandings = false

    for (let i = 0; i < matchsLive.length; i++) {
      const itemResultMatch = matchsLive[i]
      const clubeHomeDB = await ClubeRepository.findOne({ clubeIdApi: parseInt(itemResultMatch.home_team.team_id) })
      const clubeAwayDB = await ClubeRepository.findOne({ clubeIdApi: parseInt(itemResultMatch.away_team.team_id) })
      const rodadaDB = await RodadaRepository.findOne({ number: parseInt(itemResultMatch.round.name) })
      const dataMatch = {
        status: itemResultMatch.status,
        stadium: itemResultMatch.venue.name,
        date: itemResultMatch.match_start.slice(0, 10),
        hour: itemResultMatch.match_start.slice(11),
        matchIdApi: parseInt(itemResultMatch.match_id),
        golsHome: parseInt(itemResultMatch.stats.home_score),
        golsAway: parseInt(itemResultMatch.stats.away_score),
        clubeHome: clubeHomeDB,
        clubeAway: clubeAwayDB,
        rodadaId: rodadaDB
      } as Match

      const matchDB = await MatchRepository.findOne({
        clubeAway: dataMatch.clubeAway,
        clubeHome: dataMatch.clubeHome,
        rodadaId: dataMatch.rodadaId
      })
      if (!matchDB) {
        const matchCreate = MatchRepository.create(dataMatch)
        await MatchRepository.save(matchCreate)
      } else {
        if (!equalsMatch(matchDB, dataMatch)) {
          await MatchRepository.update(matchDB.id, {
            status: dataMatch.status,
            stadium: dataMatch.stadium,
            date: dataMatch.date,
            hour: dataMatch.hour,
            matchIdApi: dataMatch.matchIdApi,
            golsHome: dataMatch.golsHome,
            golsAway: dataMatch.golsAway
          })
          updateStandings = true
        }
      }
    }

    if (updateStandings) {
      const StandingsRepository = getRepository(ClubeClassification)
      const standingsDB = await StandingsRepository.find({ relations: ['clubeId', 'championshipId'] })
      const standingsChamspionshipDB = standingsDB.filter(item => item.championshipId.id === championshipDB.id)

      const resultStandings = await fetchData('/soccer/standings',
    `season_id=${dataResultChampionship.seasonId}`)

      const standing = resultStandings.standings

      for (let j = 0; j < standing.length; j++) {
        const utilization = (parseInt(standing[j].overall.won) * 3 + parseInt(standing[j].overall.draw)) /
      (parseInt(standing[j].overall.games_played) * 3)
        const clubeDB = await ClubeRepository.findOne({ clubeIdApi: parseInt(standing[j].team_id) })
        const itemStanding = {
          position: j + 1,
          points: parseInt(standing[j].points),
          clube: clubeDB,
          wins: parseInt(standing[j].overall.won),
          draw: parseInt(standing[j].overall.draw),
          matchs: parseInt(standing[j].overall.games_played),
          goalsScored: parseInt(standing[j].overall.goals_scored),
          goalsConceded: parseInt(standing[j].overall.goals_against),
          positionVariation: 0,
          utilization: parseInt((utilization * 100).toFixed(2))
        } as ClubeClassification

        const itemStandingDB = standingsChamspionshipDB.find(item => item.position === itemStanding.position)
        if (!equalsItemStanding(itemStanding, itemStandingDB)) {
          const clubeStanding = standingsChamspionshipDB.find(item => item.clube.id === itemStanding.clube.id)
          await StandingsRepository.update(itemStandingDB.id, {
            points: itemStanding.points,
            clube: itemStanding.clube,
            wins: itemStanding.wins,
            draw: itemStanding.draw,
            matchs: itemStanding.matchs,
            goalsScored: itemStanding.goalsScored,
            goalsConceded: itemStanding.goalsConceded,
            positionVariation: clubeStanding.position - itemStanding.position,
            utilization: itemStanding.utilization
          })
        }
      }
    }

    return response.send()
  } catch (err) {
    console.log(err)
    return response.status(400).json({ error: 'Error not found, try again' })
  }
}

function filterMatchRodada (matchs: DataRodadaMatch[]): Match[] {
  const matchsFilter: Match[] = []
  let i = 0
  while (matchsFilter.length < 10) {
    if (i >= matchs.length) {
      console.log('problema de 10')
      return matchsFilter
    }
    const itemInit = matchs[i].match
    if (matchsFilter.filter(item => (item.clubeHome.clubeIdApi === itemInit.clubeHome.clubeIdApi &&
      item.clubeAway.clubeIdApi === itemInit.clubeAway.clubeIdApi)).length <= 0) {
      const matchItemFilter = matchs.filter(item =>
        (item.match.clubeHome.clubeIdApi === itemInit.clubeHome.clubeIdApi &&
        item.match.clubeAway.clubeIdApi === itemInit.clubeAway.clubeIdApi))

      if (matchItemFilter.length > 1) {
        const index = matchItemFilter.length - 1
        matchsFilter.push(matchItemFilter[index].match)
      } else {
        matchsFilter.push(matchItemFilter[0].match)
      }
    }

    i += 1
  }

  return matchsFilter
}

function equalsMatch (match1: Match, match2: Match): boolean {
  return match1.status === match2.status && match1.stadium === match2.stadium &&
    match1.date === match2.date && match1.hour === match2.hour && match1.matchIdApi === match2.matchIdApi &&
    match1.golsHome === match2.golsHome && match1.golsAway === match2.golsAway
}

function equalsItemStanding (standing1: ClubeClassification, standing2: ClubeClassification) {
  return standing1.points === standing2.points && standing1.clube.id === standing2.clube.id &&
  standing1.wins === standing2.wins && standing1.draw === standing2.draw &&
  standing1.matchs === standing2.matchs && standing1.goalsScored === standing2.goalsScored &&
  standing1.goalsConceded === standing2.goalsConceded
}

export { Atualization }
