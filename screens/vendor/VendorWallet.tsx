import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import VendorBottomNav from './VendorBottomNav';

interface Props { onTabChange?: (tab: string) => void; }

const VENDOR_ID = '00000000-0000-0000-0000-000000000002';

export default function VendorWallet({ onTabChange }: Props) {
  const [earnings, setEarnings] = useState({ total: 0, today: 0, week: 0, pending: 0, cod_collected: 0 });
  const [vendorMargin, setVendorMargin] = useState(37);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [daysLeft, setDaysLeft] = useState(5);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: marginData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'vendor_margin')
        .single();
      if (marginData) setVendorMargin(Number(marginData.value));

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersData) {
        setOrders(ordersData);
        const totalEarnings = ordersData.length * vendorMargin;
        const codOrders = ordersData.filter(o => o.payment_method?.includes('Cash'));
        const codTotal = codOrders.reduce((sum: number, o: any) => sum + o.amount, 0);
        setEarnings({
          total: totalEarnings,
          today: Math.floor(totalEarnings * 0.3),
          week: totalEarnings,
          pending: Math.floor(totalEarnings * 0.4),
          cod_collected: codTotal,
        });
      }
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = () => {
    Alert.alert('Payout Request', `Request ₹${earnings.pending} payout?\n\nAdmin will process within 24 hours.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Request', onPress: () => Alert.alert('✅ Request Sent!', 'Admin will process your payout within 24 hours.') },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HD} />
      <View style={s.header}>
        <Text style={s.title}>My Wallet</Text>
        <Text style={s.sub}>Earnings & payments</Text>
      </View>

      {loading ? (
        <View style={s.loadingWrap}><ActivityIndicator size="large" color={OR} /></View>
      ) : (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

          {/* EARNINGS HERO */}
          <View style={s.heroCard}>
            <Text style={s.heroLabel}>Total Earnings This Week</Text>
            <Text style={s.heroVal}>₹{earnings.week}</Text>
            <Text style={s.heroSub}>₹{vendorMargin} per can delivered</Text>
            <View style={s.heroDivider} />
            <View style={s.heroRow}>
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>₹{earnings.today}</Text>
                <Text style={s.heroStatLbl}>Today</Text>
              </View>
              <View style={s.heroStatDivider} />
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>₹{earnings.cod_collected}</Text>
                <Text style={s.heroStatLbl}>COD Collected</Text>
              </View>
              <View style={s.heroStatDivider} />
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>₹{earnings.pending}</Text>
                <Text style={s.heroStatLbl}>Withdrawable</Text>
              </View>
            </View>
          </View>

          {/* 7 DAY CREDIT */}
          <View style={s.sec}>
            <View style={s.creditCard}>
              <View style={s.creditTop}>
                <Text style={s.creditTitle}>⏰ Next Payout Window</Text>
                <View style={s.daysBadge}>
                  <Text style={s.daysTxt}>{daysLeft} days left</Text>
                </View>
              </View>
              <Text style={s.creditSub}>Withdraw your earnings every 7 days. Next window opens in {daysLeft} days.</Text>
              <View style={s.creditBar}>
                <View style={[s.creditFill, { width: `${((7 - daysLeft) / 7) * 100}%` as any }]} />
              </View>
              <TouchableOpacity style={s.payoutBtn} onPress={requestPayout}>
                <Text style={s.payoutBtnTxt}>💰 Request Payout — ₹{earnings.pending}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* COD LOG */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Cash Collection Log</Text>
            <View style={s.codCard}>
              <Text style={s.codDesc}>Log all cash collected from customers immediately after delivery.</Text>
              <View style={s.codTotal}>
                <Text style={s.codTotalLbl}>Total Cash Collected Today</Text>
                <Text style={s.codTotalVal}>₹{earnings.cod_collected}</Text>
              </View>
              <TouchableOpacity style={s.codBtn}>
                <Text style={s.codBtnTxt}>+ Log Cash Collection</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TRANSACTION HISTORY */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Transaction History</Text>
            {orders.length === 0 ? (
              <View style={s.emptyTxn}>
                <Text style={s.emptyTxnTxt}>No transactions yet</Text>
              </View>
            ) : orders.map((o, i) => (
              <View key={i} style={s.txnCard}>
                <View style={s.txnIcon}>
                  <Text style={{ fontSize: 16 }}>↓</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.txnDesc}>Order #{o.id.slice(0, 8).toUpperCase()} delivered</Text>
                  <Text style={s.txnDate}>{new Date(o.created_at).toLocaleDateString('en-IN')}</Text>
                </View>
                <Text style={s.txnAmt}>+₹{vendorMargin}</Text>
              </View>
            ))}
          </View>

          {/* PROFIT SUMMARY */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Profit Summary</Text>
            <View style={s.profitCard}>
              {[
                { period: 'Today',      revenue: earnings.today,           margin: vendorMargin },
                { period: 'This Week',  revenue: earnings.week,            margin: vendorMargin },
                { period: 'This Month', revenue: earnings.week * 4,        margin: vendorMargin },
              ].map((p, i) => (
                <View key={i} style={[s.profitRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: '#FFF3E0' }]}>
                  <Text style={s.profitPeriod}>{p.period}</Text>
                  <Text style={s.profitRevenue}>₹{p.revenue}</Text>
                  <Text style={s.profitMargin}>₹{p.margin}/can</Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      )}

      <VendorBottomNav activeTab="wallet" onTabChange={onTabChange || (() => {})} />
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
  heroCard:      { backgroundColor: HD, margin: 14, borderRadius: 20, padding: 20, elevation: 4 },
  heroLabel:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  heroVal:       { fontFamily: SERIF, fontSize: 36, fontWeight: '800', color: WH, marginBottom: 4 },
  heroSub:       { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  heroDivider:   { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 14 },
  heroRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  heroStat:      { flex: 1, alignItems: 'center' },
  heroStatVal:   { fontFamily: SERIF, fontSize: 16, fontWeight: '800', color: WH, marginBottom: 2 },
  heroStatLbl:   { fontSize: 9, color: 'rgba(255,255,255,0.7)' },
  heroStatDivider:{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sec:           { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  secTitle:      { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: TX, marginBottom: 10 },
  creditCard:    { backgroundColor: WH, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  creditTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  creditTitle:   { fontSize: 14, fontWeight: '700', color: TX },
  daysBadge:     { backgroundColor: '#FFF3E0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  daysTxt:       { fontSize: 11, fontWeight: '700', color: OR },
  creditSub:     { fontSize: 12, color: MU, marginBottom: 12, lineHeight: 18 },
  creditBar:     { height: 6, backgroundColor: '#FFE0B2', borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  creditFill:    { height: '100%', backgroundColor: OR, borderRadius: 3 },
  payoutBtn:     { backgroundColor: OR, borderRadius: 12, padding: 13, alignItems: 'center', elevation: 2 },
  payoutBtnTxt:  { fontSize: 14, fontWeight: '700', color: WH },
  codCard:       { backgroundColor: WH, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  codDesc:       { fontSize: 13, color: MU, marginBottom: 12, lineHeight: 18 },
  codTotal:      { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF3E0', borderRadius: 10, padding: 12, marginBottom: 12 },
  codTotalLbl:   { fontSize: 13, color: MU },
  codTotalVal:   { fontSize: 15, fontWeight: '800', color: OR },
  codBtn:        { backgroundColor: '#FFF3E0', borderRadius: 10, padding: 11, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  codBtnTxt:     { fontSize: 13, fontWeight: '700', color: OR },
  emptyTxn:      { backgroundColor: WH, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  emptyTxnTxt:   { fontSize: 13, color: MU },
  txnCard:       { backgroundColor: WH, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#FFE0B2' },
  txnIcon:       { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  txnDesc:       { fontSize: 12, fontWeight: '600', color: TX, marginBottom: 2 },
  txnDate:       { fontSize: 10, color: MU },
  txnAmt:        { fontSize: 14, fontWeight: '800', color: '#2E7D32' },
  profitCard:    { backgroundColor: WH, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  profitRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  profitPeriod:  { fontSize: 13, fontWeight: '600', color: TX, flex: 1 },
  profitRevenue: { fontSize: 13, fontWeight: '700', color: OR, flex: 1, textAlign: 'center' },
  profitMargin:  { fontSize: 12, color: MU, flex: 1, textAlign: 'right' },
});