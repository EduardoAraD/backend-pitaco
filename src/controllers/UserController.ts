import { getRepository } from 'typeorm'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import Users from '@models/User'
import UsersView from '@views/users_view'

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
    const usersRepository = getRepository(Users)

    const userExisting = await usersRepository.findOne({ email: data.email })
    if (userExisting) {
      return response.status(400).send({ error: 'Email já existente.' })
    }

    // criadno o User no DB
    const userData = {
      name: data.name,
      email: data.email,
      password: passwordHash,
      codeResetPassword: '',
      codeResetExpires: ''
    }

    const user = usersRepository.create(userData)
    await usersRepository.save(user)

    const token = jwt.sign({ ...user }, process.env.AUTHSECRET as string, {
      expiresIn: '30 day'
    })

    return response.json(UsersView.render(token, user))
  },

  async signIn (request: Request, response: Response) {
    const {
      email,
      password
    } = request.body

    const data = { email, password } as DataRequestSignIn

    const usersRepository = getRepository(Users)

    const user = await usersRepository.findOne({ email: data.email })

    if (user && bcrypt.compareSync(data.password, user.password)) {
      const token = jwt.sign({ ...user }, process.env.AUTHSECRET as string, {
        expiresIn: '1 day'
      })

      return response.json(UsersView.render(token, user))
    } else {
      return response.status(400).send({ message: 'Usuário/Senha inválidos' })
    }
  },

  async forgotPassword (request: Request, response: Response) {},

  async resetPassword (request: Request, response: Response) {}
}
