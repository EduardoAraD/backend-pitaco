import Clube from '../models/Clube'

export default {
  renderItem (clube: Clube) {
    return {
      id: clube.id,
      name: clube.name,
      nameComplete: clube.nameComplete,
      shortCode: clube.shortCode,
      logo: clube.logo
    }
  },
  renderMany (clubes: Clube[]) {
    return clubes.map(clube => this.renderItem(clube))
  }
}
