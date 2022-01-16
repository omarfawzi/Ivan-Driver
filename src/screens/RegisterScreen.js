import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { Text } from 'react-native-paper'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { mobileValidator } from '../helpers/mobileValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { nameValidator } from '../helpers/nameValidator'
import Header from '../components/Header'
import { useAuth } from '../providers/auth'
import AuthController from '../api/auth'

export default function RegisterScreen({ navigation }) {
  const { handleLogout } = useAuth()
  const [isLoading, setLoading] = useState(false)
  const { height, width } = Dimensions.get('window')
  const { handleLogin } = useAuth()
  const [name, setName] = useState({ value: '', error: '' })
  const [mobile, setMobile] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value)
    const mobileError = mobileValidator(mobile.value)
    const passwordError = passwordValidator(password.value)
    if (mobileError || passwordError || nameError) {
      setName({ ...name, error: nameError })
      setMobile({ ...mobile, error: mobileError })
      setPassword({ ...password, error: passwordError })
      return
    }
    setLoading(true)

    try {
      const res = await new AuthController().register(
        name.value,
        mobile.value,
        password.value
      )
      await handleLogin(res.access_token, res.profile)
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
      if (error.data.password) {
        setPassword({ ...password, error: error.data.password[0] })
        return
      }
      if (error.data.mobile) {
        setMobile({ ...mobile, error: error.data.mobile[0] })
        return
      }
      if (error.data.name) {
        setName({ ...name, error: error.data.name[0] })
        return
      }
      alert(
        'Error happened, please check your internet connection and try again.'
      )
    }
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
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Register</Header>
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
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24 }}
      >
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
})
