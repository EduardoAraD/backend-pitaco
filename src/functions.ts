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
  LEAGUENOTFOUND: 'Liga não encontrada.',
  SOLICITATIONNOTFOUND: 'Solicitação não encontrada.',
  SOLICITATIONEXISTING: 'Você já possui uma solicitação.',

  NICKNAMENOTINFORMED: 'Nickname não informado.',
  NICKNAMEEXISTING: 'Nickname já existe.',
  NICKNAMEINVALID: 'Nickname com apenas letras e números.',
  NAMENOTINFORMED: 'Nome não informado.',
  NAMEINVALID: 'Nome com apenas letras e números.',
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
