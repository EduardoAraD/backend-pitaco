import Clube from '@models/Clube'

export default {
  renderItem (clube: Clube) {
    return {
      name: clube.name,
      shortCode: clube.shortCode,
      logo: clube.logo
    }
  },
  renderMany (clubes: Clube[]) {
    return clubes.map(clube => this.renderItem(clube))
  }
}
