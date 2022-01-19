import React, { useRef } from 'react'
import { Provider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { theme } from './src/core/theme'
import {
  StartScreen,
  LoginScreen,
  HomeScreen,
  TicketScreen,
  LoadingScreen,
  DriverTrackingScreen,
} from './src/screens'
import AuthProvider from './src/providers/auth'

const Stack = createStackNavigator()

export default function App() {
  const navigator = useRef()

  return (
    <AuthProvider>
      <Provider theme={theme}>
        <NavigationContainer ref={navigator}>
          <Stack.Navigator
            initialRouteName="LoadingScreen"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
            <Stack.Screen name="StartScreen" component={StartScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="TicketScreen" component={TicketScreen} />
            <Stack.Screen
              name="DriverTrackingScreen"
              component={DriverTrackingScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </AuthProvider>
  )
}
