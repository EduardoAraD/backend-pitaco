import { getRepository } from 'typeorm'
import Axios from 'axios'

import api from '../services/api'

import Championship from '../models/Championship'
import Standing from '../models/Standing'
import Clube from '../models/Clube'
import Rodada from '../models/Rodada'
import Match from '../models/Match'
import IdApiClube from '../models/IdApiClube'

import { stringForDate } from '../functions'

import PitacoController from './PitacoController'
import ConquestController from './ConquestController'

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

interface ClubeAPI {
  name: string,
  // eslint-disable-next-line camelcase
  short_code: string,
  logo: string,
  // eslint-disable-next-line camelcase
  team_id: string
}

interface StandingAPI {
  // eslint-disable-next-line camelcase
  team_id: string,
  points: string,
  status: string,
  result: string,
  overall: {
    won: string,
    draw: string,
    // eslint-disable-next-line camelcase
    games_played: string,
    // eslint-disable-next-line camelcase
    goals_scored: string,
    // eslint-disable-next-line camelcase
    goals_against: string
  }
}

interface MatchAPI {
  // eslint-disable-next-line camelcase
  match_id: number,
  status: string,
  // eslint-disable-next-line camelcase
  match_start: string,
  // eslint-disable-next-line camelcase
  home_team: ClubeAPI,
  // eslint-disable-next-line camelcase
  away_team: ClubeAPI,
  round: {
    name: string
  },
  stats: {
    // eslint-disable-next-line camelcase
    home_score: number,
    // eslint-disable-next-line camelcase
    away_score: number,
    // eslint-disable-next-line camelcase
    ht_score: string,
    // eslint-disable-next-line camelcase
    ft_score: string
  },
  venue: {
    name: string
  }
}

interface RodadaAPI {
  // eslint-disable-next-line camelcase
  round_id: number,
  name: string
}

const fetchData = async (url: string, params?: string) => {
  const result = await api.get(`${url}?apikey=${process.env.KEY_API}${params ? `&${params}` : ''}`)
  return result.data.data
}

async function checkUrlLogo (url: string): Promise<boolean> {
  return await Axios.get(url).then(() => true).catch(() => false)
}

async function initAll (paramsChampionship: DataRequestChampionship) {
  try {
    const resultMyLeagues = await fetchData('/soccer/leagues', 'subscribed=true')
    const myLeagueFilter = resultMyLeagues.find(item => item.league_id === 693)

    const dateStartChampionship = new Date(`${paramsChampionship.startDate} 12:00:00`)
    const dataResultChampionship = {
      name: `${myLeagueFilter.name} ${paramsChampionship.name}`,
      startDate: DateForStringDay(dateStartChampionship),
      endDate: DateForStringDay((new Date(`${paramsChampionship.endDate} 12:00:00`))),
      seasonId: paramsChampionship.seasonId
    } as DataRequestChampionship

    const resultClubes = await fetchData('/soccer/teams', `country_id=${myLeagueFilter.country_id}`)
    const idApiClubesSaves = await createClube(resultClubes)

    const resultStandings = await fetchData('/soccer/standings',
      `season_id=${dataResultChampionship.seasonId}`)

    const standing = resultStandings.standings
    const standingChampionship = await createClubeStandings(standing, idApiClubesSaves)

    const resultMatchs = await fetchData('/soccer/matches',
      `season_id=${dataResultChampionship.seasonId}&date_from=${dateStartChampionship.getFullYear()}-${dateStartChampionship.getMonth() + 1}-${dateStartChampionship.getDate()}`)

    const { matches, currentRodada } = await createRodadaMatchs(resultMatchs, idApiClubesSaves)

    const resultRodada = await fetchData('/soccer/rounds', `season_id=${dataResultChampionship.seasonId}`)
    const rodadasChampionship = createRodada(resultRodada, matches)

    const dataChampionship = {
      name: dataResultChampionship.name,
      startDate: dataResultChampionship.startDate,
      endDate: dataResultChampionship.endDate,
      currentRodada: currentRodada,
      seasonId: dataResultChampionship.seasonId,
      standings: standingChampionship,
      rodadas: rodadasChampionship,
      finishConquest: 0
    } as Championship

    const ChampionshipRepository = getRepository(Championship)
    const championshipCreate = ChampionshipRepository.create(dataChampionship)
    await ChampionshipRepository.save(championshipCreate)
  } catch (err) {
    console.log(err)
  }
}

