import { Router } from 'express'

import LeaguesController from '../controllers/LeaguesController'
import PitacoController from '../controllers/PitacoController'
import ChampionshipController from '../controllers/ChampionshipController'
import UsersController from '../controllers/UsersController'
import FriendController from '../controllers/FriendController'

import auth from '../middlewares/auth'

const routes = Router()
routes.use(auth)

routes.post('/init-user', UsersController.initUser)
routes.post('/edit-user', UsersController.update)
routes.post('/choose-club', UsersController.chooseClub)

routes.post('/friend', FriendController.create)
routes.post('/friends', FriendController.getFriends)
routes.post('/not-friends', FriendController.getNotFriend)
routes.post('/not-friends-page', FriendController.getNotFriendPaginate)

routes.post('/leagues', LeaguesController.index)
routes.post('/leagues-page', LeaguesController.indexPage)
routes.get('/leagues/:id', LeaguesController.show)
routes.post('/leagues-points', LeaguesController.showPointsUser)
routes.post('/leagues-heartClub-points', LeaguesController.showPointsUserHeartClub)
routes.post('/leagues-points-last', LeaguesController.showPointsUserLastRodada)
routes.post('/leagues-heartClub-points-last', LeaguesController.showPointsUserHeartClubLastRodada)
routes.post('/league', LeaguesController.create)
routes.post('/league-dono', LeaguesController.showLeagueDono)
routes.post('/league-pitaco', LeaguesController.leaguePitaco)
routes.post('/league-heartClub', LeaguesController.leagueHeartClub)
routes.post('/league-guest', LeaguesController.leagueGuestUser)
routes.post('/league-user', LeaguesController.leagueOfUser)
routes.post('/league-delete/:id', LeaguesController.delete)
routes.get('/league-solicitation/:id', LeaguesController.solicitationLeague)
routes.post('/league-solicitation/:id', LeaguesController.createSolicitation)
routes.post('/result-solicitation', LeaguesController.resultSolicitation)
routes.post('/commom-leagues', LeaguesController.commonLeagues)

routes.get('/pitacos', PitacoController.index)
routes.post('/pitacos', PitacoController.createUpdate)
routes.post('/pitacos-rodada/user', PitacoController.showUserRodada)
routes.post('/pitacos-today/user', PitacoController.showUserMatchsDay)

routes.get('/championship/:id/tabela/', ChampionshipController.tabela)
routes.get('/championship/:id/rodadas', ChampionshipController.rodadas)
routes.get('/championship/:id/rodadas/:numRodada', ChampionshipController.matchsRodada)
routes.get('/championship/clubes', ChampionshipController.getClubes)

export default routes
