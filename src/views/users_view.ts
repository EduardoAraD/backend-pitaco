import User from '@models/Users'

import pointsView from './points_view'
import conquestView from './conquest_view'
import clubeView from './clube_view'

export default {
  render (token: string, user: User, championship: number, rodada: number) {
    return {
      token: token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        points: pointsView.renderManyNotUser(user.points),
        heartClub: user.heartClub ? clubeView.renderItem(user.heartClub) : {},
        conquests: conquestView.renderMany(user.conquests || [])
      },
      championship: championship,
      rodada: rodada
    }
  },
  renderItem (user: User) {
    return {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      conquests: conquestView.renderMany(user.conquests || []),
      heartClub: user.heartClub ? clubeView.renderItem(user.heartClub) : {}
    }
  },
  renderMany (users: User[]) {
    return users.map(user => this.renderItem(user))
  }
}
