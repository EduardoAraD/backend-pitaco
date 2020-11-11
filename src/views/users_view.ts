import User from '@models/User'

export default {
  render (token: string, user: User) {
    return {
      token: token,
      user: {
        name: user.name,
        email: user.email
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
