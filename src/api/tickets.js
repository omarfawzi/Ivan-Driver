import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const TICKETS_SUFFIX = 'tickets'
const REJECT_TICKET_SUFFIX = `${TICKETS_SUFFIX}/reject`
const CONFIRM_TICKET_SUFFIX = `${TICKETS_SUFFIX}/confirm`
const COLLECT_TICKET_SUFFIX = `${TICKETS_SUFFIX}/collect`

class TicketController {
  async getTickets() {
    try {
      const res = await instance.get(`${TICKETS_SUFFIX}`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async rejectTicket(ticketId) {
    try {
      const res = await instance.post(REJECT_TICKET_SUFFIX, {
        tickets: [ticketId],
      })
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async confirmTicket(ticketId) {
    try {
      const res = await instance.post(CONFIRM_TICKET_SUFFIX, {
        tickets: [ticketId],
      })
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async collectTicket(ticketId) {
    try {
      const res = await instance.post(COLLECT_TICKET_SUFFIX, {
        tickets: [ticketId],
      })
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = TicketController
