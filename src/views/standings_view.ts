import Standing from '../models/Standing'

import clubeView from './clube_view'

export default {
  renderItem (clube: Standing, index?: number) {
    return {
      position: 1 + index,
      clube: clubeView.renderItem(clube.clube),
      points: clube.points,
      wins: clube.wins,
      draw: clube.draw,
      defeat: clube.matchs - (clube.wins + clube.draw),
      matchs: clube.matchs,
      golsScore: clube.goalsScored,
      golsConceded: clube.goalsConceded,
      golsDiff: clube.goalsScored - clube.goalsConceded,
      porcentage: clube.utilization,
      status: clube.status
    }
  },

  renderMany (classification: Standing[]) {
    return classification.map((clube, index) => this.renderItem(clube, index))
  }
}
