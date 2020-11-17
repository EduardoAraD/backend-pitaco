import User from '@models/Users'

import pointsView from './points_view'

export default {
  render (token: string, user: User) {
    return {
      token: token,
      user: {
        name: user.name,
        email: user.email,
        points: pointsView.renderManyNotUser(user.points)
      }
    }
  },
  renderItem (user: User) {
    return {
      name: user.name,
      email: user.email
    }
  },
  renderMany (users: User[]) {
    return users.map(user => this.renderItem(user))
  }
}
