import { React, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  PixelRatio,
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import ToggleSwitch from 'toggle-switch-react-native'
import MapViewDirections from 'react-native-maps-directions'
import { GOOGLE_API_KEY } from '@env'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import { theme } from '../core/theme'
import StatusController from '../api/status'
import RouteController from '../api/routes'
import { useAuth } from '../providers/auth'

export default function FindRideScreen({
  navigation,
  mapData,
  onStationChange,
}) {
  const { handleActiveStatus, state, handleLogout } = useAuth()
  const [active, setActive] = useState(
    state.active === null ? false : state.active
  )
  const mapRef = useRef()
  const statusController = new StatusController()
  const routeController = new RouteController()

  const toggleStatus = async (isOn) => {
    try {
      if (isOn) {
        await statusController.activate()
        BackgroundGeolocation.start()
      } else {
        await statusController.deactivate()
        BackgroundGeolocation.stop()
      }
      handleActiveStatus(isOn)
      setActive(isOn)
    } catch (e) {
      if (e.status === 401) {
        await handleLogout()
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        })
      }
    }
  }

  const onMapsPress = (station) => {
    let waypoints = ''
    if (station.waypoints) {
      waypoints = station.waypoints
        .map((e) => e.latitude + ',' + e.longitude)
        .join('|')
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&travelmode=driving&waypoints=${waypoints}`

    Linking.openURL(url)
  }

  useEffect(async () => {
    try {
      if (state.active === null) {
        const status = await statusController.getStatus()
        setActive(status.active)
        if (status.active) {
          BackgroundGeolocation.start()
        } else {
          BackgroundGeolocation.stop()
        }
      }
      const nextRoute = await routeController.nextRoute()
      if (Object.keys(nextRoute).length > 0) {
        onStationChange(nextRoute)
      } else {
        onStationChange(null)
        if (mapRef && mapRef.current && mapData && mapData.driver) {
          mapRef.current.animateToRegion(mapData.driver.location)
        }
      }
    } catch (e) {
      if (e.status === 401) {
        await handleLogout()
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        })
      }
    }

    return () => {
      setActive(false)
    }
  }, [])

  return (
    <View style={styles.container}>
      <MapView
        followsUserLocation
        showsMyLocationButton
        showsUserLocation
        minZoomLevel={14}
        maxZoomLevel={20}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={
          mapData.driver
            ? mapData.driver.location
            : {
                latitude: 29.980034312576823,
                longitude: 31.104741096496586,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }
        }
        ref={mapRef}
      >
        {mapData.station ? (
          <Marker
            key="station"
            identifier="station"
            title={mapData.station.name}
            coordinate={{
              latitude: mapData.station.latitude,
              longitude: mapData.station.longitude,
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
        ) : null}
        {mapData.station && mapData.driver ? (
          <MapViewDirections
            origin={mapData.driver.location}
            destination={mapData.station}
            apikey={GOOGLE_API_KEY}
            precision="high"
            strokeColor={theme.colors.secondary}
            strokeWidth={5}
            onReady={() => {
              mapRef.current.fitToCoordinates(
                [mapData.driver.location, mapData.station],
                {
                  edgePadding: {
                    top:
                      Platform.OS === 'ios' ? 100 : PixelRatio.get() * 100 - 50,
                    right: 0,
                    left: 0,
                    bottom:
                      Platform.OS === 'ios' ? 100 : PixelRatio.get() * 100 - 50,
                  },
                  animated: true,
                }
              )
            }}
            waypoints={mapData.station.waypoints}
            resetOnChange
          />
        ) : null}
      </MapView>
      {mapData.station && mapData.driver ? (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 15,
            zIndex: 1,
            right: 25,
          }}
          onPress={() => {
            onMapsPress(mapData.station)
          }}
        >
          <Image
            source={require('../assets/gmaps.jpg')}
            style={{ width: 40, height: 40 }}
            resizeMode="stretch"
          />
        </TouchableOpacity>
      ) : null}
      <View style={styles.overlayBottom}>
        <ToggleSwitch
          isOn={Boolean(active)}
          onColor="green"
          offColor="red"
          label={!active ? '????????' : '????????'}
          labelStyle={{ color: 'black', fontWeight: 'bold', fontSize: 28 }}
          size="medium"
          onToggle={(isOn) => {
            toggleStatus(isOn)
          }}
        />
      </View>
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
    top: 10,
    width: Dimensions.get('window').width - 30,
    alignItems: 'center',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 40,
    width: 200,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
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
