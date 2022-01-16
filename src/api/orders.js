import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const ORDERS_SUFFIX = 'orders'
const CHECKOUT_SUFFIX = 'checkout'

class OrderController {
  async getOrders() {
    try {
      const res = await instance.get(ORDERS_SUFFIX)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async checkout(routeId, seats) {
    try {
      const res = await instance.post(CHECKOUT_SUFFIX, { routeId, seats })
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = OrderController
