import User from '@models/Users'

import pointsView from './points_view'

export default {
  render (token: string, user: User, idChampionship: number) {
    return {
      token: token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        points: pointsView.renderManyNotUser(user.points),
        heartClub: user.heartClub || {}
      },
      ChampionshipId: idChampionship
    }
  },
  renderItem (user: User) {
    return {
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  },
  renderMany (users: User[]) {
    return users.map(user => this.renderItem(user))
  }
}
