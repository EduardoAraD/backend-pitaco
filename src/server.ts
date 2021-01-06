import 'dotenv/config'

import express from 'express'
import cors from 'cors'

import routesAuth from './routes/auth'
import routesProtect from './routes/protect'
import './services/timeFunctionAtualization'

import './database/connection'

const app = express()

app.use(cors())
app.use(express.json())
app.use(routesAuth)
app.use(routesProtect)

app.listen(process.env.PORT || 3333)
