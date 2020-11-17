import nodemailer from 'nodemailer'

import mail from './mail'

export const transport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: { user: mail.user, pass: mail.pass }
})
