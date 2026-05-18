import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import VendorLogin from './VendorLogin';
import VendorHome from './VendorHome';
import VendorOrders from './VendorOrders';
import VendorStock from './VendorStock';
import VendorStockOrder from './VendorStockOrder';
import VendorWallet from './VendorWallet';
import VendorProfile from './VendorProfile';

export default function VendorApp() {
  const [tab, setTab] = useState('home');
  const [loggedIn, setLoggedIn] = useState(false);
  const [stockOrdering, setStockOrdering] = useState(false);

  if (!loggedIn) {
    return <VendorLogin onLoginSuccess={() => setLoggedIn(true)} />;
  }

  if (stockOrdering) {
    return <VendorStockOrder onTabChange={(t) => { setStockOrdering(false); setTab(t); }} />;
  }

  return (
    <View style={styles.container}>
      {tab === 'home'    && <VendorHome    onTabChange={setTab} />}
      {tab === 'orders'  && <VendorOrders  onTabChange={setTab} />}
      {tab === 'stock'   && <VendorStock   onTabChange={setTab} onOrderStock={() => setStockOrdering(true)} />}
      {tab === 'wallet'  && <VendorWallet  onTabChange={setTab} />}
      {tab === 'profile' && <VendorProfile onTabChange={setTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});