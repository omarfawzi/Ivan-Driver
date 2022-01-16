import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const TRACKING_INFO_SUFFIX = 'tickets'

class TrackingController {
  async getTrackingInfo(ticketId) {
    try {
      const res = await instance.get(
        `${TRACKING_INFO_SUFFIX}/${ticketId}/tracking`
      )
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = TrackingController
