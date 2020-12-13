import Leagues from '@models/Leagues'

import usersView from './users_view'
import pointsView from './points_view'

export default {
  render (league: Leagues) {
    return {
      name: league.name,
      description: league.description,
      trophy: league.trophy,
      dono: usersView.renderItem(league.dono),
      points: pointsView.renderMany(league.points)
    }
  },
  renderMany (leagues: Leagues[]) {
    return leagues.map(league => this.render(league))
  }
}
