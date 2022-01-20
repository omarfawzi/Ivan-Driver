class NotificationHandler {
  constructor(navigator) {
    this.navigator = navigator
  }

  handleNotification(remoteMessage) {
    if (!this.navigator) {
      return
    }
    this.navigator.navigate('HomeScreen', {
      screen: 'الرحلة',
    })
  }
}

module.exports = NotificationHandler
