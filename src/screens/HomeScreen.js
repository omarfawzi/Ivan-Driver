import React, { useEffect, useState } from 'react'
import {
  View,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import messaging from '@react-native-firebase/messaging'
import AwesomeAlert from 'react-native-awesome-alerts'
import * as Location from 'expo-location'
import Geolocation from '@react-native-community/geolocation'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import ProfileScreen from './ProfileScreen'
import { theme } from '../core/theme'
import FindRideScreen from './FindRideScreen'
import TicketsScreen from './TicketsScreen'
import { useAuth } from '../providers/auth'
import AuthController from '../api/auth'
import OrderController from '../api/orders'

const Tab = createBottomTabNavigator()

export default function HomeScreen({ navigation }) {
  const [isLoading, setLoading] = useState(true)
  const { height, width } = Dimensions.get('window')
  const { getAuthState, handleFcmToken, state } = useAuth()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({
    message: null,
    isError: false,
  })
  const [notificationData, setNotificationData] = useState({})
  const [mapData, setMapData] = useState({})

  const authController = new AuthController()
  const orderController = new OrderController()

  const onConfirmButtonPressed = async () => {
    setShowAlert(false)
    if (!alertMessage.isError && notificationData.type === 'driver_selection') {
      await orderController
        .accept(notificationData.orderId)
        .then(() => {
          onStationChange(notificationData)
        })
        .catch((err) => {
          setShowAlert(true)
          setAlertMessage({ message: err.data.errors[0], isError: true })
        })
    }
  }

  const onCancelButtonPressed = async () => {
    onStationChange(null)
    setShowAlert(false)
    if (!alertMessage.isError && notificationData.type === 'driver_selection') {
      await orderController.deny(notificationData.orderId)
    }
  }

  function onStationChange(station) {
    if (station) {
      setMapData((prevState) => {
        return {
          ...prevState,
          station: {
            name: station.stopName,
            latitude: parseFloat(station.latitude),
            longitude: parseFloat(station.longitude),
            waypoints: station.waypoints ? station.waypoints : [],
          },
        }
      })
    } else {
      setMapData((prevState) => {
        return {
          ...prevState,
          station: undefined,
        }
      })
    }
  }

  async function redirectIfNotAuthenticated() {
    try {
      const token = await getAuthState()
      if (!token) {
        navigation.navigate('LoginScreen')
      }
    } catch (e) {
      navigation.navigate('LoginScreen')
    }
  }

  const configureBackgroundLocation = () => {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 100,
      notificationTitle: 'iVan Driver',
      notificationText: '???????? ?????????? ?????????? ????????????...',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: false,
      locationProvider:
        Platform.OS === 'android'
          ? BackgroundGeolocation.ACTIVITY_PROVIDER
          : BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      interval: 60 * 1000,
      fastestInterval: 60 * 1000,
      activitiesInterval: 60 * 1000,
      notificationsEnabled: false,
      stopOnStillActivity: false,
      url: 'https://i-van.co/api/v1/drivers/location',
      httpHeaders: {
        Authorization: `Bearer ${state.token}`,
      },
      postTemplate: {
        latitude: '@latitude',
        longitude: '@longitude',
      },
      maxLocations: 1,
      saveBatteryOnBackground: true,
    })
  }

  const configurePushNotification = async () => {
    // check if we have permissions
    let enabled = await messaging().hasPermission({
      provisional: true,
      providesAppNotificationSettings: true,
    })

    if (enabled === messaging.AuthorizationStatus.AUTHORIZED) {
      const fcmToken = await messaging().getToken()
      if (fcmToken) {
        if (!state.fcmToken) {
          await authController.registerDevice(fcmToken)
          await handleFcmToken(fcmToken)
        }
        messaging().onTokenRefresh((token) => {
          if (state.fcmToken !== token) {
            authController.registerDevice(token)
          }
        })
      }
    } else {
      await messaging().requestPermission()
      enabled = await messaging().hasPermission()
      if (!enabled) {
        return false
      }
    }

    return true
  }

  useEffect(async () => {
    setLoading(true)
    await redirectIfNotAuthenticated(navigation)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setShowAlert(true)
      setAlertMessage({
        isError: true,
        message: '???? ???????? ???? ?????????????? ???? ?????????? ???????? ???????????? ???????????? iVan Driver',
      })
    } else {
      Geolocation.getCurrentPosition(
        async ({ coords }) => {
          setMapData((prevState) => {
            return {
              ...prevState,
              driver: {
                location: {
                  ...coords,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                },
              },
            }
          })
        },
        () => {},
        { enableHighAccuracy: true }
      )

      Geolocation.watchPosition(
        (position) => {
          setMapData((prevState) => {
            return {
              ...prevState,
              driver: {
                location: {
                  ...position.coords,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                },
              },
            }
          })
        },
        (error) => {},
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          distanceFilter: 10,
        }
      )
      messaging().onMessage(async (remoteMessage) => {
        setShowAlert(true)
        setNotificationData(remoteMessage.data)
        onStationChange(remoteMessage.data)
        setAlertMessage({
          message: remoteMessage.notification.body,
          isError: false,
        })
      })

      messaging().onNotificationOpenedApp((remoteMessage) => {
        setShowAlert(true)
        setNotificationData(remoteMessage.data)
        onStationChange(remoteMessage.data)
        setAlertMessage({
          message: remoteMessage.notification.body,
          isError: false,
        })
      })

      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            setShowAlert(true)
            setNotificationData(remoteMessage.data)
            onStationChange(remoteMessage.data)
            setAlertMessage({
              message: remoteMessage.notification.body,
              isError: false,
            })
          }
        })

      // If using other push notification providers (ie Amazon SNS, etc)
      // you may need to get the APNs token instead for iOS:
      // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

      configurePushNotification()
      configureBackgroundLocation()
    }
    setLoading(false)
    return () => {
      setMapData({})
      setShowAlert(false)
      setAlertMessage({
        message: null,
        isError: false,
      })
      BackgroundGeolocation.events.forEach((event) =>
        BackgroundGeolocation.removeAllListeners(event)
      )
    }
    // Listen to whether the token changes
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
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="????????????"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.secondary,
        }}
      >
        <Tab.Screen
          name="????????????"
          children={() => (
            <FindRideScreen
              mapData={mapData}
              onStationChange={onStationChange}
            />
          )}
          // component={FindRideScreen}
          options={{
            tabBarLabel: '????????????',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bus" color={color} size={size} />
            ),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          mapData={mapData}
          name="??????????????"
          children={() => <TicketsScreen mapData={mapData} />}
          options={{
            tabBarLabel: '??????????????',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="ticket" color={color} size={size} />
            ),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          name="????????????"
          component={ProfileScreen}
          options={{
            tabBarLabel: '????????????',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tab.Navigator>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="??????????"
        message={alertMessage.message}
        closeOnHardwareBackPress={false}
        showConfirmButton
        showCancelButton={!alertMessage.isError}
        confirmText="????????"
        cancelText="????????"
        confirmButtonStyle={{ fontWeight: 'bold' }}
        titleStyle={{
          color: theme.colors.primary,
          fontWeight: 'bold',
        }}
        messageStyle={{
          fontWeight: 'bold',
          fontSize: 15,
        }}
        cancelButtonColor="red"
        confirmButtonColor={theme.colors.primary}
        closeOnTouchOutside={false}
        onConfirmPressed={() => onConfirmButtonPressed()}
        onCancelPressed={() => onCancelButtonPressed()}
      />
    </View>
  )
}
