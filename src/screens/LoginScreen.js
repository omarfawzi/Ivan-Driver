import React, { useState } from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  Dimensions,
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
import Header from '../components/Header'
import AuthController from '../api/auth'
import { useAuth } from '../providers/auth'

export default function LoginScreen({ navigation }) {
  const [isLoading, setLoading] = useState(false)
  const { height, width } = Dimensions.get('window')
  const { handleLogin } = useAuth()

  const onLoginPressed = async () => {
    const mobileError = mobileValidator(mobile.value)
    const passwordError = passwordValidator(password.value)
    if (mobileError || passwordError) {
      setMobile({ ...mobile, error: mobileError })
      setPassword({ ...password, error: passwordError })
      return
    }

    setLoading(true)

    try {
      const res = await new AuthController().login(mobile.value, password.value)
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
      alert(
        'Error happened, please check your internet connection and try again.'
      )
    }
  }

  const [mobile, setMobile] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })

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
      <Header>Login</Header>
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
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPasswordScreen')}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
})
