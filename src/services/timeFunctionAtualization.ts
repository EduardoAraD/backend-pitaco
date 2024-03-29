import { Atualization } from '../controllers/Atualization'

const main = async () => {
  const data = new Date()
  data.setHours(data.getHours() - 3)
  console.log(`Atualizando: ${data.getHours()}:${data.getMinutes()}`)
  await Atualization()
}

// milissegundos(1000) - segundos(60) - minutos(60) - horas(24)
export default setInterval(main, 1000 * 60 * 30) // 30 minutos
