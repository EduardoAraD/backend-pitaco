// Validação de alguns nomes da aplicação.
import { MessageError, regex } from '../functions'

export function emailValidade (email: string): string {
  if (email === '') {
    return MessageError.EMAILNOTINFORMED
  }
  if (!email.match(regex.email)) {
    return MessageError.EMAILINVALID
  }

  return ''
}

export function nickNameValidade (nickname: string): string {
  if (nickname === '') {
    return MessageError.NICKNAMENOTINFORMED
  }
  if (!nickname.match(regex.name)) {
    return MessageError.NICKNAMEINVALID
  }

  return ''
}

export function nameValidade (name: string): string {
  if (name === '') {
    return MessageError.NAMENOTINFORMED
  }
  if (!name.match(regex.name)) {
    return MessageError.NAMEINVALID
  }

  return ''
}

export function descriptionValidade (description: string): string {
  if (description === '') {
    return MessageError.DESCRIPTIONNOTINFORMED
  }
  if (!description.match(regex.name)) {
    return MessageError.DESCRIPTIONINVALID
  }

  return ''
}
