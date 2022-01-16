export const LOGGED_IN = `auth/LOGGED_IN`
export const PROFILE_UPDATE = `auth/PROFILE_UPDATE`
export const FCM_TOKEN_UPDATE = `auth/FCM_TOKEN_UPDATE`
export const LOGGED_OUT = `auth/LOGGED_OUT`

export const initialState = {
  isLoggedIn: false,
  profile: {},
  fcmToken: null,
}

// REDUCER
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGGED_IN: {
      const { profile } = action
      return { ...state, isLoggedIn: true, profile }
    }

    case PROFILE_UPDATE: {
      const { profile } = action
      return { ...state, isLoggedIn: true, profile }
    }

    case FCM_TOKEN_UPDATE: {
      const { fcmToken } = action
      return { ...state, isLoggedIn: true, fcmToken }
    }

    case LOGGED_OUT: {
      return { ...state, ...initialState }
    }

    default:
      return state
  }
}

export default authReducer
