import Points from '@models/Points'

import usersView from './users_view'

export default {
  render (point: Points) {
    return {
      points: point.points,
      exactScore: point.exactScore,
      user: usersView.renderItem(point.userId)
    }
  },
  renderNotUser (point: Points) {
    return {
      points: point.points,
      exactScore: point.exactScore
    }
  },
  renderMany (points: Points[]) {
    return points.map(point => this.render(point))
  },
  renderManyNotUser (points: Points[]) {
    return points.map(point => this.renderNotUser(point))
  }
}
