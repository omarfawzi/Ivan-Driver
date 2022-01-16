import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import { theme } from '../core/theme'
import { useAuth } from '../providers/auth'
import OrderController from '../api/orders'

export default function OrdersScreen({ navigation }) {
  const [isLoading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { height, width } = Dimensions.get('window')
  const [orders, setOrders] = useState([])
  const { handleLogout } = useAuth()

  const orderController = new OrderController(navigation, handleLogout)

  const getOrders = async () => {
    const result = await orderController.getOrders()
    setOrders(result)
    setLoading(false)
  }

  useEffect(() => {
    getOrders()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    const result = await orderController.getOrders()
    setOrders(result)
    setRefreshing(false)
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
  ) : orders.length === 0 ? (
    <View style={styles.container}>
      <Image
        style={styles.noOrdersImage}
        source={require('../assets/no-order.png')}
      />
    </View>
  ) : (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      enableEmptySections
      data={orders}
      keyExtractor={(item) => {
        return item.id
      }}
      renderItem={({ item }) => {
        return (
          <TouchableOpacity style={styles.card} disabled>
            <Image
              style={styles.image}
              source={require('../assets/request.png')}
            />
            <View style={styles.cardContent}>
              <Text style={styles.name}>Order #{item.id}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>
              {item.status === 'processed' && item.ticket ? (
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      navigation.navigate('TicketScreen', {
                        ticketId: item.ticket.id,
                      })
                    }}
                  >
                    <MaterialCommunityIcon
                      size={20}
                      name="ticket-account"
                      style={{ width: 25, height: 19 }}
                    />
                    <Text style={styles.buttonText}>Ticket</Text>
                  </TouchableOpacity>
                  {item.ticket.status === 'issued' ? (
                    <TouchableOpacity
                      style={styles.locationButton}
                      onPress={() => {
                        navigation.navigate('DriverTrackingScreen', {
                          ticketId: item.ticket_id,
                        })
                      }}
                    >
                      <Entypo
                        size={20}
                        name="location"
                        style={{ width: 25, height: 19 }}
                      />
                      <Text style={styles.locationButtonText}>Track</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersImage: {
    width: 300,
    resizeMode: 'center',
    height: '100%',
    alignSelf: 'center',
  },
  cardContent: {
    marginLeft: 20,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#ebf0f7',
  },
  card: {
    shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    borderRadius: 30,
  },
  name: {
    fontSize: 18,
    flex: 1,
    alignSelf: 'flex-start',
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    flex: 1,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 5,
    height: 35,
    width: 105,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    color: 'white',
    borderColor: '#dcdcdc',
    marginHorizontal: 12,
    right: 17,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 12,
    // lineHeight: 26,
  },
  locationButton: {
    marginTop: 5,
    height: 35,
    width: 105,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#82ea59',
    borderWidth: 1,
    color: 'white',
    borderColor: '#dcdcdc',
    right: 20,
  },
  locationButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
})
