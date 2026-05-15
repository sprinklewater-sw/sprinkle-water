import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Modal, Animated } from 'react-native';
import { supabase } from '../../lib/supabase';
import VendorBottomNav from './VendorBottomNav';

interface Props { onTabChange?: (tab: string) => void; }

const VENDOR_ID = '00000000-0000-0000-0000-000000000002';

export default function VendorHome({ onTabChange }: Props) {
  const [stock, setStock] = useState({ filled_cans: 20, empty_cans_with_vendor: 5, cans_at_customers: 8, total_delivered_today: 0 });
  const [earnings, setEarnings] = useState({ today: 0, week: 0, pending: 0 });
  const [vendorMargin, setVendorMargin] = useState(37);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);
  const [tripSlots, setTripSlots] = useState(2);
  const [countdown, setCountdown] = useState(60);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    loadData();
    // Simulate incoming order after 3 seconds for demo
    const timer = setTimeout(() => {
      setIncomingOrder({
        id: 'demo-order-001',
        area: 'BTM Layout',
        distance: '800m',
        quantity: 2,
        type: 'Exchange',
        slot: '12–1 PM',
        payment: 'Cash on Delivery',
      });
      setShowOrderAlert(true);
      startCountdown();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadData = async () => {
    try {
      const { data: stockData } = await supabase
        .from('vendor_stock')
        .select('*')
        .eq('vendor_id', VENDOR_ID)
        .single();
      if (stockData) setStock(stockData);

      const { data: marginData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'vendor_margin')
        .single();
      if (marginData) setVendorMargin(Number(marginData.value));

      const { data: ordersData } = await supabase
        .from('orders')
        .select('amount')
        .eq('vendor_id', VENDOR_ID)
        .eq('status', 'delivered');
      if (ordersData) {
        const todayEarnings = ordersData.length * vendorMargin;
        setEarnings({ today: todayEarnings, week: todayEarnings * 6, pending: todayEarnings * 2 });
      }
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const startCountdown = () => {
    let count = 60;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setShowOrderAlert(false);
      }
    }, 1000);
  };

  const acceptOrder = () => {
    setTripSlots(prev => Math.min(prev + 1, 5));
    setShowOrderAlert(false);
    setCountdown(60);
  };

  const rejectOrder = () => {
    setShowOrderAlert(false);
    setCountdown(60);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HD} />

      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>Sprinkle</Text>
          <Text style={s.tagline}>Vendor Dashboard</Text>
        </View>
        <View style={s.hRight}>
          <TouchableOpacity
            style={[s.availBtn, isAvailable && s.availBtnOn]}
            onPress={() => setIsAvailable(!isAvailable)}
          >
            <View style={[s.availDot, isAvailable && s.availDotOn]} />
            <Text style={[s.availTxt, isAvailable && s.availTxtOn]}>
              {isAvailable ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 88 }}>

        {/* VENDOR INFO */}
        <View style={s.vendorCard}>
          <View style={s.vendorLeft}>
            <View style={s.avatar}><Text style={s.avatarTxt}>R</Text></View>
            <View>
              <Text style={s.vendorName}>Raju Kumar</Text>
              <Text style={s.vendorArea}>📍 BTM Layout</Text>
              <View style={s.ratingRow}>
                <Text style={s.ratingStars}>⭐⭐⭐⭐⭐</Text>
                <Text style={s.ratingVal}>4.8</Text>
              </View>
            </View>
          </View>
          <View style={s.tripSlotWrap}>
            <Text style={s.tripSlotLabel}>Trip Slots</Text>
            <Text style={s.tripSlotVal}>{tripSlots}/5</Text>
            <View style={s.tripSlotBar}>
              {[1,2,3,4,5].map(i => (
                <View key={i} style={[s.tripSlotDot, i <= tripSlots && s.tripSlotDotFilled]} />
              ))}
            </View>
          </View>
        </View>

        {/* EARNINGS */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Today's Earnings</Text>
          <View style={s.earningsRow}>
            {[
              { lbl: 'Today', val: `₹${earnings.today}`, clr: OR },
              { lbl: 'This Week', val: `₹${earnings.week}`, clr: '#2E7D32' },
              { lbl: 'Pending', val: `₹${earnings.pending}`, clr: '#1565C0' },
            ].map((e, i) => (
              <View key={i} style={s.earningCard}>
                <Text style={[s.earningVal, { color: e.clr }]}>{e.val}</Text>
                <Text style={s.earningLbl}>{e.lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* STOCK OVERVIEW */}
        <View style={s.sec}>
          <View style={s.secRow}>
            <Text style={s.secTitle}>Stock Overview</Text>
            <TouchableOpacity onPress={() => onTabChange && onTabChange('stock')}>
              <Text style={s.seeAll}>Manage →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.stockGrid}>
            {[
              { icon: '🫙', lbl: 'Filled Cans\nWith Me', val: stock.filled_cans, clr: OR, bg: '#FFF3E0' },
              { icon: '🪣', lbl: 'Empty Cans\nWith Me', val: stock.empty_cans_with_vendor, clr: '#795548', bg: '#EFEBE9' },
              { icon: '🏠', lbl: 'Cans at\nCustomers', val: stock.cans_at_customers, clr: '#1565C0', bg: '#E3F2FD' },
              { icon: '✅', lbl: 'Delivered\nToday', val: stock.total_delivered_today, clr: '#2E7D32', bg: '#E8F5E9' },
            ].map((st, i) => (
              <View key={i} style={[s.stockCard, { backgroundColor: st.bg }]}>
                <Text style={s.stockIcon}>{st.icon}</Text>
                <Text style={[s.stockVal, { color: st.clr }]}>{st.val}</Text>
                <Text style={s.stockLbl}>{st.lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Quick Actions</Text>
          <View style={s.actionGrid}>
            {[
              { icon: '📦', lbl: 'View Orders', action: 'orders' },
              { icon: '🫙', lbl: 'Update Stock', action: 'stock' },
              { icon: '💰', lbl: 'My Wallet', action: 'wallet' },
              { icon: '📊', lbl: 'My Profile', action: 'profile' },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={s.actionCard}
                onPress={() => onTabChange && onTabChange(a.action)}>
                <Text style={s.actionIcon}>{a.icon}</Text>
                <Text style={s.actionLbl}>{a.lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* START TRIP BUTTON */}
        {tripSlots >= 5 && (
          <View style={s.sec}>
            <TouchableOpacity style={s.startTripBtn}
              onPress={() => onTabChange && onTabChange('orders')}>
              <Text style={s.startTripTxt}>🚴 Start Trip — 5 Orders Ready!</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* INCOMING ORDER ALERT */}
      <Modal visible={showOrderAlert} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.orderAlert}>
            <View style={s.alertHeader}>
              <Text style={s.alertTitle}>🔔 New Order!</Text>
              <View style={s.countdownBadge}>
                <Text style={s.countdownTxt}>{countdown}s</Text>
              </View>
            </View>

            <View style={s.alertBody}>
              <View style={s.alertRow}><Text style={s.alertKey}>📍 Area</Text><Text style={s.alertVal}>{incomingOrder?.area} · {incomingOrder?.distance}</Text></View>
              <View style={s.alertRow}><Text style={s.alertKey}>💧 Order</Text><Text style={s.alertVal}>{incomingOrder?.quantity} Can · {incomingOrder?.type}</Text></View>
              <View style={s.alertRow}><Text style={s.alertKey}>🕐 Slot</Text><Text style={s.alertVal}>{incomingOrder?.slot}</Text></View>
              <View style={s.alertRow}><Text style={s.alertKey}>💵 Payment</Text><Text style={s.alertVal}>{incomingOrder?.payment}</Text></View>
            </View>

            <View style={s.tripProgress}>
              <Text style={s.tripProgressLbl}>Trip slots: {tripSlots}/5</Text>
              <View style={s.tripProgressBar}>
                {[1,2,3,4,5].map(i => (
                  <View key={i} style={[s.tripProgressDot, i <= tripSlots && s.tripProgressDotFilled]} />
                ))}
              </View>
            </View>

            <View style={s.alertBtns}>
              <TouchableOpacity style={s.rejectBtn} onPress={rejectOrder}>
                <Text style={s.rejectTxt}>❌ Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.acceptBtn} onPress={acceptOrder}>
                <Text style={s.acceptTxt}>✅ Accept</Text>
              </TouchableOpacity>
            </View>

            {/* COUNTDOWN BAR */}
            <View style={s.countdownBar}>
              <View style={[s.countdownFill, { width: `${(countdown / 60) * 100}%` as any }]} />
            </View>
          </View>
        </View>
      </Modal>

      <VendorBottomNav activeTab="home" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const HD = '#BF360C'; const OR = '#E65100'; const OL = '#FF6D00';
const WH = '#FFFFFF'; const TX = '#1A1A1A'; const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: WH },
  header:            { backgroundColor: HD, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 5 },
  brand:             { fontFamily: SERIF, fontSize: 20, fontWeight: '700', fontStyle: 'italic', color: WH },
  tagline:           { fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
  hRight:            { flexDirection: 'row', alignItems: 'center', gap: 10 },
  availBtn:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  availBtnOn:        { backgroundColor: 'rgba(76,175,80,0.3)', borderColor: '#4CAF50' },
  availDot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF9A9A' },
  availDotOn:        { backgroundColor: '#4CAF50' },
  availTxt:          { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  availTxtOn:        { color: '#4CAF50' },
  scroll:            { flex: 1, backgroundColor: '#FFF8F5' },
  vendorCard:        { backgroundColor: WH, margin: 14, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#FFE0B2', elevation: 2 },
  vendorLeft:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:            { width: 48, height: 48, borderRadius: 24, backgroundColor: OR, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:         { fontFamily: SERIF, fontSize: 20, fontWeight: '800', color: WH },
  vendorName:        { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: TX, marginBottom: 2 },
  vendorArea:        { fontSize: 12, color: MU, marginBottom: 3 },
  ratingRow:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingStars:       { fontSize: 10 },
  ratingVal:         { fontSize: 12, fontWeight: '700', color: OR },
  tripSlotWrap:      { alignItems: 'center' },
  tripSlotLabel:     { fontSize: 10, color: MU, marginBottom: 2 },
  tripSlotVal:       { fontFamily: SERIF, fontSize: 22, fontWeight: '800', color: OR, marginBottom: 4 },
  tripSlotBar:       { flexDirection: 'row', gap: 4 },
  tripSlotDot:       { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFE0B2' },
  tripSlotDotFilled: { backgroundColor: OR },
  sec:               { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  secRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  secTitle:          { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: TX, marginBottom: 10 },
  seeAll:            { fontSize: 13, color: OR, fontWeight: '700' },
  earningsRow:       { flexDirection: 'row', gap: 8 },
  earningCard:       { flex: 1, backgroundColor: WH, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  earningVal:        { fontFamily: SERIF, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  earningLbl:        { fontSize: 10, color: MU },
  stockGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stockCard:         { width: '47%', borderRadius: 14, padding: 14, elevation: 1 },
  stockIcon:         { fontSize: 24, marginBottom: 6 },
  stockVal:          { fontFamily: SERIF, fontSize: 24, fontWeight: '800', marginBottom: 2 },
  stockLbl:          { fontSize: 10, color: MU, lineHeight: 14 },
  actionGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard:        { width: '47%', backgroundColor: WH, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  actionIcon:        { fontSize: 24, marginBottom: 6 },
  actionLbl:         { fontSize: 12, fontWeight: '600', color: TX },
  startTripBtn:      { backgroundColor: OR, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 4 },
  startTripTxt:      { fontSize: 16, fontWeight: '800', color: WH },
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  orderAlert:        { backgroundColor: WH, borderRadius: 24, width: '100%', overflow: 'hidden', elevation: 10 },
  alertHeader:       { backgroundColor: OR, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle:        { fontFamily: SERIF, fontSize: 20, fontWeight: '800', color: WH },
  countdownBadge:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  countdownTxt:      { fontSize: 16, fontWeight: '800', color: WH },
  alertBody:         { padding: 16 },
  alertRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#FFF3E0' },
  alertKey:          { fontSize: 13, color: MU },
  alertVal:          { fontSize: 13, fontWeight: '700', color: TX },
  tripProgress:      { paddingHorizontal: 16, paddingBottom: 12 },
  tripProgressLbl:   { fontSize: 12, color: MU, marginBottom: 6 },
  tripProgressBar:   { flexDirection: 'row', gap: 6 },
  tripProgressDot:   { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#FFE0B2' },
  tripProgressDotFilled: { backgroundColor: OR },
  alertBtns:         { flexDirection: 'row', gap: 10, padding: 16 },
  rejectBtn:         { flex: 1, backgroundColor: '#FFEBEE', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#EF9A9A' },
  rejectTxt:         { fontSize: 14, fontWeight: '700', color: '#C62828' },
  acceptBtn:         { flex: 1, backgroundColor: OR, borderRadius: 12, padding: 14, alignItems: 'center', elevation: 3 },
  acceptTxt:         { fontSize: 14, fontWeight: '700', color: WH },
  countdownBar:      { height: 4, backgroundColor: '#FFE0B2' },
  countdownFill:     { height: '100%', backgroundColor: OR },
});