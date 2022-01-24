import React, { useState } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View } from 'react-native'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import Background from '../components/Background'
import Logo from '../components/Logo'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import Header from '../components/Header'
import AuthController from '../api/auth'
import { useAuth } from '../providers/auth'
import { theme } from '../core/theme'

export default function ProfileScreen({ navigation }) {
  const [isLoading, setLoading] = useState(false)
  const { height, width } = Dimensions.get('window')
  const { handleLogout, state } = useAuth()

  const [name, setName] = useState({ value: state.profile.name, error: '' })
  const [mobile, setMobile] = useState({
    value: state.profile.mobile,
    error: '',
  })

  const onLogoutPressed = async () => {
    setLoading(true)
    try {
      await new AuthController().logout()
    } catch (error) {}
    try {
      await handleLogout()
      await BackgroundGeolocation.stop()
      setLoading(false)
      navigation.reset({
        index: 0,
        routes: [{ name: 'StartScreen' }],
      })
    } catch (error) {}
  }

  return isLoading ? (
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
  ) : (
    <ScrollView>
      <Background>
        <Logo />
        <Header> الحساب </Header>
        <TextInput
          label="الاسم"
          returnKeyType="next"
          value={name.value}
          onChangeText={(text) => setName({ value: text, error: '' })}
          error={!!name.error}
          errorText={name.error}
          disabled
        />
        <TextInput
          label="رقم الموبايل"
          returnKeyType="next"
          value={mobile.value}
          onChangeText={(text) => setMobile({ value: text, error: '' })}
          error={!!mobile.error}
          errorText={mobile.error}
          autoCapitalize="none"
          autoCompleteType="tel"
          textContentType="telephoneNumber"
          keyboardType="phone-pad"
          disabled
        />
        <Button mode="outlined" onPress={() => onLogoutPressed()}>
          تسجيل الخروج
        </Button>
      </Background>
    </ScrollView>
  )
}
