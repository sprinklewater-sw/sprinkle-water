import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const recentOrders = [
  { date: 'Today, 1:20 PM', canCount: '1 Can (20L)', status: 'Delivered' },
  { date: 'Today, 10:05 AM', canCount: '2 Cans (40L)', status: 'Pending' },
  { date: 'Yesterday, 6:45 PM', canCount: '1 Can (20L)', status: 'Delivered' },
];

const statItems = [
  { icon: '🧾', value: '12', label: "Today's Orders" },
  { icon: '🚚', value: '24', label: 'Active Vendors' },
  { icon: '⏱️', value: '18 min', label: 'Delivery Time' },
];

export default function App() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <LinearGradient colors={['#0A1628', '#1E3A5F']} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>
              💧 <Text style={styles.logoStart}>Sprinkle</Text>{' '}
              <Text style={styles.logoEnd}>Water</Text>
            </Text>
            <Text style={styles.tagline}>Pure • Fresh • Delivered</Text>
            <Text style={styles.title}>Get Fresh Water Delivered</Text>
            <Text style={styles.subtitle}>
              Clean drinking water cans delivered lightning-fast across Bengaluru.
            </Text>
          </View>

          <BlurView intensity={30} tint="dark" style={styles.glassCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.label}>Delivering to</Text>
                <Text style={styles.address}>📍 Indiranagar, Bengaluru 560038</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85}>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          <LinearGradient colors={['#1E90FF', '#00D4FF']} style={styles.orderButton}>
            <TouchableOpacity style={styles.orderButtonTouch} activeOpacity={0.9}>
              <Animated.Text
                style={[styles.waterDrop, { transform: [{ scale: pulseAnim }] }]}
              >
                💧
              </Animated.Text>
              <Text style={styles.orderButtonText}>Order Water Can ₹50</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.statsRow}>
            {statItems.map((item) => (
              <BlurView intensity={26} tint="dark" style={styles.statCard} key={item.label}>
                <Text style={styles.statIcon}>{item.icon}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </BlurView>
            ))}
          </View>

          <Text style={styles.recentTitle}>Recent Orders</Text>
          {recentOrders.map((order) => (
            <BlurView intensity={28} tint="dark" style={styles.orderCard} key={order.date}>
              <LinearGradient colors={['#45A7FF', '#00D4FF']} style={styles.leftAccent} />
              <View style={styles.orderDetails}>
                <Text style={styles.orderDate}>{order.date}</Text>
                <Text style={styles.orderCan}>{order.canCount}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  order.status === 'Delivered' ? styles.delivered : styles.pending,
                ]}
              >
                <Text style={styles.badgeText}>{order.status}</Text>
              </View>
            </BlurView>
          ))}
        </ScrollView>

        <BlurView intensity={32} tint="dark" style={styles.bottomNav}>
          {['🏠 Home', '📦 Orders', '🚚 Vendors', '👤 Profile'].map((tab, index) => (
            <View style={[styles.tabItem, index === 0 && styles.activeTab]} key={tab}>
              <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>{tab}</Text>
            </View>
          ))}
        </BlurView>
      </SafeAreaView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  header: {
    marginTop: 12,
    marginBottom: 16,
  },
  logo: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#DDF4FF',
  },
  logoStart: {
    color: '#5FAEFF',
  },
  logoEnd: {
    color: '#7CF6FF',
  },
  tagline: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 1.2,
    color: 'rgba(226, 244, 255, 0.72)',
  },
  title: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    color: '#F6FCFF',
    letterSpacing: 0.7,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 23,
    color: 'rgba(219, 241, 255, 0.72)',
    letterSpacing: 0.3,
  },
  glassCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: 'rgba(218, 240, 255, 0.7)',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  address: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  changeButton: {
    color: '#00D4FF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.7,
  },
  orderButton: {
    marginTop: 18,
    borderRadius: 999,
    shadowColor: '#00AFFF',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  orderButtonTouch: {
    borderRadius: 999,
    minHeight: 72,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  waterDrop: {
    fontSize: 22,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statsRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statLabel: {
    marginTop: 3,
    color: 'rgba(222, 242, 255, 0.75)',
    fontSize: 11,
    letterSpacing: 0.35,
    textAlign: 'center',
  },
  recentTitle: {
    marginTop: 24,
    marginBottom: 12,
    color: '#F5FCFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  orderCard: {
    borderRadius: 24,
    marginBottom: 12,
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  leftAccent: {
    width: 6,
    alignSelf: 'stretch',
  },
  orderDetails: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  orderDate: {
    color: '#D5EDFF',
    fontSize: 13,
    letterSpacing: 0.25,
  },
  orderCan: {
    color: '#FFFFFF',
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badge: {
    marginRight: 14,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  delivered: {
    backgroundColor: 'rgba(50, 205, 50, 0.25)',
  },
  pending: {
    backgroundColor: 'rgba(255, 165, 0, 0.26)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 20, 36, 0.68)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(30, 144, 255, 0.22)',
    shadowColor: '#1E90FF',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  tabText: {
    color: 'rgba(204, 232, 252, 0.86)',
    fontSize: 12,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#B8EEFF',
    fontWeight: '800',
  },
});
