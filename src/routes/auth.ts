import { Router } from 'express'

import UsersController from '@controllers/UserController'

const routes = Router()

routes.post('/signup', UsersController.signUp)
routes.post('/login', UsersController.signIn)

export default routes
