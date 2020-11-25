import { Router } from 'express'

import UsersController from '@controllers/UsersController'

const routes = Router()

routes.post('/signup', UsersController.signUp)
routes.post('/login', UsersController.signIn)
routes.post('/forgot-password', UsersController.forgotPassword)
routes.post('/reset-password', UsersController.resetPassword)

export default routes
