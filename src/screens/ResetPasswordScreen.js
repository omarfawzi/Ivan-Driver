import React, { useState } from 'react'
import Background from '../components/Background'
import BackButton from '../components/BackButton'
import Logo from '../components/Logo'
import Header from '../components/Header'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import { mobileValidator } from '../helpers/mobileValidator'

export default function ResetPasswordScreen({ navigation }) {
  const [mobile, setMobile] = useState({ value: '', error: '' })

  const sendResetPasswordEmail = () => {
    const mobileError = mobileValidator(mobile.value)
    if (mobileError) {
      setMobile({ ...mobile, error: mobileError })
      return
    }
    navigation.navigate('LoginScreen')
  }

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Restore Password</Header>
      <TextInput
        label="Mobile"
        returnKeyType="done"
        value={mobile.value}
        onChangeText={(text) => setMobile({ value: text, error: '' })}
        error={!!mobile.error}
        errorText={mobile.error}
        autoCapitalize="none"
        autoCompleteType="tel"
        textContentType="telephoneNumber"
        keyboardType="phone-pad"
      />
      <Button
        mode="contained"
        onPress={sendResetPasswordEmail}
        style={{ marginTop: 16 }}
      >
        Restore
      </Button>
    </Background>
  )
}
