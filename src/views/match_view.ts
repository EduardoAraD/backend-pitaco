import Match from '@models/Match'

import clubeView from './clube_view'

export default {
  renderItem (match: Match) {
    return {
      id: match.id,
      status: match.status,
      stadium: match.stadium,
      date: match.date,
      hour: match.hour,
      matchIdApi: match.matchIdApi,
      golsHome: match.golsHome,
      golsAway: match.golsAway,
      clubeHome: clubeView.renderItem(match.clubeHome),
      clubeAway: clubeView.renderItem(match.clubeAway)
    }
  },

  renderMany (matchs: Match[]) {
    return matchs.map(match => this.renderItem(match))
  }
}
