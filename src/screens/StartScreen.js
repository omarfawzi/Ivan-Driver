import React, { useEffect } from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import { useAuth } from '../providers/auth'

export default function StartScreen({ navigation }) {
  const { getAuthState } = useAuth()

  async function redirectIfNotAuthenticated() {
    try {
      const token = await getAuthState()
      if (token) {
        navigation.navigate('HomeScreen')
      }
    } catch (e) {
      navigation.navigate('StartScreen')
    }
  }
  useEffect(() => {
    redirectIfNotAuthenticated()
  }, [])

  return (
    <Background>
      <Logo />
      <Header>مرحبا بك في iVan</Header>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        تسجيل الدخول
      </Button>
    </Background>
  )
}
