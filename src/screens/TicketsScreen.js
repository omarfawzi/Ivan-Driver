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
  ScrollView,
} from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { getPreciseDistance } from 'geolib'
import { theme } from '../core/theme'
import { useAuth } from '../providers/auth'
import TicketController from '../api/tickets'

const DISTANCE_LIMIT_IN_METERS = 100

export default function TicketsScreen({ mapData }) {
  const [isLoading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { height, width } = Dimensions.get('window')
  const [tickets, setTickets] = useState(null)
  const [pickUpStation, setPickUpStation] = useState(null)
  const { handleLogout } = useAuth()

  const ticketController = new TicketController()

  const statusTranslator = (status) => {
    if (status === 'issued') {
      return 'تم اصدار التذكرة'
    }
    if (status === 'confirmed') {
      return 'تم تأكيد الركوب'
    }
    return status
  }

  const getTickets = async () => {
    const result = await ticketController.getTickets()
    if (result && result.tickets) {
      setTickets(result.tickets)
    } else {
      setTickets([])
    }
    if (result && result.pickUpStation) {
      setPickUpStation(result.pickUpStation)
    } else {
      setPickUpStation(null)
    }
    setLoading(false)
    return result
  }

  const collectTicket = async (ticketId) => {
    setLoading(true)
    await ticketController.collectTicket(ticketId)
    await getTickets()
    setLoading(false)
  }

  const rejectTicket = async (ticketId) => {
    setLoading(true)
    await ticketController.rejectTicket(ticketId)
    await getTickets()
    setLoading(false)
  }

  const confirmTicket = async (ticketId) => {
    setLoading(true)
    await ticketController.confirmTicket(ticketId)
    await getTickets()
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await getTickets()
    setRefreshing(false)
  }

  const isCloseToPickupStation = (currentLocation, station) => {
    return (
      getPreciseDistance(currentLocation, station) <= DISTANCE_LIMIT_IN_METERS
    )
  }

  useEffect(() => {
    getTickets()
    return () => {
      setTickets(null)
    }
  }, [])

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
  ) : !tickets || tickets.length === 0 ? (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
    >
      <Image
        style={styles.noOrdersImage}
        source={require('../assets/no-order.png')}
      />
    </ScrollView>
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
      data={tickets}
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
              <Text style={styles.name}>رقم التذكرة {item.id}#</Text>
              <Text style={styles.other}>
                الحالة: {statusTranslator(item.status)}
              </Text>
              <Text style={styles.other}>عدد المقاعد: {item.seats}</Text>
              <Text style={styles.other}>الأجرة: {item.fare}</Text>
              <Text style={styles.other}>اسم العميل: {item.customer.name}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  paddingTop: 10,
                }}
              >
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    rejectTicket(item.id)
                  }}
                >
                  <MaterialCommunityIcon size={20} name="close" />
                  <Text style={styles.buttonText}>رفض التذكرة</Text>
                </TouchableOpacity>
                {item.status === 'confirmed' ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      collectTicket(item.id)
                    }}
                  >
                    <MaterialCommunityIcon size={20} name="check" />
                    <Text style={styles.buttonText}>تأكيد النزول</Text>
                  </TouchableOpacity>
                ) : null}
                {mapData &&
                mapData.driver &&
                pickUpStation &&
                isCloseToPickupStation(
                  mapData.driver.location,
                  pickUpStation
                ) &&
                item.status === 'issued' ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      confirmTicket(item.id)
                    }}
                  >
                    <MaterialCommunityIcon size={20} name="check" />
                    <Text style={styles.buttonText}>تأكيد الركوب</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
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
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#ebf0f7',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    flex: 1,
  },
  card: {
    flex: 1,
    shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    borderRadius: 30,
  },
  name: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: theme.colors.primary,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  other: {
    fontSize: 12,
    alignSelf: 'flex-end',
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  button: {
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
    alignSelf: 'flex-end',
  },
  rejectButton: {
    width: 105,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'red',
    borderWidth: 1,
    color: 'white',
    borderColor: '#dcdcdc',
    alignSelf: 'flex-start',
    right: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 10,
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