async function Atualization () {
  try {
    const resultChampionship = await fetchData('/soccer/seasons', 'league_id=693')
    const championshipFilter = resultChampionship[resultChampionship.length - 1]

    const dataResultChampionship = {
      name: championshipFilter.name,
      startDate: championshipFilter.start_date,
      endDate: championshipFilter.end_date,
      seasonId: parseInt(championshipFilter.season_id)
    } as DataRequestChampionship

    const ChampionshipRepository = getRepository(Championship)
    const championshipDB = await ChampionshipRepository.findOne({ seasonId: dataResultChampionship.seasonId })
    if (!championshipDB) {
      return await initAll(dataResultChampionship)
    }

    const dateEnd = new Date(`${dataResultChampionship.endDate} 12:00:00`)
    const endDateString = DateForStringDay(dateEnd)
    if (endDateString !== championshipDB.endDate) {
      ChampionshipRepository.update(championshipDB.id, { endDate: endDateString })
      championshipDB.endDate = endDateString
    }

    const data = new Date()
    data.setHours(data.getHours() - 3)
    dateEnd.setDate(dateEnd.getDate() + 3)
    if (data.getTime() >= dateEnd.getTime()) {
      ConquestController.createConquests(championshipDB)
    }

    const matchsLive = await fetchData('/soccer/matches',
      `season_id=${championshipDB.seasonId}&date_from=${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate() - 1}&date_to=${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate() + 2}`)
    if (matchsLive.length === 0) {
      return
    }

    const IdApiClubeRepository = getRepository(IdApiClube)
    const idApiClubesDB = await IdApiClubeRepository.find({ relations: ['clube'] })
    const { matches } = await createRodadaMatchs(matchsLive, idApiClubesDB)

    let currentRodada = 0
    let menorDiffTime = data.getTime()

    const MatchRepository = getRepository(Match)
    const RodadaRepository = getRepository(Rodada)

    for (let i = 0; i < matches.length; i++) {
      const dataMatch = matches[i].match
      const rodadaDB = await RodadaRepository.findOne({ championshipId: championshipDB, number: matches[i].numRodada })
      const matchDB = await MatchRepository.findOne({
        clubeAway: dataMatch.clubeAway,
        clubeHome: dataMatch.clubeHome,
        rodadaId: rodadaDB
      })
      if (!matchDB) {
        dataMatch.rodadaId = rodadaDB
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
            golsAway: dataMatch.golsAway
          })
          if (dataMatch.status !== 'notstarted') {
            await PitacoController.resultPitaco(matchDB, dataMatch.golsHome, dataMatch.golsAway)
          }
        }
      }

      if (dataMatch.status !== 'finished') {
        const dateMatch = stringForDate(dataMatch.date, dataMatch.hour)
        const diffTimeDate = Math.abs(data.getTime() - dateMatch.getTime())
        if (menorDiffTime > diffTimeDate) {
          menorDiffTime = diffTimeDate
          currentRodada = matches[i].numRodada
        }
      }
    }

    if (currentRodada !== 0 && currentRodada !== championshipDB.currentRodada) {
      const ChampionshipRepository = getRepository(Championship)
      await ChampionshipRepository.update(championshipDB.id, {
        currentRodada
      })
    }

    const StandingsRepository = getRepository(Standing)
    const standingsDB = await StandingsRepository.find({ relations: ['clube', 'championshipId'] })
    const standingsChamspionshipDB = standingsDB.filter(item => item.championshipId.id === championshipDB.id)

    const resultStandings = await fetchData('/soccer/standings', `season_id=${dataResultChampionship.seasonId}`)

    const standing = await createClubeStandings(resultStandings.standings, idApiClubesDB)

    for (let i = 0; i < standing.length; i++) {
      const itemStanding = standing[i]

      const itemStandingDB = standingsChamspionshipDB.find(item => item.clube.id === itemStanding.clube.id)
      if (itemStandingDB) {
        if (!equalsItemStanding(itemStanding, itemStandingDB)) {
          await StandingsRepository.update(itemStandingDB.id, {
            points: itemStanding.points,
            wins: itemStanding.wins,
            draw: itemStanding.draw,
            matchs: itemStanding.matchs,
            goalsScored: itemStanding.goalsScored,
            goalsConceded: itemStanding.goalsConceded,
            utilization: itemStanding.utilization,
            status: itemStanding.status
          })
        }
      }
    }
  } catch (err) {
    console.log(err)
  }
}

