import ClubeClassification from '@models/ClubeClassification'

import clubeView from './clube_view'

export default {
  renderItem (clube: ClubeClassification, index?: number) {
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
      porcentege: clube.utilization
    }
  },

  renderMany (classification: ClubeClassification[]) {
    return classification.map((clube, index) => this.renderItem(clube, index))
  }
}
