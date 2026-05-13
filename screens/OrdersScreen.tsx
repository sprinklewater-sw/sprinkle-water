import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, ActivityIndicator } from 'react-native';
import BottomNav from './BottomNav';
import { supabase } from '../lib/supabase';

interface Props { onTabChange?: (tab: string) => void; }

interface Order {
  id: string;
  quantity: number;
  is_exchange: boolean;
  delivery_slot: string;
  created_at: string;
  status: string;
  payment_status: string;
  amount: number;
  deposit_amount: number;
  payment_method: string;
  is_emergency: boolean;
  delivery_address: string;
}

const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  'delivered':        { bg: '#EAF5DE', text: '#3B6D11', dot: '#6DB33F' },
  'out_for_delivery': { bg: '#FFF8E1', text: '#E65100', dot: '#FF8F00' },
  'pending':          { bg: '#E3F2FD', text: '#1565C0', dot: '#1E88E5' },
  'confirmed':        { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0' },
  'cancelled':        { bg: '#FFEBEE', text: '#C62828', dot: '#EF5350' },
};

const STATUS_LABEL: Record<string, string> = {
  'delivered':        'Delivered',
  'out_for_delivery': 'Out for Delivery',
  'pending':          'Pending',
  'confirmed':        'Confirmed',
  'cancelled':        'Cancelled',
};

