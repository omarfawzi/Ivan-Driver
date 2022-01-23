import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const ORDERS_SUFFIX = 'orders'

class OrderController {
  async accept(orderId) {
    try {
      const res = await instance.post(`${ORDERS_SUFFIX}/${orderId}/accept`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async deny(orderId) {
    try {
      const res = await instance.post(`${ORDERS_SUFFIX}/${orderId}/deny`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async ignore(orderId) {
    try {
      const res = await instance.post(`${ORDERS_SUFFIX}/${orderId}/ignore`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = OrderController
