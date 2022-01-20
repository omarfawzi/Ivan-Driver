import React, { useEffect, useState } from 'react'
import { View, Alert } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import messaging from '@react-native-firebase/messaging'
import AwesomeAlert from 'react-native-awesome-alerts'
import ProfileScreen from './ProfileScreen'
import { theme } from '../core/theme'
import FindRideScreen from './FindRideScreen'
import TicketsScreen from './TicketsScreen'
import { useAuth } from '../providers/auth'
import NotificationHandler from '../handlers/NotificationHandler'
import AuthController from '../api/auth'

const Tab = createBottomTabNavigator()

export default function HomeScreen({ navigation }) {
  const { getAuthState, handleFcmToken, state } = useAuth()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({
    isError: false,
    message: null,
  })
  const authController = new AuthController()

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

  useEffect(() => {
    redirectIfNotAuthenticated(navigation)
  }, [])
  useEffect(() => {
    messaging().onMessage(async (remoteMessage) => {
      // new NotificationHandler(navigator.current).handleNotification(
      //   remoteMessage
      // )
      setShowAlert(true)
      setAlertMessage({
        isError: false,
        message: remoteMessage.notification.body,
      })
    })

    messaging().onNotificationOpenedApp((remoteMessage) => {
      // new NotificationHandler(navigator.current).handleNotification(
      //   remoteMessage
      // )
      setShowAlert(true)
      setAlertMessage({
        isError: false,
        message: remoteMessage.notification.body,
      })
    })

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          // new NotificationHandler(navigator.current).handleNotification(
          //   remoteMessage
          // )
          setShowAlert(true)
          setAlertMessage({
            isError: false,
            message: remoteMessage.notification.body,
          })
        }
      })

    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

    // Listen to whether the token changes
    configurePushNotification()
  }, [])
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="الرحلة"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.secondary,
        }}
      >
        <Tab.Screen
          name="الرحلة"
          component={FindRideScreen}
          options={{
            tabBarLabel: 'الرحلة',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bus" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
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
        confirmText="OK"
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
        onConfirmPressed={() => {
          setShowAlert(false)
        }}
        onCancelPressed={() => {
          setShowAlert(false)
        }}
      />
    </View>
  )
}
