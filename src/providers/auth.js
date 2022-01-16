import React, { useMemo, useReducer, useContext } from 'react'
import * as SecureStore from 'expo-secure-store'
import axios from '../api/index'

import reducer, {
  initialState,
  LOGGED_IN,
  LOGGED_OUT,
  PROFILE_UPDATE,
  FCM_TOKEN_UPDATE,
} from './reducer'

// CONFIG KEYS [Storage Keys]===================================
export const BEARER_TOKEN_KEY = 'ivan_customer_access_token'
export const BEARER_FCM_TOKEN_KEY = 'ivan_customer_fcm_token'
export const PROFILE_KEY = 'ivan_customer_profile'

// CONTEXT ===================================
const AuthContext = React.createContext()

function AuthProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState || {})

  // Get Auth state
  const getAuthState = async () => {
    try {
      // GET TOKEN && USER
      const token = await SecureStore.getItemAsync(BEARER_TOKEN_KEY)
      const profile = await SecureStore.getItemAsync(PROFILE_KEY)
      if (token !== null && profile !== null)
        await handleLogin(token, JSON.parse(profile))
      else await handleLogout()

      return token
    } catch (error) {
      throw new Error(error)
    }
  }

  // Handle Login
  const handleLogin = async (token, profile) => {
    try {
      // STORE DATA
      await SecureStore.setItemAsync(BEARER_TOKEN_KEY, token)
      await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile))

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // DISPATCH TO REDUCER
      dispatch({ type: LOGGED_IN, profile })
    } catch (error) {
      throw new Error(error)
    }
  }

  // Handle Login
  const handleFcmToken = async (fcmToken) => {
    try {
      // STORE DATA
      await SecureStore.setItemAsync(BEARER_FCM_TOKEN_KEY, fcmToken)

      // DISPATCH TO REDUCER
      dispatch({ type: FCM_TOKEN_UPDATE, fcmToken })
    } catch (error) {
      throw new Error(error)
    }
  }

  const handleProfileUpdate = async (profile) => {
    try {
      // STORE DATA
      await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile))

      // DISPATCH TO REDUCER
      dispatch({ type: PROFILE_UPDATE, profile })
    } catch (error) {
      throw new Error(error)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      // REMOVE DATA
      await SecureStore.deleteItemAsync(BEARER_TOKEN_KEY)
      await SecureStore.deleteItemAsync(PROFILE_KEY)

      delete axios.defaults.headers.common['Authorization']

      // DISPATCH TO REDUCER
      dispatch({ type: LOGGED_OUT })
    } catch (error) {
      throw new Error(error)
    }
  }

  const value = useMemo(() => {
    return {
      state,
      getAuthState,
      handleLogin,
      handleLogout,
      handleProfileUpdate,
      handleFcmToken
    }
  }, [state])

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext)
export { AuthContext, useAuth }
export default AuthProvider
