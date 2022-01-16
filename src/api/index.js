import { BASE_URL, API_V1_PREFIX } from '@env'
import axios from 'axios'

const instance = axios.create({
  baseURL: `${BASE_URL}/${API_V1_PREFIX}/`,
})

export default instance
