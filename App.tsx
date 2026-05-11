import React from 'react';
import { View, StyleSheet } from 'react-native';
import OrderScreen from './screens/OrderScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <OrderScreen onBack={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});