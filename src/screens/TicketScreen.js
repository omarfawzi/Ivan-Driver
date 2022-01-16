import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import AwesomeAlert from 'react-native-awesome-alerts'
import BackButton from '../components/BackButton'
import Background from '../components/Background'
import { theme } from '../core/theme'
import Button from '../components/Button'
import TicketController from '../api/tickets'

export default function TicketScreen({ route, navigation }) {
  const [isLoading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { height, width } = Dimensions.get('window')
  const { ticketId } = route.params
  const [ticket, setTicket] = useState(null)
  const [alertMessage, setAlertMessage] = useState({
    isError: false,
    message: null,
  })
  const [showAlert, setShowAlert] = useState(false)
  const ticketController = new TicketController()

  const getTicket = async () => {
    const result = await ticketController.getTicket(ticketId)
    setTicket(result)
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    const result = await ticketController.getTicket(ticketId)
    setTicket(result)
    setRefreshing(false)
  }

  useEffect(() => {
    if (!ticket) {
      getTicket()
    }
  }, [])

  const onCancelPressed = async () => {
    setLoading(true)
    try {
      await ticketController.cancelTicket(ticketId)
      setShowAlert(true)
      setAlertMessage({
        isError: false,
        message: 'Ticket cancelled successfully.',
      })
      const result = await ticketController.getTicket(ticketId)
      setTicket(result)
    } catch (e) {
      setShowAlert(true)
      setAlertMessage({ isError: true, message: e.data.errors[0] })
      const result = await ticketController.getTicket(ticketId)
      setTicket(result)
    }
    setLoading(false)
  }

  const onConfirmPressed = async () => {
    setShowAlert(false)
    setAlertMessage({ isError: false, message: null })
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
      <BackButton goBack={navigation.goBack} />
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  ) : (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginHorizontal: 50 }}>
            <Image
              style={styles.productImg}
              source={require('../assets/ticket.png')}
            />
            <Text style={styles.name}>Number #{ticketId}</Text>
            <Text style={styles.description}>
              <Text>Fare:</Text>
              <Text style={styles.price}> {ticket.fare} EGP</Text>
            </Text>
            <Text style={styles.description}>
              <Text>Van Model:</Text>
              <Text style={styles.descriptionValue}>
                {ticket.driver.van.model}
              </Text>
            </Text>
            <Text style={styles.description}>
              <Text>Van Number:</Text>
              <Text style={styles.descriptionValue}>
                {' '}
                {ticket.driver.van.plate_number}{' '}
              </Text>
            </Text>
            <Text style={styles.description}>
              <Text>Driver: </Text>
              <Text style={styles.descriptionValue}> {ticket.driver.name}</Text>
            </Text>
            <Text style={styles.description}>
              <Text>Status: </Text>
              <Text style={styles.descriptionValue}>{ticket.status}</Text>
            </Text>
          </View>
          <View style={styles.cancelContainer}>
            {ticket.status === 'issued' ? (
              <View>
                <Button mode="contained" onPress={onCancelPressed}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={onCancelPressed}>
                  Track
                </Button>
              </View>
            ) : null}
          </View>
        </ScrollView>
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title={alertMessage.isError ? 'Error' : 'Info'}
          message={alertMessage.message}
          closeOnHardwareBackPress={false}
          showConfirmButton
          confirmText="OK"
          confirmButtonStyle={{ fontWeight: 'bold' }}
          titleStyle={{
            color: alertMessage.isError ? 'red' : theme.colors.primary,
            fontWeight: 'bold',
          }}
          messageStyle={{
            fontWeight: 'bold',
            fontSize: 15,
          }}
          confirmButtonColor={
            alertMessage.isError ? 'red' : theme.colors.primary
          }
          closeOnTouchOutside={false}
          onConfirmPressed={onConfirmPressed}
        />
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
  },
  productImg: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  name: {
    fontSize: 22,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  price: {
    textAlign: 'center',
    color: '#34791d',
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginTop: 10,
    color: theme.colors.secondary,
    fontWeight: 'bold',
  },
  descriptionValue: {
    color: '#000',
    fontWeight: 'normal',
  },
  star: {
    width: 40,
    height: 40,
  },
  btnColor: {
    height: 30,
    width: 30,
    borderRadius: 30,
    marginHorizontal: 3,
  },
  btnSize: {
    height: 40,
    width: 40,
    borderRadius: 40,
    borderColor: '#778899',
    borderWidth: 1,
    marginHorizontal: 3,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    justifyContent: 'center',
    marginHorizontal: 30,
    flexDirection: 'row',
    marginTop: 20,
  },
  contentColors: {
    justifyContent: 'center',
    marginHorizontal: 30,
    flexDirection: 'row',
    marginTop: 20,
  },
  contentSize: {
    justifyContent: 'center',
    marginHorizontal: 30,
    flexDirection: 'row',
    marginTop: 20,
  },
  separator: {
    height: 2,
    backgroundColor: '#eeeeee',
    marginTop: 20,
    marginHorizontal: 30,
  },
  cancelContainer: {
    marginHorizontal: 30,
    marginTop: 20,
  },
})
