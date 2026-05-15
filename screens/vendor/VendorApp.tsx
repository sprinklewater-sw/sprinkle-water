import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import VendorHome from './VendorHome';
import VendorOrders from './VendorOrders';
import VendorStock from './VendorStock';
import VendorWallet from './VendorWallet';
import VendorProfile from './VendorProfile';

export default function VendorApp() {
  const [tab, setTab] = useState('home');

  return (
    <View style={styles.container}>
      {tab === 'home'    && <VendorHome    onTabChange={setTab} />}
      {tab === 'orders'  && <VendorOrders  onTabChange={setTab} />}
      {tab === 'stock'   && <VendorStock   onTabChange={setTab} />}
      {tab === 'wallet'  && <VendorWallet  onTabChange={setTab} />}
      {tab === 'profile' && <VendorProfile onTabChange={setTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});