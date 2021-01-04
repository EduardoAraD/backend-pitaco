import Match from '@models/Match'
import Points from '@models/Points'

export function stringForDate (date: string, hour: string) {
  const [day, mount, year] = date.split('/')
  return new Date(`${year}/${mount}/${day} ${hour}`)
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

export const MessageError = {
  ATUALIZATION: 'Esperando atualização de campeonato.',

  USERNOTFOUND: 'Usuário não encontrado.',
  CLUBNOTFOUND: 'Clube não encontrado.',

  NICKNAMENOTINFORMED: 'Nickname não informado.',
  NICKNAMEEXISTING: 'Nickname já existe.',
  EMAILNOTINFORMED: 'E-mail não informado.',
  EMAILINVALID: 'E-mail informado não é válido.',
  EMAILEXISTING: 'E-mail já existe.',
  PASSWORDNOTINFORMED: 'Senha não informada.',
  PASSWORDMINCARACTER: 'Senha precisa ter no mínino 8 caracteres.',
  PASSWORDNOTCONFER: 'Senhas não conferem.',
  CONFIRMEDPASSWORDNOTINFORMED: 'Confirmação de senha não fornecida.',
  CODENOTINFORMED: 'Código não informado.',
  CODEEXPIRED: 'Código expirado.',

  LOGININVALID: 'Usuário/Senha inválidas.'
}
