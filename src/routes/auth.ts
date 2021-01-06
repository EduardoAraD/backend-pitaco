import { Router } from 'express'

import UsersController from '../controllers/UsersController'
import ChampionshipController from '../controllers/ChampionshipController'

const routes = Router()

routes.post('/signup', UsersController.signUp)
routes.post('/login', UsersController.signIn)
routes.post('/forgot-password', UsersController.forgotPassword)
routes.post('/reset-password', UsersController.resetPassword)

routes.get('/championship-atualization/:cod', ChampionshipController.AtualizationSportApi)
routes.get('/test', UsersController.test)

export default routes
