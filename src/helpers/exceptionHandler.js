export function handler(error) {
  const { response } = error
  const { request, ...errorObject } = response
  return errorObject
}

export async function redirectIfUnauthorized(error, navigation, handleLogout) {
  if (error.status != 401) {
    return
  }
  await handleLogout()

  navigation.reset({
    index: 0,
    routes: [{ name: 'StartScreen' }],
  })
}
