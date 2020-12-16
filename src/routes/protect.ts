import { Router } from 'express'

import LeaguesController from '@controllers/LeaguesController'
import PitacoController from '@controllers/PitacoController'
import ChampionshipController from '@controllers/ChampionshipController'

import auth from '../middlewares/auth'
import UsersController from '@controllers/UsersController'

const routes = Router()
routes.use(auth)

routes.post('/init-user', UsersController.initUser)

routes.post('/leagues', LeaguesController.index)
routes.get('/leagues/:id', LeaguesController.show)
routes.post('/league', LeaguesController.create)
routes.post('/league-dono', LeaguesController.showLeagueDono)
routes.post('/league-solicitation/:id', LeaguesController.solicitationLeague)
routes.post('/league-pitaco', LeaguesController.leaguePitaco)
routes.post('/league-heartClub', LeaguesController.leagueHeartClub)
routes.post('/league-guest', LeaguesController.leagueGuestUser)
routes.delete('/leagues/:id', LeaguesController.delete)

routes.get('/pitacos', PitacoController.index)
routes.post('/pitacos', PitacoController.createUpdate)
routes.post('/pitacos-rodada/user', PitacoController.showUserRodada)
routes.post('/pitacos-today/user', PitacoController.showUserMatchsDay)

routes.get('/championship/:id/tabela/', ChampionshipController.tabela)
routes.get('/championship/:id/rodadas', ChampionshipController.rodadas)
routes.get('/championship/:id/rodadas/:numRodada', ChampionshipController.matchsRodada)
routes.get('/championship/:id/currentRodada', ChampionshipController.currentRodada)

export default routes
