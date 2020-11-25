import { getRepository } from 'typeorm'
import { Request, Response } from 'express'

import api from '../services/api'

import Championship from '@models/Championship'
import ClubeClassification from '@models/ClubeClassification'
import Clube from '@models/Clube'
import Rodada from '@models/Rodada'
import Match from '@models/Match'

import PitacoController from './PitacoController'

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

    const dateStartChampionship = new Date(`${paramsChampionship.startDate} 12:00:00`)
    const dataResultChampionship = {
      name: `${myLeagueFilter.name} ${paramsChampionship.name}`,
      startDate: dateStartChampionship.toLocaleDateString(),
      endDate: (new Date(`${paramsChampionship.endDate} 12:00:00`)).toLocaleDateString(),
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
        points: parseInt(standing[j].points),
        clube: clubesSaves.find(clube => clube.clubeIdApi === parseInt(standing[j].team_id)),
        wins: parseInt(standing[j].overall.won),
        draw: parseInt(standing[j].overall.draw),
        matchs: parseInt(standing[j].overall.games_played),
        goalsScored: parseInt(standing[j].overall.goals_scored),
        goalsConceded: parseInt(standing[j].overall.goals_against),
        utilization: parseInt((utilization * 100).toFixed(2))
      } as ClubeClassification

      standingChampionship.push(itemStanding)
    }

    const currentDate = new Date()
    let currentRodada = 0
    let menorDiffTime = currentDate.getTime()

    const matches: DataRodadaMatch[] = []
    const resultMatchs = await fetchData('/soccer/matches',
      `season_id=${dataResultChampionship.seasonId}&date_from=${dateStartChampionship.getFullYear()}-${dateStartChampionship.getMonth() + 1}-${dateStartChampionship.getDate()}`)
    for (let k = 0; k < resultMatchs.length; k++) {
      const itemResultMatch = resultMatchs[k]

      const date = new Date(itemResultMatch.match_start)
      date.setHours(date.getHours() - 3)
      const finishHt = itemResultMatch.stats.ht_score
      const finishFt = itemResultMatch.stats.ft_score

      const dataMatch = {
        status: itemResultMatch.status,
        stadium: itemResultMatch.venue.name,
        date: date.toLocaleDateString(),
        hour: date.toLocaleTimeString(),
        matchIdApi: parseInt(itemResultMatch.match_id),
        golsHome: parseInt(itemResultMatch.stats.home_score),
        golsAway: parseInt(itemResultMatch.stats.away_score),
        finishPitaco: (finishHt !== null && finishFt !== null) ? 1 : 0,
        clubeHome: clubesSaves.find(clube => clube.clubeIdApi === parseInt(itemResultMatch.home_team.team_id)),
        clubeAway: clubesSaves.find(clube => clube.clubeIdApi === parseInt(itemResultMatch.away_team.team_id))
      } as Match

      const dataRodadaMatch = {
        numRodada: parseInt(itemResultMatch.round.name),
        match: dataMatch
      } as DataRodadaMatch

      if (!dataMatch.finishPitaco) {
        const diffTimeDate = Math.abs(currentDate.getTime() - date.getTime())
        if (menorDiffTime > diffTimeDate) {
          menorDiffTime = diffTimeDate
          currentRodada = dataRodadaMatch.numRodada
        }
      }

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
        prevRodada: dataRodada.number - 1,
        proxRodada: dataRodada.number + 1,
        matchs: matchsFilter
      } as Rodada

      rodadasChampionship.push(rodadaChamspionship)
    }

    const dataChampionship = {
      name: dataResultChampionship.name,
      startDate: dataResultChampionship.startDate,
      endDate: dataResultChampionship.endDate,
      currentRodada: currentRodada,
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
    const data = new Date()
    if (data.getHours() === 2 && data.getHours() <= 30) {
      await atualizationMatchChampionship(championshipDB)
      return response.send()
    }

    const matchsLive = await fetchData('/soccer/matches',
      `season_id=${championshipDB.seasonId}&date_from=${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate() - 1}&date_to=${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate() + 1}`)
    if (matchsLive.length === 0) {
      return response.json({ message: 'Not matches' })
    }

    const MatchRepository = getRepository(Match)
    const RodadaRepository = getRepository(Rodada)
    const ClubeRepository = getRepository(Clube)

    let updateStandings = false

    for (let i = 0; i < matchsLive.length; i++) {
      console.log(`passou pelo i com valor: ${i}`)
      const itemResultMatch = matchsLive[i]
      const clubeHomeDB = await ClubeRepository.findOne({ clubeIdApi: parseInt(itemResultMatch.home_team.team_id) })
      const clubeAwayDB = await ClubeRepository.findOne({ clubeIdApi: parseInt(itemResultMatch.away_team.team_id) })
      const rodadaDB = await RodadaRepository.findOne({ number: parseInt(itemResultMatch.round.name) })

      const date = new Date(itemResultMatch.match_start)
      date.setHours(date.getHours() - 3)
      const finishHt = itemResultMatch.stats.ht_score
      const finishFt = itemResultMatch.stats.ft_score

      const dataMatch = {
        status: itemResultMatch.status,
        stadium: itemResultMatch.venue.name,
        date: date.toLocaleDateString(),
        hour: date.toLocaleTimeString(),
        matchIdApi: parseInt(itemResultMatch.match_id),
        golsHome: parseInt(itemResultMatch.stats.home_score),
        golsAway: parseInt(itemResultMatch.stats.away_score),
        finishPitaco: (finishHt !== null && finishFt !== null) ? 1 : 0,
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
            golsHome: dataMatch.golsHome,
            golsAway: dataMatch.golsAway,
            finishPitaco: dataMatch.finishPitaco
          })
          updateStandings = true
          if (dataMatch.finishPitaco === 1 && dataMatch.finishPitaco !== matchDB.finishPitaco) {
            console.log('alterando Pontos do Pitaco')
            await PitacoController.resultPitaco(matchDB, dataMatch.golsHome, dataMatch.golsAway)
          }
        }
      }
    }

    if (updateStandings) {
      console.log('passou aqui tbm em standings')
      const StandingsRepository = getRepository(ClubeClassification)
      const standingsDB = await StandingsRepository.find({ relations: ['clube', 'championshipId'] })
      const standingsChamspionshipDB = standingsDB.filter(item => item.championshipId.id === championshipDB.id)

      const resultStandings = await fetchData('/soccer/standings',
    `season_id=${dataResultChampionship.seasonId}`)

      const standing = resultStandings.standings

      for (let j = 0; j < standing.length; j++) {
        console.log(`entrou no for com j valendo ${j}`)
        const utilization = (parseInt(standing[j].overall.won) * 3 + parseInt(standing[j].overall.draw)) /
          (parseInt(standing[j].overall.games_played) * 3)
        const clubeDB = await ClubeRepository.findOne({ clubeIdApi: parseInt(standing[j].team_id) })
        const itemStanding = {
          points: parseInt(standing[j].points),
          clube: clubeDB,
          wins: parseInt(standing[j].overall.won),
          draw: parseInt(standing[j].overall.draw),
          matchs: parseInt(standing[j].overall.games_played),
          goalsScored: parseInt(standing[j].overall.goals_scored),
          goalsConceded: parseInt(standing[j].overall.goals_against),
          utilization: parseInt((utilization * 100).toFixed(2))
        } as ClubeClassification

        const itemStandingDB = standingsChamspionshipDB.find(item => item.clube.id === itemStanding.clube.id)
        if (!equalsItemStanding(itemStanding, itemStandingDB)) {
          await StandingsRepository.update(itemStandingDB.id, {
            points: itemStanding.points,
            wins: itemStanding.wins,
            draw: itemStanding.draw,
            matchs: itemStanding.matchs,
            goalsScored: itemStanding.goalsScored,
            goalsConceded: itemStanding.goalsConceded,
            utilization: itemStanding.utilization
          })
          console.log(`atualizou o clube: ${itemStanding.clube.name}, seus pontos são: ${itemStanding.points}`)
        }
      }
    }

    return response.json(matchsLive)
  } catch (err) {
    console.log(err)
    return response.status(400).json({ error: 'Error not found, try again' })
  }
}

