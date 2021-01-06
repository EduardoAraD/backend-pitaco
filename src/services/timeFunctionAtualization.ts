import { Atualization } from '../controllers/Atualization'

const main = async () => {
  const data = new Date()
  console.log(`Atualizando: ${data.getHours()}:${data.getMinutes()}`)
  await Atualization()
}

// milissegundos(1000) - segundos(60) - minutos(60) - horas(24)
export default setInterval(main, 1000 * 60 * 40) // 30 minutos
