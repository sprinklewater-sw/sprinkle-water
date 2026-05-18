import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import VendorBottomNav from './VendorBottomNav';

interface Props {
  onTabChange?: (tab: string) => void;
  onOrderStock?: () => void;
}

const VENDOR_ID = '00000000-0000-0000-0000-000000000002';

export default function VendorStock({ onTabChange, onOrderStock }: Props) {
  const [stock, setStock] = useState({ filled_cans: 0, empty_cans_with_vendor: 0, cans_at_customers: 0, total_delivered_today: 0 });
  const [loading, setLoading] = useState(true);
  const [closingCount, setClosingCount] = useState('');
  const [receivingCount, setReceivingCount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadStock(); }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('vendor_stock')
        .select('*')
        .eq('vendor_id', VENDOR_ID)
        .single();
      if (data) setStock(data);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmReceiving = async () => {
    if (!receivingCount) return;
    setSubmitting(true);
    try {
      const newFilled = stock.filled_cans + Number(receivingCount);
      const { error } = await supabase
        .from('vendor_stock')
        .update({ filled_cans: newFilled, last_updated: new Date().toISOString() })
        .eq('vendor_id', VENDOR_ID);
      if (error) Alert.alert('Error', error.message);
      else {
        Alert.alert('✅ Stock Updated!', `${receivingCount} cans added to your stock.`);
        setReceivingCount('');
        loadStock();
      }
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitClosingCount = async () => {
    if (!closingCount) return;
    setSubmitting(true);
    try {
      const submitted = Number(closingCount);
      const expected = stock.filled_cans;
      const missing = expected - submitted;
      await supabase
        .from('vendor_stock')
        .update({ filled_cans: submitted, last_updated: new Date().toISOString() })
        .eq('vendor_id', VENDOR_ID);
      if (missing > 0) {
        Alert.alert('⚠️ Discrepancy Found!', `${missing} cans missing. Admin has been notified.`);
      } else {
        Alert.alert('✅ Closing Count Submitted!', 'Stock count verified successfully.');
      }
      setClosingCount('');
      loadStock();
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HD} />
      <View style={s.header}>
        <Text style={s.title}>Stock Management</Text>
        <Text style={s.sub}>Live inventory tracking</Text>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={OR} />
        </View>
      ) : (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

          {/* ORDER STOCK BUTTON */}
          <TouchableOpacity style={s.orderStockBtn} onPress={onOrderStock}>
            <Text style={s.orderStockTxt}>📦 Order Stock from Sprinkle →</Text>
            <Text style={s.orderStockSub}>Bulk pricing available · 7-day credit</Text>
          </TouchableOpacity>

          {/* STOCK OVERVIEW */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Current Stock</Text>
            <View style={s.stockGrid}>
              {[
                { icon: '🫙', lbl: 'Filled Cans\nWith Me',     val: stock.filled_cans,            clr: OR,        bg: '#FFF3E0' },
                { icon: '🪣', lbl: 'Empty Cans\nWith Me',      val: stock.empty_cans_with_vendor, clr: '#795548', bg: '#EFEBE9' },
                { icon: '🏠', lbl: 'Cans at\nCustomers',       val: stock.cans_at_customers,      clr: '#1565C0', bg: '#E3F2FD' },
                { icon: '✅', lbl: 'Delivered\nToday',         val: stock.total_delivered_today,  clr: '#2E7D32', bg: '#E8F5E9' },
              ].map((st, i) => (
                <View key={i} style={[s.stockCard, { backgroundColor: st.bg }]}>
                  <Text style={s.stockIcon}>{st.icon}</Text>
                  <Text style={[s.stockVal, { color: st.clr }]}>{st.val}</Text>
                  <Text style={s.stockLbl}>{st.lbl}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* TOTAL SUMMARY */}
          <View style={s.sec}>
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>📊 Total Cans in My Zone</Text>
              <Text style={s.summaryVal}>{stock.filled_cans + stock.empty_cans_with_vendor + stock.cans_at_customers}</Text>
              <View style={s.summaryBreak}>
                <View style={s.summaryRow}><Text style={s.summaryKey}>Filled with me</Text><Text style={s.summaryV}>{stock.filled_cans}</Text></View>
                <View style={s.summaryRow}><Text style={s.summaryKey}>Empty with me</Text><Text style={s.summaryV}>{stock.empty_cans_with_vendor}</Text></View>
                <View style={[s.summaryRow, { borderBottomWidth: 0 }]}><Text style={s.summaryKey}>At customer homes</Text><Text style={s.summaryV}>{stock.cans_at_customers}</Text></View>
              </View>
            </View>
          </View>

          {/* RECEIVE FROM DRIVER */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Receive Cans from Driver</Text>
            <View style={s.actionCard}>
              <Text style={s.actionDesc}>When driver delivers cans to you, confirm the count received.</Text>
              <View style={s.inputRow}>
                <TextInput
                  style={s.input}
                  placeholder="Enter cans received"
                  keyboardType="numeric"
                  value={receivingCount}
                  onChangeText={setReceivingCount}
                  placeholderTextColor={MU}
                />
                <TouchableOpacity style={s.confirmBtn} onPress={confirmReceiving} disabled={submitting}>
                  <Text style={s.confirmBtnTxt}>{submitting ? '...' : 'Confirm'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* DAILY CLOSING COUNT */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Daily Closing Count</Text>
            <View style={s.actionCard}>
              <Text style={s.actionDesc}>Submit your actual filled can count at end of day. System will detect any missing cans.</Text>
              <View style={s.expectedRow}>
                <Text style={s.expectedLbl}>Expected count:</Text>
                <Text style={s.expectedVal}>{stock.filled_cans} cans</Text>
              </View>
              <View style={s.inputRow}>
                <TextInput
                  style={s.input}
                  placeholder="Enter actual count"
                  keyboardType="numeric"
                  value={closingCount}
                  onChangeText={setClosingCount}
                  placeholderTextColor={MU}
                />
                <TouchableOpacity style={s.confirmBtn} onPress={submitClosingCount} disabled={submitting}>
                  <Text style={s.confirmBtnTxt}>{submitting ? '...' : 'Submit'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* STOCK HISTORY */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Stock History</Text>
            {[
              { date: 'Today',     action: 'Received from Driver', cans: '+20', type: 'in'  },
              { date: 'Today',     action: '5 Deliveries Made',    cans: '-5',  type: 'out' },
              { date: 'Yesterday', action: 'Received from Driver', cans: '+15', type: 'in'  },
              { date: 'Yesterday', action: '8 Deliveries Made',    cans: '-8',  type: 'out' },
            ].map((h, i) => (
              <View key={i} style={s.histCard}>
                <View style={[s.histIcon, { backgroundColor: h.type === 'in' ? '#E8F5E9' : '#FFF3E0' }]}>
                  <Text style={{ fontSize: 16 }}>{h.type === 'in' ? '↓' : '↑'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.histAction}>{h.action}</Text>
                  <Text style={s.histDate}>{h.date}</Text>
                </View>
                <Text style={[s.histCans, { color: h.type === 'in' ? '#2E7D32' : OR }]}>{h.cans} cans</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      )}

      <VendorBottomNav activeTab="stock" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const HD = '#BF360C'; const OR = '#E65100';
const WH = '#FFFFFF'; const TX = '#1A1A1A'; const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: WH },
  header:        { backgroundColor: HD, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 14, paddingHorizontal: 16, elevation: 5 },
  title:         { fontFamily: SERIF, fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: WH },
  sub:           { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  loadingWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:        { flex: 1, backgroundColor: '#FFF8F5' },
  orderStockBtn: { backgroundColor: OR, margin: 14, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 4, shadowColor: OR, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  orderStockTxt: { fontSize: 15, fontWeight: '800', color: WH, marginBottom: 3 },
  orderStockSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  sec:           { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  secTitle:      { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: TX, marginBottom: 10 },
  stockGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stockCard:     { width: '47%', borderRadius: 14, padding: 14, elevation: 1 },
  stockIcon:     { fontSize: 24, marginBottom: 6 },
  stockVal:      { fontFamily: SERIF, fontSize: 28, fontWeight: '800', marginBottom: 2 },
  stockLbl:      { fontSize: 10, color: MU, lineHeight: 14 },
  summaryCard:   { backgroundColor: WH, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1, alignItems: 'center' },
  summaryTitle:  { fontSize: 14, fontWeight: '700', color: TX, marginBottom: 6 },
  summaryVal:    { fontFamily: SERIF, fontSize: 40, fontWeight: '800', color: OR, marginBottom: 12 },
  summaryBreak:  { width: '100%' },
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#FFF3E0' },
  summaryKey:    { fontSize: 13, color: MU },
  summaryV:      { fontSize: 13, fontWeight: '700', color: TX },
  actionCard:    { backgroundColor: WH, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  actionDesc:    { fontSize: 13, color: MU, marginBottom: 12, lineHeight: 18 },
  inputRow:      { flexDirection: 'row', gap: 8 },
  input:         { flex: 1, backgroundColor: '#FFF8F5', borderRadius: 10, borderWidth: 1.5, borderColor: '#FFE0B2', paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: TX },
  confirmBtn:    { backgroundColor: OR, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center', elevation: 2 },
  confirmBtnTxt: { fontSize: 13, fontWeight: '700', color: WH },
  expectedRow:   { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF3E0', borderRadius: 8, padding: 10, marginBottom: 10 },
  expectedLbl:   { fontSize: 13, color: MU },
  expectedVal:   { fontSize: 13, fontWeight: '700', color: OR },
  histCard:      { backgroundColor: WH, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#FFE0B2' },
  histIcon:      { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  histAction:    { fontSize: 13, fontWeight: '600', color: TX, marginBottom: 2 },
  histDate:      { fontSize: 10, color: MU },
  histCans:      { fontSize: 14, fontWeight: '800' },
});