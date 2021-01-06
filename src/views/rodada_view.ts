import Rodada from '../models/Rodada'

import matchView from './match_view'

export default {
  renderItem (rodada: Rodada) {
    return {
      name: rodada.name,
      number: rodada.number,
      prev: rodada.prevRodada,
      prox: rodada.proxRodada,
      matchs: matchView.renderMany(rodada.matchs)
    }
  },

  renderMany (rodadas: Rodada[]) {
    return rodadas.map(rodada => this.renderItem(rodada))
  }
}
