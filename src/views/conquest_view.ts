import Conquest from '../models/Conquest'

export default {
  render (conquest: Conquest) {
    return {
      position: conquest.position,
      league: conquest.league
    }
  },
  renderMany (conquests: Conquest[]) {
    return conquests.map(conquest => this.render(conquest))
  }
}
