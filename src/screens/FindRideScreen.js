import { React, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { GOOGLE_API_KEY } from '@env'
import MapViewDirections from 'react-native-maps-directions'
import { Fumi } from 'react-native-textinput-effects'
import Icon from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import NumericInput from 'react-native-numeric-input'
import AwesomeAlert from 'react-native-awesome-alerts'
import * as Location from 'expo-location'
import { getPreciseDistance } from 'geolib'
import { theme } from '../core/theme'
import Button from '../components/Button'
import StationController from '../api/stations'
import OrderController from '../api/orders'

const DISTANCE_LIMIT_IN_METERS = 1000

export default function FindRideScreen({ navigation }) {
  const [alertMessage, setAlertMessage] = useState({
    isError: false,
    message: null,
  })
  const [origin, setOrigin] = useState()
  const { height, width } = Dimensions.get('window')
  const [showAlert, setShowAlert] = useState(false)
  const [fare, setFare] = useState(0)
  const [selectedRoute, setSelectedRoute] = useState()
  const [destination, setDestination] = useState()
  const [waypoints, setWaypoints] = useState([{}])
  const [originStations, setOriginStations] = useState([])
  const [destinationStations, setDestinationStations] = useState([])
  const [seats, setSeats] = useState(0)
  const [seatsText, setSeatsText] = useState()
  const [isLoading, setLoading] = useState(false)
  const mapRef = useRef(null)
  const stationController = new StationController()
  const orderController = new OrderController()

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      return
    }
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Lowest,
      maximumAge: 10000,
    }).catch((e) => {
      alert(e)
    })

    if (currentLocation) {
      const currentRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
      setTimeout(() => {
        mapRef.current.animateToRegion(currentRegion, 3 * 1000)
      }, 5 * 1000)
    }
  }

  const setStationWaypoints = async (originId, destinationId) => {
    const routes = await stationController.getStationRoutes(originId)
    for (const stationRoute of routes) {
      if (stationRoute.to_stop_id == destinationId) {
        setSelectedRoute(stationRoute)
        setFare(stationRoute.fees.toString())
        setWaypoints(stationRoute.waypoints)
      }
    }
  }

  const onOrderButtonPressed = async () => {
    setLoading(true)
    try {
      await orderController.checkout(selectedRoute.id, seats)
      setShowAlert(true)
      setAlertMessage({
        isError: false,
        message:
          'Your order is being processed, you will be notified when we find an available driver.',
      })
    } catch (e) {
      if (e.data.errors) {
        setShowAlert(true)
        setAlertMessage({
          isError: true,
          message: e.data.errors[0],
        })
      }
    }
    setLoading(false)
  }

  const isDistanceToStationValid = async (station) => {
    const { status } = await Location.getForegroundPermissionsAsync()
    if (status !== 'granted') {
      setAlertMessage({
        isError: true,
        message:
          'Cant get your location, please make sure to allow location services for i-Van.',
      })
      setShowAlert(true)
      return false
    }
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Lowest,
      maximumAge: 10000,
    }).catch((e) => {
      alert(e)
    })
    const distance = getPreciseDistance(currentLocation.coords, station)
    if (distance <= DISTANCE_LIMIT_IN_METERS) {
      return true
    }
    setShowAlert(true)
    setAlertMessage({
      isError: true,
      message: `You are more than ${DISTANCE_LIMIT_IN_METERS} meters far away from the station, please come closer.`,
    })
    return false
  }

  const onStationPressed = async (station) => {
    if (origin && !(await isDistanceToStationValid(origin))) {
      return
    }
    if (!origin && !(await isDistanceToStationValid(station))) {
      return
    }
    if (!origin) {
      setOrigin(station)
      setWaypoints([])
      const routes = await stationController.getStationRoutes(station.id)
      const newStations = routes.map((stationRoute) => stationRoute.end_stop)
      if (newStations && newStations.length > 0) {
        setDestinationStations(newStations)
      }
      mapRef.current.fitToSuppliedMarkers(
        newStations.map((newStation) => `station#${newStation.id}`),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      )
    } else if (origin.id == station.id) {
      setOrigin(null)
      setDestinationStations([])
      setWaypoints([])
      setDestination(null)
      mapRef.current.fitToSuppliedMarkers(
        originStations.map((originStation) => `station#${originStation.id}`),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      )
    } else if (destination && destination.id == station.id) {
      setWaypoints([])
      setDestination(null)
      if (destinationStations && destinationStations.length > 0) {
        mapRef.current.fitToSuppliedMarkers(
          destinationStations.map(
            (destinationStation) => `station#${destinationStation.id}`
          ),
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        )
      }
    } else {
      setDestination(station)
      setStationWaypoints(origin.id, station.id)
      mapRef.current.fitToSuppliedMarkers(
        [`station#${origin.id}`, `station#${station.id}`],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      )
    }
  }
  useEffect(async () => {
    setLoading(false)
  }, [])

  return isLoading ? (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        height,
        width,
        position: 'absolute',
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  ) : (
    <View style={styles.container}>
      <MapView
        followsUserLocation
        showsMyLocationButton
        showsUserLocation
        minZoomLevel={14}
        maxZoomLevel={20}
        initialRegion={{
          latitude: 29.97811044,
          longitude: 31.11157825,
          latitudeDelta: 0.06,
          longitudeDelta:
            0.06 *
            (Dimensions.get('window').width / Dimensions.get('window').height),
        }}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        ref={mapRef}
      />
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertMessage.isError ? 'Error' : 'Info'}
        message={alertMessage.message}
        closeOnHardwareBackPress={false}
        showConfirmButton
        confirmText="OK"
        confirmButtonStyle={{ fontWeight: 'bold' }}
        titleStyle={{
          color: alertMessage.isError ? 'red' : theme.colors.primary,
          fontWeight: 'bold',
        }}
        messageStyle={{
          fontWeight: 'bold',
          fontSize: 15,
        }}
        confirmButtonColor={alertMessage.isError ? 'red' : theme.colors.primary}
        closeOnTouchOutside={false}
        onConfirmPressed={() => {
          setShowAlert(false)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width - 60,
    alignItems: 'center',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width - 60,
    alignItems: 'center',
  },
  input: {
    width: Dimensions.get('window').width - 70,
    height: 45,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  seatInput: {
    width: Dimensions.get('window').width - 170,
    height: 45,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  fareInput: {
    width: Dimensions.get('window').width - 230,
    height: 45,
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 40,
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'green',
  },
})
