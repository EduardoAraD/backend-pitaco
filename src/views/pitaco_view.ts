import Pitaco from '@models/Pitaco'

import usersView from './users_view'
import matchView from './match_view'

export default {
  render (pitaco: Pitaco) {
    return {
      golsHome: pitaco.golsHome,
      golsAway: pitaco.golsAway,
      point: pitaco.point,
      exactScore: pitaco.exactScore,
      user: usersView.renderItem(pitaco.userId),
      match: matchView.renderItem(pitaco.matchId)
    }
  },

  renderMany (pitacos: Pitaco[]) {
    return pitacos.map(pitaco => this.render(pitaco))
  }
}