const FILTERS = ['All', 'Active', 'Delivered', 'Cancelled'];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function OrdersScreen({ onTabChange }: Props) {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userId = '00000000-0000-0000-0000-000000000001';

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error loading orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    if (filter === 'All') return true;
    if (filter === 'Active') return o.status === 'out_for_delivery' || o.status === 'pending' || o.status === 'confirmed';
    if (filter === 'Delivered') return o.status === 'delivered';
    if (filter === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GH} />
      <View style={s.header}>
        <Text style={s.title}>My Orders</Text>
        <Text style={s.sub}>{orders.length} total orders</Text>
      </View>

      {/* FILTERS */}
      <View style={s.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.fPill, filter === f && s.fPillActive]} onPress={() => setFilter(f)}>
              <Text style={[s.fTxt, filter === f && s.fTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={GM} />
          <Text style={s.loadingTxt}>Loading orders...</Text>
        </View>
      ) : (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📦</Text>
              <Text style={s.emptyTxt}>No orders found</Text>
              <Text style={s.emptySub}>Place your first order from Home Screen!</Text>
            </View>
          ) : filtered.map((o, i) => {
            const sc = STATUS[o.status] || STATUS['pending'];
            const open = expanded === o.id;
            return (
              <TouchableOpacity key={i} style={s.card} onPress={() => setExpanded(open ? null : o.id)} activeOpacity={0.8}>
                <View style={s.cardTop}>
                  <View style={[s.iconWrap, { backgroundColor: sc.bg }]}>
                    <Text style={{ fontSize: 18 }}>💧</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.orderId}>#{o.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={s.orderDetail}>{o.quantity} Can{o.quantity > 1 ? 's' : ''} · {o.is_exchange ? 'Exchange' : 'New Can'}</Text>
                    <Text style={s.orderSlot}>{formatDate(o.created_at)} · {o.delivery_slot}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <Text style={s.amount}>₹{o.amount}</Text>
                    <View style={[s.sBadge, { backgroundColor: sc.bg }]}>
                      <View style={[s.sDot, { backgroundColor: sc.dot }]} />
                      <Text style={[s.sTxt, { color: sc.text }]}>{STATUS_LABEL[o.status] || o.status}</Text>
                    </View>
                  </View>
                </View>

                {/* EXPANDED DETAILS */}
                {open && (
                  <View style={s.expanded}>
                    <View style={s.divider} />
                    <View style={s.detailRow}><Text style={s.dKey}>Order ID</Text><Text style={s.dVal}>#{o.id.slice(0, 8).toUpperCase()}</Text></View>
                    <View style={s.detailRow}><Text style={s.dKey}>Quantity</Text><Text style={s.dVal}>{o.quantity} Can{o.quantity > 1 ? 's' : ''}</Text></View>
                    <View style={s.detailRow}><Text style={s.dKey}>Type</Text><Text style={s.dVal}>{o.is_exchange ? 'Exchange' : 'New Can'}</Text></View>
                    <View style={s.detailRow}><Text style={s.dKey}>Slot</Text><Text style={s.dVal}>{o.delivery_slot}</Text></View>
                    <View style={s.detailRow}><Text style={s.dKey}>Payment</Text><Text style={s.dVal}>{o.payment_method}</Text></View>
                    <View style={s.detailRow}><Text style={s.dKey}>Water Amount</Text><Text style={s.dVal}>₹{o.amount - o.deposit_amount}</Text></View>
                    {o.deposit_amount > 0 && (
                      <View style={s.detailRow}><Text style={s.dKey}>Deposit</Text><Text style={[s.dVal, { color: '#6A1B9A' }]}>₹{o.deposit_amount} (Refundable)</Text></View>
                    )}
                    {o.is_emergency && (
                      <View style={s.detailRow}><Text style={s.dKey}>⚡ Emergency</Text><Text style={s.dVal}>+₹10 surcharge</Text></View>
                    )}
                    <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
                      <Text style={[s.dKey, { fontWeight: '700', color: TX }]}>Total</Text>
                      <Text style={[s.dVal, { color: GD, fontSize: 15 }]}>₹{o.amount}</Text>
                    </View>
                    {(o.status === 'pending' || o.status === 'confirmed') && (
                      <TouchableOpacity style={s.trackBtn}>
                        <Text style={s.trackTxt}>📍 Track Order</Text>
                      </TouchableOpacity>
                    )}
                    {o.status === 'delivered' && (
                      <TouchableOpacity style={s.reorderBtn}>
                        <Text style={s.reorderTxt}>🔄 Reorder</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <BottomNav activeTab="orders" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const GH = '#4A7C2F'; const GM = '#6DB33F'; const GD = '#3B6D11';
const BD = '#D4EAC0'; const WH = '#FFFFFF'; const TX = '#1A1A1A'; const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: WH },
  header:      { backgroundColor: GH, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 14, paddingHorizontal: 16, elevation: 5, shadowColor: GD, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  title:       { fontFamily: SERIF, fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: WH },
  sub:         { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  filterWrap:  { backgroundColor: WH, borderBottomWidth: 1, borderBottomColor: BD, paddingVertical: 10 },
  filters:     { paddingHorizontal: 14, gap: 8 },
  fPill:       { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: BD, backgroundColor: WH },
  fPillActive: { backgroundColor: GM, borderColor: GM },
  fTxt:        { fontSize: 12, fontWeight: '600', color: MU },
  fTxtActive:  { color: WH },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingTxt:  { fontSize: 14, color: MU },
  scroll:      { flex: 1, backgroundColor: '#F5FAF5', paddingHorizontal: 14, paddingTop: 12 },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTxt:    { fontSize: 16, fontWeight: '700', color: TX, marginBottom: 6 },
  emptySub:    { fontSize: 13, color: MU },
  card:        { backgroundColor: WH, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BD, elevation: 1, shadowColor: GM, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  cardTop:     { flexDirection: 'row', alignItems: 'center', gap: 11 },
  iconWrap:    { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  orderId:     { fontSize: 10, color: MU, marginBottom: 2 },
  orderDetail: { fontSize: 13, fontWeight: '700', color: TX, marginBottom: 2 },
  orderSlot:   { fontSize: 10, color: MU },
  amount:      { fontFamily: SERIF, fontSize: 14, fontWeight: '800', color: GD },
  sBadge:      { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  sDot:        { width: 4, height: 4, borderRadius: 2 },
  sTxt:        { fontSize: 8, fontWeight: '700' },
  expanded:    { marginTop: 10 },
  divider:     { height: 1, backgroundColor: '#EAF5DE', marginBottom: 10 },
  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EAF5DE' },
  dKey:        { fontSize: 12, color: MU },
  dVal:        { fontSize: 12, fontWeight: '600', color: TX },
  reorderBtn:  { backgroundColor: '#EAF5DE', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: BD },
  reorderTxt:  { fontSize: 13, fontWeight: '700', color: GD },
  trackBtn:    { backgroundColor: GM, borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 10 },
  trackTxt:    { fontSize: 13, fontWeight: '700', color: WH },
});