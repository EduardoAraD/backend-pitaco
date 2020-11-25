import { Router } from 'express'

import LeaguesController from '@controllers/LeaguesController'
import PitacoController from '@controllers/PitacoController'
import ChampionshipController from '@controllers/ChampionshipController'

import auth from '../middlewares/auth'

const routes = Router()
routes.use(auth)

routes.get('/leagues', LeaguesController.index)
routes.get('/leagues/:id', LeaguesController.show)
routes.post('/league', LeaguesController.create)
routes.post('/league-dono', LeaguesController.showLeagueDono)
routes.delete('/leagues/:id', LeaguesController.delete)

routes.get('/pitacos', PitacoController.index)
routes.post('/pitacos', PitacoController.createUpdate)
routes.post('/pitacos-rodada/user', PitacoController.showUserRodada)

routes.get('/championship/:id/tabela/', ChampionshipController.tabela)
routes.get('/championship/:id/rodadas', ChampionshipController.rodadas)
routes.get('/championship/:id/rodadas/:numRodada', ChampionshipController.matchsRodada)
routes.get('/championship/:id/currentRodada', ChampionshipController.currentRodada)

export default routes
