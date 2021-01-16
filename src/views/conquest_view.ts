import Conquest from '../models/Conquest'

export default {
  render (conquest: Conquest) {
    return {
      id: conquest.id,
      position: conquest.position,
      description: conquest.description,
      league: conquest.league
    }
  },
  renderMany (conquests: Conquest[]) {
    return conquests.map(conquest => this.render(conquest))
  }
}
