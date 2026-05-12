import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import OrdersScreen from './screens/OrdersScreen';
import WalletScreen from './screens/WalletScreen';
import CansScreen from './screens/CansScreen';
import ProfileScreen from './screens/ProfileScreen';
import OrderScreen from './screens/OrderScreen';

export default function App() {
  const [tab, setTab] = useState('home');
  const [ordering, setOrdering] = useState(false);

  if (ordering) {
    return <OrderScreen onBack={() => setOrdering(false)} />;
  }

  return (
    <View style={styles.container}>
      {tab === 'home'    && <HomeScreen onOrder={() => setOrdering(true)} onTabChange={setTab} />}
      {tab === 'orders'  && <OrdersScreen onTabChange={setTab} />}
      {tab === 'wallet'  && <WalletScreen onTabChange={setTab} />}
      {tab === 'cans'    && <CansScreen onTabChange={setTab} />}
      {tab === 'profile' && <ProfileScreen onTabChange={setTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});