function createRodada (resultRodada: RodadaAPI[], matches: DataRodadaMatch[]): Rodada[] {
  const rodadasChampionship: Rodada[] = []

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

  return rodadasChampionship
}

async function createRodadaMatchs (matchsAPI: MatchAPI[], idApiClubesDB: IdApiClube[]):
  Promise<{ matches: DataRodadaMatch[], currentRodada: number }> {
  const matchsRodadaSaves: DataRodadaMatch[] = []

  const currentDate = new Date()
  currentDate.setHours(currentDate.getHours() - 3)
  let currentRodada = 0
  let menorDiffTime = currentDate.getTime()

  for (let i = 0; i < matchsAPI.length; i++) {
    const itemResultMatch = matchsAPI[i]

    const date = new Date(itemResultMatch.match_start)
    date.setHours(date.getHours() - 3)

    const dataMatch = {
      status: defineStatusMatch(itemResultMatch.status, itemResultMatch.stats.ht_score, itemResultMatch.stats.ft_score, date),
      stadium: itemResultMatch.venue.name,
      date: DateForStringDay(date),
      hour: date.toLocaleTimeString(),
      matchIdApi: itemResultMatch.match_id,
      golsHome: itemResultMatch.stats.home_score,
      golsAway: itemResultMatch.stats.away_score,
      clubeHome: await getClube(parseInt(itemResultMatch.home_team.team_id, 10),
        itemResultMatch.home_team.name, itemResultMatch.home_team.short_code,
        itemResultMatch.home_team.logo, idApiClubesDB),
      clubeAway: await getClube(parseInt(itemResultMatch.away_team.team_id, 10),
        itemResultMatch.away_team.name, itemResultMatch.away_team.short_code,
        itemResultMatch.away_team.logo, idApiClubesDB)
    } as Match

    const dataRodadaMatch = {
      numRodada: parseInt(itemResultMatch.round.name),
      match: dataMatch
    } as DataRodadaMatch

    if (dataMatch.status !== 'finished') {
      const diffTimeDate = Math.abs(currentDate.getTime() - date.getTime())
      if (menorDiffTime > diffTimeDate) {
        menorDiffTime = diffTimeDate
        currentRodada = dataRodadaMatch.numRodada
      }
    }

    matchsRodadaSaves.push(dataRodadaMatch)
  }

  return { matches: matchsRodadaSaves, currentRodada }
}

async function getClube (idApi: number, name: string, shortCode: string, logo: string, idApiClubes: IdApiClube[]): Promise<Clube> {
  const idApiClube = idApiClubes.find(item => item.idApi === idApi)
  if (!idApiClube) {
    const IdApiClubeRepository = getRepository(IdApiClube)
    const idApiClubeName = idApiClubes.find(item => item.clube.nameComplete.toLowerCase() === name.toLowerCase())
    if (!idApiClubeName) {
      const nameResume = name.slice(-3).slice(0, 1) === ' ' ? name.slice(0, -3) : name
      const dataClube = {
        name: nameResume,
        nameComplete: name,
        shortCode,
        logo
      } as Clube

      const ClubeRepository = getRepository(Clube)
      const clubeCreate = ClubeRepository.create(dataClube)
      const clubeSave = await ClubeRepository.save(clubeCreate)

      const dataIdApiClube = {
        idApi: idApi,
        clube: clubeSave
      } as IdApiClube

      const idApiClubeCreate = IdApiClubeRepository.create(dataIdApiClube)
      const idApiClubeSave = await IdApiClubeRepository.save(idApiClubeCreate)

      idApiClubes.push(idApiClubeSave)

      return clubeSave
    } else {
      const dataIdApiClube = {
        idApi: idApi,
        clube: idApiClubeName.clube
      } as IdApiClube

      const idApiClubeCreate = IdApiClubeRepository.create(dataIdApiClube)
      const idApiClubeSave = await IdApiClubeRepository.save(idApiClubeCreate)

      idApiClubes.push(idApiClubeSave)

      return idApiClubeName.clube
    }
  }
  return idApiClube.clube
}

