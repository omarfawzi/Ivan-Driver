import React, { useState } from 'react'
import { View, ActivityIndicator, Dimensions, Alert } from 'react-native'
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
      if (error.data && error.data.password) {
        setPassword({ ...password, error: 'كلمة السر غير صحيحة' })
        return
      }
      if (error.data && error.data.mobile) {
        setMobile({ ...mobile, error: 'رقم الموبايل غير صحيح' })
        return
      }
      Alert.alert('حدث خطأ الرجاء التأكد من اتصالك بالانترنت.')
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
      <Header>تسجيل الدخول</Header>
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
      />
      <TextInput
        label="كلمة المرور"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <Button mode="contained" onPress={onLoginPressed}>
        تسجيل الدخول
      </Button>
    </Background>
  )
}
