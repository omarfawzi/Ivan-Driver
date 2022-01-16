import { React, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
} from 'react-native'
import { PUSHER_APP_KEY, PUSHER_APP_CLUSTER, GOOGLE_API_KEY } from '@env'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import * as SecureStore from 'expo-secure-store'
import Pusher from 'pusher-js/react-native'
import AwesomeAlert from 'react-native-awesome-alerts'
import MapViewDirections from 'react-native-maps-directions'
import { theme } from '../core/theme'
import BackButton from '../components/BackButton'
import TrackingController from '../api/tracking'
import { BEARER_TOKEN_KEY } from '../providers/auth'

export default function DriverTrackingScreen({ route, navigation }) {
  const [trackingInfo, setTrackingInfo] = useState()
  const [driverLocation, setDriverLocation] = useState()
  const [isLoading, setLoading] = useState(true)
  const { height, width } = Dimensions.get('window')
  const mapRef = useRef(null)
  const { ticketId } = route.params
  const trackingController = new TrackingController()
  const [alertMessage, setAlertMessage] = useState({
    isError: false,
    message: null,
  })
  const [showAlert, setShowAlert] = useState(false)
  useEffect(async () => {
    let tracking = {}
    try {
      tracking = await trackingController.getTrackingInfo(ticketId)
      setDriverLocation({
        latitude: tracking.driverLatitude,
        longitude: tracking.driverLongitude,
      })
      setTrackingInfo(tracking)
    } catch (e) {
      setShowAlert(true)
      setAlertMessage({ isError: true, message: e.data.errors[0] })
    }
    const token = await SecureStore.getItemAsync(BEARER_TOKEN_KEY)

    const PusherClient = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      wsHost: 'i-van.co',
      wsPort: 2053,
      wssPort: 2053,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
      enableStats: false,
      authEndpoint: 'https://i-van.co/api/v1/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    })

    const channel = PusherClient.subscribe(
      `private-Drivers.${tracking.driverId}`
    )
    channel.bind('locationChanged', (event) => {
      setDriverLocation({
        latitude: event.latitude,
        longitude: event.longitude,
      })
      mapRef.current.fitToSuppliedMarkers(['driver', 'station'], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      })
    })
    setLoading(false)
    return () => {
      setTrackingInfo(null)
      setDriverLocation(null)
      PusherClient.disconnect()
    }
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
      <BackButton goBack={navigation.goBack} />
      <ActivityIndicator size="large" color={theme.colors.secondary} />
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
        onMapReady={() => {
          if (trackingInfo) {
            mapRef.current.fitToSuppliedMarkers(['driver', 'station'], {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            })
          }
        }}
      >
        {trackingInfo ? (
          <View>
            <Marker.Animated
              key="driver"
              identifier="driver"
              title={trackingInfo.driverName}
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
              anchor={{ x: 0.4, y: 0.5 }}
              tracksInfoWindowChanges={false}
            >
              <Image
                source={require('../assets/bus-stop-3.png')}
                style={{ width: 50, height: 40, marginBottom: -10 }}
                resizeMode="stretch"
              />
            </Marker.Animated>
            <Marker
              key="station"
              identifier="station"
              title="Pickup"
              coordinate={{
                latitude: trackingInfo.stationLatitude,
                longitude: trackingInfo.stationLongitude,
              }}
              anchor={{ x: 0.4, y: 0.5 }}
              tracksInfoWindowChanges={false}
            >
              <Image
                source={require('../assets/bus-stop-6.png')}
                style={{ width: 90, height: 90, marginBottom: -10 }}
                resizeMode="stretch"
              />
            </Marker>
          </View>
        ) : null}
        {trackingInfo ? (
          <MapViewDirections
            origin={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            destination={{
              latitude: trackingInfo.stationLatitude,
              longitude: trackingInfo.stationLongitude,
            }}
            apikey={GOOGLE_API_KEY}
            precision="high"
            strokeColor={theme.colors.secondary}
            strokeWidth={5}
          />
        ) : null}
      </MapView>
      <View
        style={{
          position: 'absolute',
          top: getStatusBarHeight() - 30,
          alignSelf: 'flex-start',
        }}
      >
        <BackButton goBack={navigation.goBack} />
      </View>
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
        onConfirmPressed={navigation.goBack}
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
})
