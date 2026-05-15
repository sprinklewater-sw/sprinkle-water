import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import VendorBottomNav from './VendorBottomNav';

interface Props { onTabChange?: (tab: string) => void; }

const VENDOR_ID = '00000000-0000-0000-0000-000000000002';

export default function VendorOrders({ onTabChange }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrip, setActiveTrip] = useState(false);
  const [completedStops, setCompletedStops] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [emptyCans, setEmptyCans] = useState<Record<string, number>>({});

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'confirmed', 'out_for_delivery'])
        .order('created_at', { ascending: true })
        .limit(5);
      if (data) setOrders(data);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (orderId: string) => {
    try {
      const cans = emptyCans[orderId] || 0;
      await supabase
        .from('orders')
        .update({ status: 'delivered', payment_status: 'paid' })
        .eq('id', orderId);

      // Update stock
      await supabase
        .from('vendor_stock')
        .update({
          empty_cans_with_vendor: cans,
        })
        .eq('vendor_id', VENDOR_ID);

      setCompletedStops(prev => prev + 1);
      loadOrders();
      Alert.alert('✅ Delivered!', `Order marked as delivered. ${cans} empty cans collected.`);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HD} />
      <View style={s.header}>
        <Text style={s.title}>Orders & Deliveries</Text>
        <Text style={s.sub}>{orders.length} active orders</Text>
      </View>

      {/* TRIP STATUS */}
      {orders.length > 0 && (
        <View style={s.tripBanner}>
          <View style={s.tripLeft}>
            <Text style={s.tripTitle}>
              {activeTrip ? '🚴 Trip in Progress' : '📦 Ready for Trip'}
            </Text>
            <Text style={s.tripSub}>{completedStops}/{orders.length} stops completed</Text>
          </View>
          {!activeTrip && orders.length >= 1 && (
            <TouchableOpacity style={s.startBtn} onPress={() => setActiveTrip(true)}>
              <Text style={s.startBtnTxt}>Start Trip</Text>
            </TouchableOpacity>
          )}
          {activeTrip && (
            <View style={s.progressPills}>
              {orders.map((_, i) => (
                <View key={i} style={[s.progressPill, i < completedStops && s.progressPillDone]} />
              ))}
            </View>
          )}
        </View>
      )}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {loading ? (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTxt}>No active orders</Text>
            <Text style={s.emptySub}>New orders will appear here</Text>
          </View>
        ) : orders.map((order, i) => {
          const open = expandedOrder === order.id;
          const done = i < completedStops;
          return (
            <TouchableOpacity key={i} style={[s.orderCard, done && s.orderCardDone]}
              onPress={() => setExpandedOrder(open ? null : order.id)} activeOpacity={0.8}>
              <View style={s.cardTop}>
                <View style={[s.stopBadge, done && s.stopBadgeDone]}>
                  <Text style={s.stopNum}>{done ? '✓' : i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={s.orderDetail}>{order.quantity} Can{order.quantity > 1 ? 's' : ''} · {order.is_exchange ? 'Exchange' : 'New Can'}</Text>
                  <Text style={s.orderSlot}>🕐 {order.delivery_slot} · 📍 {order.delivery_address}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.orderAmt}>₹{order.amount}</Text>
                  <Text style={s.orderPayment}>{order.payment_method?.includes('Cash') ? '💵 COD' : '📱 Online'}</Text>
                </View>
              </View>

              {open && !done && activeTrip && (
                <View style={s.deliveryActions}>
                  <View style={s.divider} />
                  <Text style={s.deliveryTitle}>Mark as Delivered</Text>

                  {order.delivery_address && (
                    <View style={s.addressCard}>
                      <Text style={s.addressTxt}>📍 {order.delivery_address}, Bengaluru</Text>
                    </View>
                  )}

                  <View style={s.emptyCanRow}>
                    <Text style={s.emptyCanLbl}>Empty cans collected:</Text>
                    <View style={s.emptyCanCounter}>
                      <TouchableOpacity style={s.counterBtn}
                        onPress={() => setEmptyCans(prev => ({ ...prev, [order.id]: Math.max(0, (prev[order.id] || 0) - 1) }))}>
                        <Text style={s.counterBtnTxt}>−</Text>
                      </TouchableOpacity>
                      <Text style={s.counterVal}>{emptyCans[order.id] || 0}</Text>
                      <TouchableOpacity style={s.counterBtn}
                        onPress={() => setEmptyCans(prev => ({ ...prev, [order.id]: (prev[order.id] || 0) + 1 }))}>
                        <Text style={s.counterBtnTxt}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={s.deliverBtn} onPress={() => markDelivered(order.id)}>
                    <Text style={s.deliverBtnTxt}>✅ Mark as Delivered</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={s.failedBtn}>
                    <Text style={s.failedBtnTxt}>⚠️ Customer Not Available</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <VendorBottomNav activeTab="orders" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const HD = '#BF360C'; const OR = '#E65100';
const WH = '#FFFFFF'; const TX = '#1A1A1A'; const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: WH },
  header:          { backgroundColor: HD, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 14, paddingHorizontal: 16, elevation: 5 },
  title:           { fontFamily: SERIF, fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: WH },
  sub:             { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tripBanner:      { backgroundColor: OR, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripLeft:        {},
  tripTitle:       { fontSize: 14, fontWeight: '700', color: WH },
  tripSub:         { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  startBtn:        { backgroundColor: WH, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  startBtnTxt:     { fontSize: 13, fontWeight: '800', color: OR },
  progressPills:   { flexDirection: 'row', gap: 4 },
  progressPill:    { width: 24, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  progressPillDone:{ backgroundColor: WH },
  scroll:          { flex: 1, backgroundColor: '#FFF8F5', paddingHorizontal: 14, paddingTop: 12 },
  empty:           { alignItems: 'center', paddingTop: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 12 },
  emptyTxt:        { fontSize: 16, fontWeight: '700', color: TX, marginBottom: 4 },
  emptySub:        { fontSize: 13, color: MU },
  orderCard:       { backgroundColor: WH, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#FFE0B2', elevation: 2 },
  orderCardDone:   { opacity: 0.6, borderColor: '#C8E6C9' },
  cardTop:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stopBadge:       { width: 32, height: 32, borderRadius: 16, backgroundColor: OR, justifyContent: 'center', alignItems: 'center' },
  stopBadgeDone:   { backgroundColor: '#4CAF50' },
  stopNum:         { fontSize: 14, fontWeight: '800', color: WH },
  orderId:         { fontSize: 10, color: MU, marginBottom: 2 },
  orderDetail:     { fontSize: 13, fontWeight: '700', color: TX, marginBottom: 2 },
  orderSlot:       { fontSize: 10, color: MU },
  orderAmt:        { fontFamily: SERIF, fontSize: 15, fontWeight: '800', color: OR },
  orderPayment:    { fontSize: 10, color: MU, marginTop: 2 },
  deliveryActions: { marginTop: 12 },
  divider:         { height: 1, backgroundColor: '#FFE0B2', marginBottom: 12 },
  deliveryTitle:   { fontFamily: SERIF, fontSize: 15, fontWeight: '700', color: TX, marginBottom: 10 },
  addressCard:     { backgroundColor: '#FFF3E0', borderRadius: 10, padding: 10, marginBottom: 12 },
  addressTxt:      { fontSize: 13, color: TX, fontWeight: '600' },
  emptyCanRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  emptyCanLbl:     { fontSize: 13, fontWeight: '600', color: TX },
  emptyCanCounter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFE0B2', justifyContent: 'center', alignItems: 'center' },
  counterBtnTxt:   { fontSize: 18, fontWeight: '700', color: OR },
  counterVal:      { fontSize: 20, fontWeight: '800', color: TX, minWidth: 30, textAlign: 'center' },
  deliverBtn:      { backgroundColor: OR, borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 8, elevation: 3 },
  deliverBtnTxt:   { fontSize: 14, fontWeight: '700', color: WH },
  failedBtn:       { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 11, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  failedBtnTxt:    { fontSize: 13, fontWeight: '600', color: '#E65100' },
});