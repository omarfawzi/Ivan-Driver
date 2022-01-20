import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const ACTIVATE = 'activate'
const DEACTIVATE = 'deactivate'
const RESET_STATE = 'resetState'
const STATUS = 'status'

class StatusController {
  async deactivate() {
    try {
      const res = await instance.post(DEACTIVATE)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async activate() {
    try {
      const res = await instance.post(ACTIVATE)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async resetState() {
    try {
      const res = await instance.post(RESET_STATE)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async getStatus() {
    try {
      const res = await instance.get(STATUS)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = StatusController
