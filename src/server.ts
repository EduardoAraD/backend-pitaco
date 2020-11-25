import express from 'express'

import routesAuth from './routes/auth'
import routesProtect from './routes/protect'
import './services/timeFunctionAtualization'

import './database/connection'

const app = express()

app.use(express.json())
app.use(routesAuth)
app.use(routesProtect)

app.listen(3333)
