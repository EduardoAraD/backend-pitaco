import Friend from '@models/Friend'

import UsersView from './users_view'

export default {
  render (friend: Friend) {
    return {
      user: UsersView.renderItem(friend.user),
      friend: UsersView.renderItem(friend.friend)
    }
  },

  renderMany (friends: Friend[]) {
    return friends.map(friend => this.render(friend))
  }
}
