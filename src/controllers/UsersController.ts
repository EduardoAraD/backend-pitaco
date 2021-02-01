import { getRepository } from 'typeorm'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

import { emailValidade, nickNameValidade } from '../middlewares/validad'

import Users from '../models/Users'
import Leagues from '../models/Leagues'
import Clube from '../models/Clube'

import UsersView from '../views/users_view'

import { checkUrlLogo, MessageError } from '../functions'

import ChampionshipController from './ChampionshipController'

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

      const data: DataRequestSignUp = {
        name: name || '',
        email: email || '',
        password: password || '',
        confirmPassword: confirmPassword || ''
      }

      const championshipCurrent = await ChampionshipController.currentChampionship()
      if (!championshipCurrent) {
        return response.status(400).send({ error: MessageError.ATUALIZATION })
      }

      let error = nickNameValidade(data.name)
      if (error !== '') return response.status(400).send({ error })

      error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      if (data.password.length <= 7) {
        return response.status(400).send({ error: MessageError.PASSWORDMINCARACTER })
      }

      const salt = bcrypt.genSaltSync()
      const passwordHash = bcrypt.hashSync(data.password, salt)

      if (!bcrypt.compareSync(data.confirmPassword, passwordHash)) {
        return response.status(400).send({ error: MessageError.PASSWORDNOTCONFER })
      }

      // checando email - DB
      const UsersRepository = getRepository(Users)

      const userExistingName = await UsersRepository.findOne({ name: data.name })
      if (userExistingName) {
        return response.status(400).send({ error: MessageError.NICKNAMEEXISTING })
      }

      const userExistingEmail = await UsersRepository.findOne({ email: data.email })
      if (userExistingEmail) {
        return response.status(400).send({ error: MessageError.EMAILEXISTING })
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
        points: points,
        conquests: []
      }

      const user = UsersRepository.create(userData)

      await UsersRepository.save(user)

      const token = jwt.sign({ ...user }, process.env.AUTHSECRET as string, {
        expiresIn: '7 day'
      })

      return response.json(UsersView.render(token, user, championshipCurrent.id, championshipCurrent.currentRodada))
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on create user, try again.' })
    }
  },

  async signIn (request: Request, response: Response) {
    try {
      const {
        email,
        password
      } = request.body

      const championshipCurrent = await ChampionshipController.currentChampionship()
      if (!championshipCurrent) {
        return response.status(400).send({ error: MessageError.ATUALIZATION })
      }

      const data = { email: email || '', password: password || '' } as DataRequestSignIn

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })
      if (data.password === '') return response.status(400).send({ error: MessageError.PASSWORDNOTINFORMED })

      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email: data.email }, { relations: ['points', 'heartClub', 'conquests'] })

      if (user && bcrypt.compareSync(data.password, user.password)) {
        const token = jwt.sign({ ...user }, process.env.AUTHSECRET as string, {
          expiresIn: '7 day'
        })

        return response.json(UsersView.render(token, user, championshipCurrent.id, championshipCurrent.currentRodada))
      } else {
        return response.status(400).send({ error: MessageError.LOGININVALID })
      }
    } catch (e) {
      console.log(e)
      return response.status(400).send({ error: 'Error on Sign In, try again.' })
    }
  },

  async forgotPassword (request: Request, response: Response) {
    const email = request.body.email || ''
    try {
      const error = emailValidade(email)
      if (error) return response.status(400).send({ error })

      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ email })
      if (!user) {
        return response.status(400).send({ error: MessageError.USERNOTFOUND })
      }

      const code = crypto.randomBytes(3).toString('hex')
      const now = new Date() // horario de 3 horas a mais no servidor

      await usersRepository.update(user.id, {
        codeResetPassword: code,
        codeResetExpires: now.toString()
      })

      const mailer = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: { user: process.env.EMAIL, pass: process.env.PASS }
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
          return response.status(400).send({ error: 'E-mail não encontrado.' })
        }
      })

      return response.send()
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Erro on forget password, try again.' })
    }
  },

  async resetPassword (request: Request, response: Response) {
    const { code, password, confirmPassword } = request.body
    try {
      const data = {
        code: code || '',
        password: password || '',
        confirmPassword: confirmPassword || ''
      }

      if (data.code.length === '') return response.status(400).send({ error: MessageError.CODENOTINFORMED })
      if (data.password.length === '') return response.status(400).send({ error: MessageError.PASSWORDNOTINFORMED })
      if (data.confirmPassword.length === '') {
        return response.status(400).send({ error: MessageError.CONFIRMEDPASSWORDNOTINFORMED })
      }

      if (data.password.length <= 7) {
        return response.status(400).send({ error: MessageError.PASSWORDMINCARACTER })
      }

      const salt = bcrypt.genSaltSync()
      const passwordHash = bcrypt.hashSync(data.password, salt)

      if (!bcrypt.compareSync(data.confirmPassword, passwordHash)) {
        return response.status(400).send({ error: MessageError.PASSWORDNOTCONFER })
      }

      const usersRepository = getRepository(Users)

      const user = await usersRepository.findOne({ codeResetPassword: data.code })
      if (!user) {
        return response.status(400).send({ error: MessageError.USERNOTFOUND })
      }

      const now = new Date()
      now.setHours(now.getHours() - 3)
      const codeExpires = new Date(user.codeResetExpires)
      if (now > codeExpires) {
        return response.status(400).send({ error: MessageError.CODEEXPIRED })
      }

      await usersRepository.update(user.id, {
        codeResetPassword: '',
        codeResetExpires: '',
        password: passwordHash
      })

      return response.send()
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Erro on reset password, try again.' })
    }
  },

  async update (request: Request, response: Response) {
    try {
      const { avatar, nickname, email } = request.body
      const data = { email: email || '', nickname: nickname || '', avatar: avatar || '' }

      if (data.nickname === '') { return response.status(400).send({ error: MessageError.NICKNAMENOTINFORMED }) }
      if (data.avatar === '') { return response.status(400).send({ error: MessageError.AVATARNOTINFORMED }) }
      const urlValided = await checkUrlLogo(data.avatar)
      if (!urlValided) { return response.status(400).send({ error: MessageError.AVATARINVALID }) }

      const UserRepository = getRepository(Users)
      const userDBNick = await UserRepository.findOne({ name: data.nickname })
      if (userDBNick) { return response.status(400).send({ error: MessageError.NICKNAMEEXISTING }) }

      const userDB = await UserRepository.findOne({ email: data.email }, { relations: ['points', 'heartClub', 'conquests'] })
      if (!userDB) { return response.status(400).send({ error: MessageError.USERNOTFOUND }) }

      await UserRepository.update({ id: userDB.id }, {
        avatar: data.avatar,
        name: data.nickname
      })
      userDB.avatar = data.avatar
      userDB.name = data.nickname

      return response.json(UsersView.renderItemPoint(userDB))
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Error in update User, try again.' })
    }
  },

  async initUser (request: Request, response: Response) {
    try {
      const { email } = request.body
      const data = { email: email || '' }

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      const UsersRepository = getRepository(Users)
      const userDB = await UsersRepository.findOne({ email: data.email }, { relations: ['points', 'heartClub', 'conquests'] })
      if (!userDB) return response.status(400).send({ error: MessageError.USERNOTFOUND })

      const championshipCurrent = await ChampionshipController.currentChampionship()
      if (!championshipCurrent) {
        return response.status(400).send({ error: MessageError.ATUALIZATION })
      }

      const token = jwt.sign({ ...userDB }, process.env.AUTHSECRET as string, {
        expiresIn: '7 day'
      })

      return response.json(UsersView.render(token, userDB, championshipCurrent.id, championshipCurrent.currentRodada))
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Erro on init User, try again.' })
    }
  },

  async chooseClub (request: Request, response: Response) {
    try {
      const { email, clubeId } = request.body
      const data = { email: email || '', clube: parseInt(clubeId, 10) || 0 }

      const error = emailValidade(data.email)
      if (error !== '') return response.status(400).send({ error })

      const UsersRepository = getRepository(Users)
      const userDB = await UsersRepository.findOne({ email: data.email }, { relations: ['points', 'conquests'] })
      if (!userDB) return response.status(400).send({ error: MessageError.USERNOTFOUND })

      const ClubeRepository = getRepository(Clube)
      const clubeDB = await ClubeRepository.findOne({ id: data.clube })
      if (!clubeDB) { return response.status(400).send({ error: MessageError.CLUBNOTFOUND }) }

      await UsersRepository.update(userDB.id, {
        heartClub: clubeDB
      })
      userDB.heartClub = clubeDB

      return response.json(UsersView.renderItem(userDB))
    } catch (err) {
      console.log(err)
      return response.status(400).send({ error: 'Erro on choose a Club, try again.' })
    }
  },

  async test (request: Request, response: Response) {
    const data = new Date()
    data.setHours(data.getHours() - 3)
    return response.json({
      message:
      `Estamos funcionando: ${data.toLocaleDateString()} ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`
    })
  }
}