function defineStatusMatch (status: string, htScore: string, ftScore: string, date: Date) {
  if (status === 'finished') {
    if (htScore === null || ftScore === null) return 'progress'
    else {
      const currentDate = new Date()
      currentDate.setHours(currentDate.getHours() - 3)
      date.setHours(date.getHours() + 2)
      if (currentDate.getTime() <= date.getTime()) return 'progress'
      else return 'finished'
    }
  } else if (status === 'inplay') return 'progress'
  return 'notstarted'
}

async function createClubeStandings (standing: StandingAPI[], idApiClubesDB: IdApiClube[]): Promise<Standing[]> {
  const standingSaves: Standing[] = []

  for (let i = 0; i < standing.length; i++) {
    const utilization = (parseInt(standing[i].overall.won) * 3 + parseInt(standing[i].overall.draw)) /
      (parseInt(standing[i].overall.games_played) * 3)
    const clubeDB = await getClubStanding(parseInt(standing[i].team_id, 10), idApiClubesDB)
    if (clubeDB) {
      const itemStanding = {
        points: parseInt(standing[i].points),
        clube: clubeDB,
        wins: parseInt(standing[i].overall.won),
        draw: parseInt(standing[i].overall.draw),
        matchs: parseInt(standing[i].overall.games_played),
        goalsScored: parseInt(standing[i].overall.goals_scored),
        goalsConceded: parseInt(standing[i].overall.goals_against),
        utilization: parseInt((utilization * 100).toFixed(1)),
        status: defineStatusItemStanding(standing[i].status, standing[i].result)
      } as Standing

      standingSaves.push(itemStanding)
    }
  }

  return filterStandings(standingSaves)
}

function filterStandings (standing: Standing[]): Standing[] {
  const standingFilter: Standing[] = []
  for (let i = 0; i < standing.length; i++) {
    const itemStanding = standingFilter.find(item => item.clube.id === standing[i].clube.id)
    if (!itemStanding) standingFilter.push(standing[i])
    else {
      if (itemStanding.matchs < standing[i].matchs) {
        const index = standingFilter.indexOf(itemStanding)
        standingFilter.splice(index, 1)
        standingFilter.push(standing[i])
      }
    }
  }
  return standingFilter
}

async function getClubStanding (idApi: number, idApiClubes: IdApiClube[]): Promise<Clube> {
  const idApiClube = idApiClubes.find(item => item.idApi === idApi)
  if (!idApiClube) {
    const clubeResult:ClubeAPI = await fetchData(`soccer/teams/${idApi}`)
    const checkedLogo = await checkUrlLogo(clubeResult.logo)
    if (checkedLogo) { return getClube(idApi, clubeResult.name, clubeResult.short_code, clubeResult.logo, idApiClubes) }
    return null
  }
  return idApiClube.clube
}

function defineStatusItemStanding (status: string, result: string) {
  if (status === 'Promotion') {
    if (result === 'Copa Libertadores') return 'L'
    else if (result === 'Copa Libertadores Qualification') return 'LQ'
    else if (result === 'Copa Sudamericana') return 'S'
  } else {
    if (status === 'Same') return 'N'
    else if (status === 'Relegation') return 'R'
  }
  return ''
}

