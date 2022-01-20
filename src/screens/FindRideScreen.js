import { React, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation'
import AwesomeAlert from 'react-native-awesome-alerts'
import * as Location from 'expo-location'
import ToggleSwitch from 'toggle-switch-react-native'
import { theme } from '../core/theme'
import StatusController from '../api/status'

export default function FindRideScreen({ navigation }) {
  const [alertMessage, setAlertMessage] = useState({
    isError: false,
    message: null,
  })
  const { height, width } = Dimensions.get('window')
  const [showAlert, setShowAlert] = useState(false)
  const [active, setActive] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const mapRef = useRef(null)
  const statusController = new StatusController()

  const toggleStatus = async (isOn) => {
    if (isOn) {
      await statusController.activate()
    } else {
      await statusController.deactivate()
    }
    setActive(isOn)
  }

  useEffect(async () => {
    await Location.requestForegroundPermissionsAsync()
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        if (mapRef) {
          mapRef.current.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          })
        }
      },
      () => Alert.alert('تأكد من تفعيل اعدادات موقعك الحالي لتطبيق iVan.'),
      { enableHighAccuracy: true }
    )
    const status = await statusController.getStatus()
    setActive(status.active)
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
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        ref={mapRef}
      />
      <View style={styles.overlayBottom}>
        <ToggleSwitch
          isOn={Boolean(active)}
          onColor="green"
          offColor="red"
          label={!active ? 'ابدأ' : 'توقف'}
          labelStyle={{ color: 'black', fontWeight: 'bold', fontSize: 28 }}
          size="medium"
          onToggle={(isOn) => {
            toggleStatus(isOn)
          }}
        />
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