async function atualizationMatchChampionship (championship: Championship) {
  const currentDate = new Date()
  let currentRodada = 0
  let menorDiffTime = currentDate.getTime()

  const MatchRepository = getRepository(Match)
  const matchsDB = (await MatchRepository.find({ relations: ['clubeHome', 'clubeAway', 'rodadaId'] }))
    .filter(match => !match.finishPitaco)

  const ClubeRepository = getRepository(Clube)
  const clubesDB = await ClubeRepository.find()

  const RodadaRepository = getRepository(Rodada)

  const resultMatchs = await fetchData('/soccer/matches',
      `season_id=${championship.seasonId}&date_from=${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`)

  for (let i = 0; i < resultMatchs.length; i++) {
    const itemResultMatch = resultMatchs[i]

    const date = new Date(itemResultMatch.match_start)
    date.setHours(date.getHours() - 3)
    const finishHt = itemResultMatch.stats.ht_score
    const finishFt = itemResultMatch.stats.ft_score

    const dataMatch = {
      status: itemResultMatch.status,
      stadium: itemResultMatch.venue.name,
      date: date.toLocaleDateString(),
      hour: date.toLocaleTimeString(),
      matchIdApi: parseInt(itemResultMatch.match_id),
      golsHome: parseInt(itemResultMatch.stats.home_score),
      golsAway: parseInt(itemResultMatch.stats.away_score),
      finishPitaco: (finishHt !== null && finishFt !== null) ? 1 : 0,
      clubeHome: clubesDB.find(clube => clube.clubeIdApi === parseInt(itemResultMatch.home_team.team_id)),
      clubeAway: clubesDB.find(clube => clube.clubeIdApi === parseInt(itemResultMatch.away_team.team_id))
    } as Match
    const rodadaMatch = parseInt(itemResultMatch.round.name)

    const matchFilter = matchsDB.find(match => (match.rodadaId.id === rodadaMatch &&
      match.clubeHome.id === dataMatch.clubeHome.id &&
      match.clubeAway.id === dataMatch.clubeAway.id))

    if (!matchFilter) {
      const rodada = await RodadaRepository.findOne({ number: rodadaMatch, championshipId: championship })
      dataMatch.rodadaId = rodada
      const matchCreate = MatchRepository.create(dataMatch)
      await MatchRepository.save(matchCreate)
    } else {
      if (!equalsMatch(matchFilter, dataMatch)) {
        await MatchRepository.update(matchFilter.id, {
          status: dataMatch.status,
          stadium: dataMatch.stadium,
          date: dataMatch.date,
          hour: dataMatch.hour,
          golsHome: dataMatch.golsHome,
          golsAway: dataMatch.golsAway,
          finishPitaco: dataMatch.finishPitaco
        })
        if (dataMatch.finishPitaco === 1 && dataMatch.finishPitaco !== matchFilter.finishPitaco) {
          console.log('alterando Pontos do Pitaco')
          await PitacoController.resultPitaco(matchFilter, dataMatch.golsHome, dataMatch.golsAway)
        }
      }
    }

    if (!dataMatch.finishPitaco) {
      const diffTimeDate = Math.abs(currentDate.getTime() - date.getTime())
      if (menorDiffTime > diffTimeDate) {
        menorDiffTime = diffTimeDate
        currentRodada = rodadaMatch
      }
    }
  }

  if (currentRodada !== 0 && currentRodada !== championship.currentRodada) {
    const ChampionshipRepository = getRepository(Championship)
    await ChampionshipRepository.update(championship.id, {
      currentRodada
    })
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
    match1.golsHome === match2.golsHome && match1.golsAway === match2.golsAway &&
    match1.finishPitaco === match2.finishPitaco
}

function equalsItemStanding (standing1: ClubeClassification, standing2: ClubeClassification): boolean {
  return standing1.points === standing2.points && standing1.wins === standing2.wins &&
    standing1.draw === standing2.draw && standing1.matchs === standing2.matchs &&
    standing1.goalsScored === standing2.goalsScored && standing1.goalsConceded === standing2.goalsConceded
}

export { Atualization }
