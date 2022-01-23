import React, { useEffect, useState } from 'react'
import { View, Alert, ActivityIndicator, Dimensions } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import messaging from '@react-native-firebase/messaging'
import AwesomeAlert from 'react-native-awesome-alerts'
import * as Location from 'expo-location'
import Geolocation from '@react-native-community/geolocation'
import ProfileScreen from './ProfileScreen'
import { theme } from '../core/theme'
import FindRideScreen from './FindRideScreen'
import TicketsScreen from './TicketsScreen'
import { useAuth } from '../providers/auth'
import AuthController from '../api/auth'
import OrderController from '../api/orders'

const Tab = createBottomTabNavigator()

export default function HomeScreen({ navigation }) {
  const [isLoading, setLoading] = useState(false)
  const { height, width } = Dimensions.get('window')
  const { getAuthState, handleFcmToken, state } = useAuth()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({
    message: null,
  })
  const [notificationData, setNotificationData] = useState({})

  const [mapData, setMapData] = useState({})

  const authController = new AuthController()
  const orderController = new OrderController()

  const onConfirmButtonPressed = async () => {
    if (alertMessage && notificationData.type === 'driver_selection') {
      await orderController.accept(notificationData.orderId)
      setMapData({
        ...mapData,
        station: {
          name: notificationData.stopName,
          latitude: parseFloat(notificationData.latitude),
          longitude: parseFloat(notificationData.longitude),
        },
        order: {
          id: notificationData.orderId,
        },
      })
    }
    setShowAlert(false)
  }

  const onCancelButtonPressed = async () => {
    if (alertMessage && notificationData.type === 'driver_selection') {
      await orderController.deny(notificationData.orderId)
    }
    setShowAlert(false)
  }

  async function redirectIfNotAuthenticated() {
    try {
      const token = await getAuthState()
      if (!token) {
        navigation.navigate('StartScreen')
      }
    } catch (e) {
      navigation.navigate('StartScreen')
    }
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
    await redirectIfNotAuthenticated(navigation)
    await Location.requestForegroundPermissionsAsync()
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapData({
          ...mapData,
          driver: {
            location: {
              ...coords,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            },
          },
        })
      },
      () => Alert.alert('تأكد من تفعيل اعدادات موقعك الحالي لتطبيق iVan.'),
      { enableHighAccuracy: true }
    )

    await configurePushNotification()

    messaging().onMessage(async (remoteMessage) => {
      console.log(remoteMessage)
      setShowAlert(true)
      setNotificationData(remoteMessage.data)
      setAlertMessage({
        message: remoteMessage.notification.body,
      })
    })

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(remoteMessage)
      setShowAlert(true)
      setNotificationData(remoteMessage.data)
      setAlertMessage({
        message: remoteMessage.notification.body,
      })
    })

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(remoteMessage)
          setShowAlert(true)
          setNotificationData(remoteMessage.data)
          setAlertMessage({
            message: remoteMessage.notification.body,
          })
        }
      })

    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

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
        initialRouteName="الرحلة"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.secondary,
        }}
      >
        <Tab.Screen
          name="الرحلة"
          children={() => <FindRideScreen mapData={mapData} />}
          // component={FindRideScreen}
          options={{
            tabBarLabel: 'الرحلة',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bus" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          mapData={mapData}
          name="التذاكر"
          component={TicketsScreen}
          options={{
            tabBarLabel: 'التذاكر',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="ticket" color={color} size={size} />
            ),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          name="الحساب"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'الحساب',
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
        title="تنويه"
        message={alertMessage.message}
        closeOnHardwareBackPress={false}
        showConfirmButton
        showCancelButton
        confirmText="حسنا"
        cancelText="أرفض"
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
