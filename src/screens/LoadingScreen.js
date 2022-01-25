import React, { useEffect } from 'react'
import { ActivityIndicator, Dimensions, View } from 'react-native'
import { useAuth } from '../providers/auth'
import { theme } from '../core/theme'

export default function LoadingScreen({ navigation }) {
  const { getAuthState } = useAuth()
  const { height, width } = Dimensions.get('window')

  async function redirectIfNotAuthenticated() {
    try {
      const token = await getAuthState()
      if (token) {
        navigation.navigate('HomeScreen')
      } else {
        navigation.navigate('LoginScreen')
      }
    } catch (e) {
      navigation.navigate('LoginScreen')
    }
  }
  useEffect(() => {
    redirectIfNotAuthenticated()
  }, [])

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        height,
        width,
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  )
}
