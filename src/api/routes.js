import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const ROUTES_SUFFIX = 'routes'
const NEXT_ROUTE_SUFFIX = 'next'

class RouteController {
  async nextRoute() {
    try {
      const res = await instance.get(`${ROUTES_SUFFIX}/${NEXT_ROUTE_SUFFIX}`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = RouteController
