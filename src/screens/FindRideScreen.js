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
import { theme } from '../core/theme'

export default function FindRideScreen({ navigation }) {
  const [alertMessage, setAlertMessage] = useState({
    isError: false,
    message: null,
  })
  const { height, width } = Dimensions.get('window')
  const [showAlert, setShowAlert] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const mapRef = useRef(null)

  useEffect(async () => {
    setLoading(false)
    await Location.requestForegroundPermissionsAsync()
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        if (mapRef) {
          mapRef.current.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          })
        }
      },
      () => Alert.alert('تأكد من تفعيل اعدادات موقعك الحالي لتطبيق iVan.'),
      { enableHighAccuracy: true }
    )
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
