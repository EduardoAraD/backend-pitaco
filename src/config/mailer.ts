import nodemailer from 'nodemailer'

import mail from './mail'

export const transport = nodemailer.createTransport({
  service: 'gmail',
  host: mail.host,
  auth: { user: mail.user, pass: mail.pass }
})