async function createClube (resultClubes: ClubeAPI[]): Promise<IdApiClube[]> {
  const idApiClubesSaves: IdApiClube[] = []
  const clubesSaves: Clube[] = []
  const IdApiClubeRepository = getRepository(IdApiClube)
  const IdApiClubesDB = await IdApiClubeRepository.find({ relations: ['clube'] })
  const ClubeRepository = getRepository(Clube)
  const clubesDB = await ClubeRepository.find()

  for (let i = 0; i < resultClubes.length; i++) {
    if (!resultClubes[i].name.includes('(W)') && !resultClubes[i].name.includes('U20') &&
      !resultClubes[i].name.includes('U23')) {
      const name = resultClubes[i].name.slice(-3).slice(0, 1) === ' ' ? resultClubes[i].name.slice(0, -3) : resultClubes[i].name
      const idApiClube = parseInt(resultClubes[i].team_id)
      const dataClube = {
        name,
        nameComplete: resultClubes[i].name,
        shortCode: resultClubes[i].short_code,
        logo: resultClubes[i].logo
      } as Clube

      const idApiClubeDB = IdApiClubesDB.find(itemIdApi => itemIdApi.idApi === idApiClube)
      if (!idApiClubeDB) {
        const clubeDB = clubesDB.find(itemClube =>
          itemClube.nameComplete.toLowerCase() === dataClube.nameComplete.toLowerCase() &&
          itemClube.shortCode === dataClube.shortCode)
        if (!clubeDB) {
          const clubeExist = clubesSaves.find(itemClube =>
            itemClube.nameComplete.toLowerCase() === dataClube.nameComplete.toLowerCase() &&
            itemClube.shortCode === dataClube.shortCode)
          if (!clubeExist) {
            const checkedLogo = await checkUrlLogo(dataClube.logo)
            if (checkedLogo) {
              const clubeCreate = ClubeRepository.create(dataClube)
              const clubeSave = await ClubeRepository.save(clubeCreate)

              const dataIdApiClube = {
                idApi: idApiClube,
                clube: clubeSave
              } as IdApiClube
              const idApiClubeCreate = IdApiClubeRepository.create(dataIdApiClube)
              const idApiClubeSave = await IdApiClubeRepository.save(idApiClubeCreate)

              clubesSaves.push(clubeSave)
              idApiClubesSaves.push(idApiClubeSave)
            }
          } else {
            const dataIdApiClube = {
              idApi: idApiClube,
              clube: clubeExist
            } as IdApiClube

            const idApiClubeCreate = IdApiClubeRepository.create(dataIdApiClube)
            const idApiClubeSave = await IdApiClubeRepository.save(idApiClubeCreate)

            idApiClubesSaves.push(idApiClubeSave)
          }
        } else {
          const dataIdApiClube = {
            idApi: idApiClube,
            clube: clubeDB
          } as IdApiClube

          const idApiClubeCreate = IdApiClubeRepository.create(dataIdApiClube)
          const idApiClubeSave = await IdApiClubeRepository.save(idApiClubeCreate)

          idApiClubesSaves.push(idApiClubeSave)
        }
      } else {
        idApiClubesSaves.push(idApiClubeDB)
      }
    }
  }

  return idApiClubesSaves
}

function filterMatchRodada (matchs: DataRodadaMatch[]): Match[] {
  const matchsFilter: Match[] = []
  let i = 0
  while (matchsFilter.length < 10) {
    if (i >= matchs.length) {
      return matchsFilter
    }
    const itemInit = matchs[i].match
    if (matchsFilter.filter(item => (item.clubeHome.id === itemInit.id &&
      item.clubeAway.id === itemInit.clubeAway.id)).length <= 0) {
      const matchItemFilter = matchs.filter(item =>
        (item.match.clubeHome.id === itemInit.clubeHome.id &&
        item.match.clubeAway.id === itemInit.clubeAway.id))

      if (matchItemFilter.length > 1) {
        const matchsFilterFinished = matchItemFilter.filter(item => item.match.status === 'finished')
        if (matchsFilterFinished.length !== 0) {
          const index = matchsFilterFinished.length - 1
          matchsFilter.push(matchsFilterFinished[index].match)
        } else {
          const index = matchItemFilter.length - 1
          matchsFilter.push(matchItemFilter[index].match)
        }
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
    match1.date === match2.date && match1.hour === match2.hour &&
    match1.golsHome === match2.golsHome && match1.golsAway === match2.golsAway
}

function equalsItemStanding (standing1: Standing, standing2: Standing): boolean {
  return standing1.points === standing2.points && standing1.wins === standing2.wins &&
    standing1.draw === standing2.draw && standing1.matchs === standing2.matchs &&
    standing1.goalsScored === standing2.goalsScored && standing1.goalsConceded === standing2.goalsConceded &&
    standing1.status === standing2.status
}

function DateForStringDay (data: Date) {
  return `${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()}`
}

export { Atualization }
