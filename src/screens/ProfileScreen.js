import React, { useState } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View } from 'react-native'
import Background from '../components/Background'
import Logo from '../components/Logo'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import { nameValidator } from '../helpers/nameValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import Header from '../components/Header'
import AuthController from '../api/auth'
import { useAuth } from '../providers/auth'
import { theme } from '../core/theme'

export default function ProfileScreen({ navigation }) {
  const [isLoading, setLoading] = useState(false)
  const { height, width } = Dimensions.get('window')
  const { handleLogout, state, handleProfileUpdate } = useAuth()

  const [name, setName] = useState({ value: state.profile.name, error: '' })
  const [mobile, setMobile] = useState({
    value: state.profile.mobile,
    error: '',
  })
  const [password, setPassword] = useState({ value: '', error: '' })

  const onProfileUpdatePressed = async () => {
    const nameError = nameValidator(name.value)
    const passwordError = passwordValidator(password.value)
    if (nameError && name.value) {
      setName({ ...name, error: nameError })
      return
    }
    if (password.value && passwordError) {
      setPassword({ ...password, error: passwordError })
      return
    }
    if (!password.value && !name.value) {
      return
    }
    setLoading(true)
    try {
      const profile = await new AuthController().updateProfile(
        name.value,
        password.value
      )
      await handleProfileUpdate(profile)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      if (error.data.password) {
        setPassword({ ...mobile, error: error.data.password[0] })
        return
      }
      if (error.data.name) {
        setMobile({ ...name, error: error.data.mobile[0] })
        return
      }
      alert(
        'Error happened, please check your internet connection and try again.'
      )
    }
  }

  const onLogoutPressed = async () => {
    try {
      await new AuthController().logout()
    } catch (error) {}
    try {
      await handleLogout()

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
        <Header> Profile </Header>
        <TextInput
          label="Name"
          returnKeyType="next"
          value={name.value}
          onChangeText={(text) => setName({ value: text, error: '' })}
          error={!!name.error}
          errorText={name.error}
        />
        <TextInput
          label="Mobile"
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
        <TextInput
          label="New Password"
          returnKeyType="done"
          value={password.value}
          onChangeText={(text) => setPassword({ value: text, error: '' })}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry
        />
        <Button
          mode="contained"
          onPress={onProfileUpdatePressed}
          style={{ marginTop: 24 }}
        >
          Update
        </Button>
        <Button mode="outlined" onPress={() => onLogoutPressed()}>
          Logout
        </Button>
      </Background>
    </ScrollView>
  )
}
