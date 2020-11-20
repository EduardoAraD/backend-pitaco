import Pitaco from '@models/Pitaco'

import usersView from './users_view'

export default {
  render (pitaco: Pitaco) {
    return {
      matchId: pitaco.matchId,
      golsHome: pitaco.golsHome,
      golsAway: pitaco.golsAway,
      user: usersView.renderItem(pitaco.userId)
    }
  },

  renderMany (pitacos: Pitaco[]) {
    return pitacos.map(pitaco => this.render(pitaco))
  }
}
