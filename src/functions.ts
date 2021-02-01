import Axios from 'axios'
import Match from './models/Match'
import Points from './models/Points'

export function stringForDate (date: string, hour: string): Date {
  const [day, mount, year] = date.split('/')
  return new Date(`${year}/${mount}/${day} ${hour}`)
}

export async function checkUrlLogo (url: string): Promise<boolean> {
  return await Axios.get(url).then(() => true).catch(() => false)
}

export function addDays (date: Date, days: number): Date {
  const mouth = date.getMonth() + 1
  const year = date.getFullYear()
  const day = date.getDate()
  const newDate = day + days

  if (newDate > 28 && mouth === 2) {
    if (year % 4 === 0 && newDate > 29) {
      return new Date(`${year}/${mouth + 1}/${newDate - 29} 12:00`)
    } else {
      return new Date(`${year}/${mouth + 1}/${newDate - 28} 12:00`)
    }
  } else if (newDate > 31 && (mouth === 1 || mouth === 3 ||
    mouth === 5 || mouth === 7 || mouth === 8 || mouth === 10 || mouth === 12)) {
    if (mouth === 12) {
      return new Date(`${year + 1}/${1}/${newDate - 31} 12:00`)
    } else {
      return new Date(`${year}/${mouth + 1}/${newDate - 31} 12:00`)
    }
  } else if (newDate > 30 && (mouth === 4 || mouth === 6 || mouth === 9 || mouth === 11)) {
    return new Date(`${year}/${mouth + 1}/${newDate - 30} 12:00`)
  } else {
    return new Date(`${year}/${mouth}/${newDate} 12:00`)
  }
}

export function removeDays (date: Date, days: number): Date {
  const mouth = date.getMonth() + 1
  const year = date.getFullYear()
  const day = date.getDate()
  const newDate = day - days

  if (newDate < 1) {
    if (mouth === 1) {
      return new Date(`${year - 1}/${12}/${newDate + 31} 12:00`)
    } else if (mouth === 3) {
      if (year % 4 === 0) {
        return new Date(`${year}/${2}/${newDate + 29} 12:00`)
      } else {
        return new Date(`${year}/${2}/${newDate + 28} 12:00`)
      }
    } else if (mouth === 2 || mouth === 4 || mouth === 6 ||
      mouth === 8 || mouth === 9 || mouth === 11) {
      return new Date(`${year}/${mouth - 1}/${newDate + 31} 12:00`)
    } else {
      return new Date(`${year}/${mouth - 1}/${newDate + 30} 12:00`)
    }
  } else {
    return new Date(`${year}/${mouth}/${newDate} 12:00`)
  }
}

export function firstMatch (match1: Match, match2: Match) {
  const val1 = stringForDate(match1.date, match1.hour).getTime()
  const val2 = stringForDate(match2.date, match2.hour).getTime()
  if (val1 > val2) return 1
  else if (val1 === val2) return 0
  else return -1
}

export function firstPoint (point1: Points, point2: Points) {
  if (point1.points < point2.points) { return 1 }
  if (point1.points === point2.points) {
    if (point1.exactScore < point2.exactScore) { return 1 }
    if (point1.exactScore === point2.exactScore) { return 0 }
  }
  return -1
}

export function firstName (name1: string, name2: string) {
  return (name1 > name2) ? 1 : ((name2 > name1) ? -1 : 0)
}

export const MessageError = {
  ATUALIZATION: 'Esperando atualização de campeonato.',

  USERNOTFOUND: 'Usuário não encontrado.',
  USERHAVELEAGUE: 'Você já possui uma liga.',
  USERNOTHAVELEAGUE: 'Você não possui uma liga.',
  USERFRIENDEQUAL: 'E-mails iguais',
  FRIENDNOTFOUND: 'Amigo não encontrado.',
  FRIENDEXISTING: 'Vocês já são amigos.',
  CLUBNOTFOUND: 'Clube não encontrado.',
  CHAMPIONSHIPNOTFOUND: 'Campeonato não encontrado.',
  RODADANOTFOUND: 'Rodada não encontrada',
  LEAGUENOTFOUND: 'Liga não encontrada.',
  SOLICITATIONNOTFOUND: 'Solicitação não encontrada.',
  SOLICITATIONEXISTING: 'Você já possui uma solicitação.',

  NICKNAMENOTINFORMED: 'Nickname não informado.',
  NICKNAMEEXISTING: 'Nickname já existe.',
  NICKNAMEINVALID: 'Nickname com apenas letras e números.',
  NAMENOTINFORMED: 'Nome não informado.',
  NAMEINVALID: 'Nome com apenas letras e números.',
  AVATARNOTINFORMED: 'Url não informada',
  AVATARINVALID: 'Url inválida',
  DESCRIPTIONNOTINFORMED: 'Descrição não informada.',
  DESCRIPTIONINVALID: 'Descrição com apenas letras e números.',
  EMAILNOTINFORMED: 'E-mail não informado.',
  EMAILINVALID: 'E-mail informado não é válido.',
  EMAILEXISTING: 'E-mail já existe.',
  EMAILFRIENDNOTINFORMED: 'E-mail do amigo não informado.',
  PASSWORDNOTINFORMED: 'Senha não informada.',
  PASSWORDMINCARACTER: 'Senha precisa ter no mínino 8 caracteres.',
  PASSWORDNOTCONFER: 'Senhas não conferem.',
  TROPHYNOTINFORMED: 'Taça não informada.',
  CONFIRMEDPASSWORDNOTINFORMED: 'Confirmação de senha não fornecida.',
  CODENOTINFORMED: 'Código não informado.',
  CODEEXPIRED: 'Código expirado.',
  DATENOTINFORMED: 'Data não informada.',
  PITACOSNOTINFORMED: 'Pitacos não informados.',

  LOGININVALID: 'Usuário/Senha inválidas.'
}

export const regex = {
  email: /\S+@\S+\.\S+/,
  name: /^[A-Z0-9a-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/
}
