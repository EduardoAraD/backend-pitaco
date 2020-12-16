import { getRepository } from 'typeorm'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

import { transport as mailer } from '../config/mailer'

import Users from '@models/Users'
import Leagues from '@models/Leagues'

import UsersView from '@views/users_view'
import ChampionshipController from './ChampionshipController'

const emailRegex = /\S+@\S+\.\S+/

interface DataRequestSignUp {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface DataRequestSignIn {
  email: string;
  password: string;
}

export default {
  async signUp (request: Request, response: Response) {
    try {
      const {
        name,
        email,
        password,
        confirmPassword
      } = request.body

      const data = {
        name,
        email,
        password,
        confirmPassword
      } as DataRequestSignUp

      // checando dados
      if (!data.email.match(emailRegex)) {
        return response.status(400).send({ error: 'O e-mail informado não é válido' })
      }

      const salt = bcrypt.genSaltSync()
      const passwordHash = bcrypt.hashSync(data.password, salt)

      if (!bcrypt.compareSync(data.confirmPassword, passwordHash)) {
        return response.status(400).send({ error: 'Senhas não conferem.' })
      }

      // checando email - DB
      const UsersRepository = getRepository(Users)

      const userExisting = await UsersRepository.findOne({ email: data.email })
      if (userExisting) {
        return response.status(400).send({ error: 'Email já existente.' })
      }

      // criadno o User no DB
      const LeagueRepository = getRepository(Leagues)
      let PitacoLeague = await LeagueRepository.findOne({ id: 1 })
      if (!PitacoLeague) {
        const championship = await ChampionshipController.currentChampionship()
        const PitacoLeagueData = {
          sistem: 1,
          name: 'Pitaco League',
          description: 'Todos contra todos, boa sorte Pitaqueiros. "Pitaco League"',
          trophy: '0',
          championship
        } as Leagues

        PitacoLeague = LeagueRepository.create(PitacoLeagueData)
        await LeagueRepository.save(PitacoLeague)
      }

      const pointsData = {
        points: 0,
        exactScore: 0,
        accept: 1,
        leagueId: PitacoLeague
      }

      const points = []
      points.push(pointsData)

      const userData = {
        name: data.name,
        email: data.email,
        avatar: 'https://images.assetsdelivery.com/compings_v2/get4net/get4net1901/get4net190113054.jpg',
        password: passwordHash,
        codeResetPassword: '',
        codeResetExpires: '',
        points: points
      }

      const user = UsersRepository.create(userData)

      await UsersRepository.save(user)

      const token = jwt.sign({ ...user }, process.env.AUTHSECRET as string, {
        expiresIn: '30 day'
      })

      const idChampionship = (await ChampionshipController.currentChampionship()).id

      return response.json(UsersView.render(token, user, idChampionship))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on create user, try again' })
    }
  },

  async signIn (request: Request, response: Response) {
    try {
      const {
        email,
        password
      } = request.body

      const data = { email, password } as DataRequestSignIn

      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email: data.email }, { relations: ['points', 'heartClub'] })

      if (user && bcrypt.compareSync(data.password, user.password)) {
        const token = jwt.sign({ ...user }, process.env.AUTHSECRET as string, {
          expiresIn: '1 day'
        })

        const idChampionship = (await ChampionshipController.currentChampionship()).id

        return response.json(UsersView.render(token, user, idChampionship))
      } else {
        return response.status(400).send({ error: 'Usuário/Senha inválidos' })
      }
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Sign In, try again' })
    }
  },

  async forgotPassword (request: Request, response: Response) {
    const { email } = request.body

    try {
      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email })
      if (!user) {
        return response.status(400).send({ error: 'User not found' })
      }

      const code = crypto.randomBytes(6).toString('hex')
      const now = new Date()
      now.setHours(now.getHours() + 2)

      await usersRepository.update(user.id, {
        codeResetPassword: code,
        codeResetExpires: now.toString()
      })

      mailer.sendMail({
        to: email,
        from: `PitacoApp <${process.env.EMAIL}>`,
        subject: 'Recuperação de Senha',
        html: `<div>
          <p>Você esqueceu sua senha?Pegue o código a baixo</p>
          <h2>${code}</h2>
          <p>E utilize para refazer sua senha.</p>
        </div>`
      }, (err) => {
        if (err) {
          return response.status(400).send({ error: 'Cannot send forgot password email' })
        }
      })

      return response.send()
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Erro on forget password, try again' })
    }
  },

  async resetPassword (request: Request, response: Response) {
    const { code, password, confirmPassword } = request.body

    try {
      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ codeResetPassword: code })
      if (!user) {
        return response.status(400).send({ error: 'User not found' })
      }

      const now = new Date()
      const codeExpires = new Date(user.codeResetExpires)
      if (now > codeExpires) {
        return response.status(400).send({ error: 'Code expires' })
      }

      const salt = bcrypt.genSaltSync()
      const passwordHash = bcrypt.hashSync(password, salt)

      if (!bcrypt.compareSync(confirmPassword, passwordHash)) {
        return response.status(400).send({ error: 'Passwords do not match' })
      }

      await usersRepository.update(user.id, {
        codeResetPassword: '',
        codeResetExpires: '',
        password: passwordHash
      })

      return response.send()
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Erro on reset password, try again' })
    }
  },

  async initUser (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email }

      const UsersRepository = getRepository(Users)
      const userDB = await UsersRepository.findOne({ email: data.email }, { relations: ['points', 'heartClub'] })
      if (!userDB) return response.status(400).send('User not found')

      const token = jwt.sign({ ...userDB }, process.env.AUTHSECRET as string, {
        expiresIn: '1 day'
      })
      const idChampionship = (await ChampionshipController.currentChampionship()).id

      return response.json(UsersView.render(token, userDB, idChampionship))
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Erro on init User, try again ' })
    }
  }
}
