import express from 'express'
import routesAuth from './routes/auth'
import './services/timeFunctionAtualization'

import './database/connection'

const app = express()

app.use(express.json())
app.use(routesAuth)

app.listen(3333)
