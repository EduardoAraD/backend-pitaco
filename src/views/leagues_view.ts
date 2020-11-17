import Leagues from '@models/Leagues'

import usersView from './users_view'
import pointsView from './points_view'

export default {
  render (league: Leagues) {
    return {
      league: {
        name: league.name,
        dono: usersView.renderItem(league.dono),
        points: pointsView.renderMany(league.points)
      }
    }
  },
  renderMany (leagues: Leagues[]) {
    return leagues.map(league => this.render(league))
  }
}
