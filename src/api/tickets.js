import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const GET_TICKET_SUFFIX = 'tickets'
const CANCEL_TICKET_SUFFIX = 'tickets/cancel'

class TicketController {
  async getTicket(ticketId) {
    try {
      const res = await instance.get(`${GET_TICKET_SUFFIX}/${ticketId}`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async cancelTicket(ticketId) {
    try {
      const res = await instance.post(`${CANCEL_TICKET_SUFFIX}/${ticketId}`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = TicketController
