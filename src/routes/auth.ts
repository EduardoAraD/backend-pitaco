import { Router } from 'express'

import UsersController from '@controllers/UsersController'
import LeaguesController from '@controllers/LeaguesController'

const routes = Router()

routes.post('/signup', UsersController.signUp)
routes.post('/login', UsersController.signIn)
routes.post('/forgot-password', UsersController.forgotPassword)
routes.post('/reset-password', UsersController.resetPassword)

routes.get('/leagues', LeaguesController.index)
routes.get('/leagues/:id', LeaguesController.show)
routes.post('/league', LeaguesController.create)
routes.post('/league-dono', LeaguesController.showLeagueDono)
routes.delete('/leagues/:id', LeaguesController.delete)

export default routes
