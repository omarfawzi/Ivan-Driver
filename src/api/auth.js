import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const LOGIN_SUFFIX = 'login'
const LOGOUT_SUFFIX = 'logout'
const REGISTER_DEVICE_SUFFIX = 'device'

export default class AuthController {
  async login(mobile, password) {
    try {
      const res = await instance.post(LOGIN_SUFFIX, {
        mobile,
        password,
      })
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async logout() {
    try {
      const res = await instance.post(LOGOUT_SUFFIX)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async registerDevice(token) {
    try {
      const res = await instance.post(REGISTER_DEVICE_SUFFIX, { token })
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}
