import instance from './index'
import { handler } from '../helpers/exceptionHandler'

const PICKUP_STATIONS_SUFFIX = 'stations?type=pickup'
const STATION_ROUTES_SUFFIX = 'stations/stopRoutes'

class StationController {
  async getPickUpStations() {
    try {
      const res = await instance.get(PICKUP_STATIONS_SUFFIX)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }

  async getStationRoutes(stationId) {
    try {
      const res = await instance.get(`${STATION_ROUTES_SUFFIX}/${stationId}`)
      return res.data
    } catch (e) {
      throw handler(e)
    }
  }
}

module.exports = StationController
