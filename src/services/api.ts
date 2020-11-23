import axios from 'axios'

const api = axios.create({
  baseURL: 'https://app.sportdataapi.com/api/v1/'
})

export default api
