import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Platform, Alert, ActivityIndicator, Pressable,
} from 'react-native';
import { supabase } from '../../lib/supabase';

interface Props { onTabChange?: (tab: string) => void; }

const VENDOR_ID = '00000000-0000-0000-0000-000000000002';

interface PricingTier {
  min: number;
  max: number;
  price: number;
  label: string;
  badge: string;
  savings: number;
}

interface StockOrder {
  id: string;
  quantity: number;
  total_cost: number;
  status: string;
  created_at: string;
  price_per_can: number;
}

export default function VendorStockOrder({ onTabChange }: Props) {
  const [quantity, setQuantity] = useState(20);
  const [pricing, setPricing] = useState({ normal: 18, bulk20: 15, bulk50: 13 });
  const [loading, setLoading] = useState(false);
  const [pastOrders, setPastOrders] = useState<StockOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [currentStock, setCurrentStock] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['vendor_cost_price', 'vendor_bulk_20_price', 'vendor_bulk_50_price']);

      if (settingsData) {
        const p = { normal: 18, bulk20: 15, bulk50: 13 };
        settingsData.forEach(s => {
          if (s.key === 'vendor_cost_price') p.normal = Number(s.value);
          if (s.key === 'vendor_bulk_20_price') p.bulk20 = Number(s.value);
          if (s.key === 'vendor_bulk_50_price') p.bulk50 = Number(s.value);
        });
        setPricing(p);
      }

      const { data: stockData } = await supabase
        .from('vendor_stock')
        .select('filled_cans')
        .eq('vendor_id', VENDOR_ID)
        .single();
      if (stockData) setCurrentStock(stockData.filled_cans);

      const { data: ordersData } = await supabase
        .from('vendor_stock_orders')
        .select('*')
        .eq('vendor_id', VENDOR_ID)
        .order('created_at', { ascending: false })
        .limit(10);
      if (ordersData) setPastOrders(ordersData);

      setLoadingOrders(false);
    } catch (err) {
      console.log('Error loading data:', err);
      setLoadingOrders(false);
    }
  };

  const getPricePerCan = (qty: number) => {
    if (qty >= 50) return pricing.bulk50;
    if (qty >= 20) return pricing.bulk20;
    return pricing.normal;
  };

  const getSavings = (qty: number) => {
    return (pricing.normal - getPricePerCan(qty)) * qty;
  };

  const totalCost = getPricePerCan(quantity) * quantity;
  const savings = getSavings(quantity);
  const pricePerCan = getPricePerCan(quantity);

  const TIERS: PricingTier[] = [
    { min: 1,   max: 19,  price: pricing.normal, label: 'Standard',   badge: '📦', savings: 0 },
    { min: 20,  max: 49,  price: pricing.bulk20, label: 'Bulk Deal',  badge: '🔥', savings: (pricing.normal - pricing.bulk20) * 20 },
    { min: 50,  max: 999, price: pricing.bulk50, label: 'Super Bulk', badge: '💎', savings: (pricing.normal - pricing.bulk50) * 50 },
  ];

  const activeTier = TIERS.find(t => quantity >= t.min && quantity <= t.max) || TIERS[0];

  const placeStockOrder = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('vendor_stock_orders')
        .insert({
          vendor_id: VENDOR_ID,
          quantity: quantity,
          price_per_can: pricePerCan,
          total_cost: totalCost,
          status: 'pending',
        });

      if (error) {
        Alert.alert('Order Failed', JSON.stringify(error));
        setLoading(false);
        return;
      }

      await loadData();
      Alert.alert(
        '✅ Order Placed!',
        `Stock order for ${quantity} cans placed!\n\nTotal: ₹${totalCost}\nPrice: ₹${pricePerCan}/can\n\nAdmin will dispatch within 24 hours.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = () => {
    Alert.alert(
      'Confirm Stock Order',
      `Order ${quantity} cans for ₹${totalCost}?\n₹${pricePerCan}/can · 7-day credit`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Order', onPress: placeStockOrder },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':    return { bg: '#FFF8E1', text: '#E65100', dot: '#FF8F00' };
      case 'confirmed':  return { bg: '#E3F2FD', text: '#1565C0', dot: '#1E88E5' };
      case 'dispatched': return { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0' };
      case 'delivered':  return { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' };
      default:           return { bg: '#F5F5F5', text: '#757575', dot: '#BDBDBD' };
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HD} />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => onTabChange && onTabChange('stock')} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Order Stock</Text>
          <Text style={s.sub}>Order cans from Sprinkle</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >

          {/* STOCK ALERT */}
          <View style={[s.stockAlert, currentStock < 10 ? s.stockAlertLow : s.stockAlertOk]}>
            <Text style={s.stockAlertIcon}>{currentStock < 10 ? '⚠️' : '✅'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.stockAlertTxt}>
                {currentStock < 10 ? `Low Stock! Only ${currentStock} cans remaining` : `Current Stock: ${currentStock} cans`}
              </Text>
              <Text style={s.stockAlertSub}>
                {currentStock < 10 ? 'Order now to avoid stockout' : 'Stock level is good'}
              </Text>
            </View>
          </View>

          {/* PRICING TIERS */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Pricing Tiers</Text>
            <View style={s.tierGrid}>
              {TIERS.map((tier, i) => {
                const isActive = activeTier.label === tier.label;
                return (
                  <Pressable
                    key={i}
                    style={[s.tierCard, isActive && s.tierCardActive]}
                    onPress={() => setQuantity(tier.min === 1 ? 20 : tier.min)}
                  >
                    <Text style={s.tierBadge}>{tier.badge}</Text>
                    <Text style={[s.tierLabel, isActive && s.tierLabelActive]}>{tier.label}</Text>
                    <Text style={[s.tierPrice, isActive && s.tierPriceActive]}>₹{tier.price}/can</Text>
                    <Text style={s.tierRange}>{tier.min}{tier.max < 999 ? `–${tier.max}` : '+'} cans</Text>
                    {tier.savings > 0 && (
                      <View style={s.savingsBadge}>
                        <Text style={s.savingsTxt}>Save ₹{tier.savings}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* QUANTITY SELECTOR */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Select Quantity</Text>
            <View style={s.qtyCard}>
              <Pressable style={s.qtyBtn} onPress={() => setQuantity(Math.max(20, quantity - 5))}>
                <Text style={s.qtyBtnTxt}>−5</Text>
              </Pressable>
              <Pressable style={s.qtyBtn} onPress={() => setQuantity(Math.max(20, quantity - 1))}>
                <Text style={s.qtyBtnTxt}>−1</Text>
              </Pressable>
              <View style={s.qtyCenter}>
                <Text style={s.qtyNum}>{quantity}</Text>
                <Text style={s.qtyLbl}>cans</Text>
              </View>
              <Pressable style={s.qtyBtn} onPress={() => setQuantity(Math.min(200, quantity + 1))}>
                <Text style={s.qtyBtnTxt}>+1</Text>
              </Pressable>
              <Pressable style={s.qtyBtn} onPress={() => setQuantity(Math.min(200, quantity + 5))}>
                <Text style={s.qtyBtnTxt}>+5</Text>
              </Pressable>
            </View>
            <View style={s.quickRow}>
              {[20, 30, 50, 100].map(q => (
                <Pressable key={q} style={[s.quickBtn, quantity === q && s.quickBtnActive]} onPress={() => setQuantity(q)}>
                  <Text style={[s.quickBtnTxt, quantity === q && s.quickBtnTxtActive]}>{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ORDER SUMMARY */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Order Summary</Text>
            <View style={s.summaryCard}>
              <View style={[s.activeTierBanner, { backgroundColor: activeTier.label === 'Super Bulk' ? '#1565C0' : activeTier.label === 'Bulk Deal' ? OR : '#757575' }]}>
                <Text style={s.activeTierTxt}>{activeTier.badge} {activeTier.label} Pricing Applied!</Text>
              </View>
              <View style={s.summaryBody}>
                <View style={s.summaryRow}><Text style={s.summaryKey}>Quantity</Text><Text style={s.summaryVal}>{quantity} cans</Text></View>
                <View style={s.summaryRow}><Text style={s.summaryKey}>Price per can</Text><Text style={s.summaryVal}>₹{pricePerCan}</Text></View>
                {savings > 0 && (
                  <View style={s.summaryRow}><Text style={s.summaryKey}>You save</Text><Text style={[s.summaryVal, { color: '#2E7D32' }]}>₹{savings} 🎉</Text></View>
                )}
                <View style={s.summaryRow}><Text style={s.summaryKey}>Payment terms</Text><Text style={s.summaryVal}>7-day credit</Text></View>
                <View style={s.summaryRow}><Text style={s.summaryKey}>Delivery time</Text><Text style={s.summaryVal}>Within 24 hours</Text></View>
                <View style={[s.summaryRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                  <Text style={s.summaryTotalKey}>Total Amount</Text>
                  <Text style={s.summaryTotalVal}>₹{totalCost}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* DELIVERY INFO */}
          <View style={s.sec}>
            <View style={s.infoCard}>
              {[
                { icon: '🚚', title: 'Free Delivery',   desc: 'Sprinkle driver delivers to your location' },
                { icon: '📅', title: '7-Day Credit',    desc: 'Pay after selling to customers. No upfront payment.' },
                { icon: '✅', title: 'Quality Assured', desc: 'All cans filled and quality checked at plant' },
                { icon: '📱', title: 'Track Dispatch',  desc: 'Get notified when driver is on the way' },
              ].map((info, i) => (
                <View key={i} style={[s.infoRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: '#FFF3E0' }]}>
                  <Text style={s.infoIcon}>{info.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.infoTitle}>{info.title}</Text>
                    <Text style={s.infoDesc}>{info.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* PLACE ORDER BUTTON */}
          <View style={s.sec}>
            <Pressable
              style={({ pressed }) => [s.orderBtn, pressed && { opacity: 0.85 }, loading && s.orderBtnDisabled]}
              onPress={confirmOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="large" />
              ) : (
                <>
                  <Text style={s.orderBtnTxt}>Place Stock Order</Text>
                  <Text style={s.orderBtnSub}>{quantity} cans · ₹{totalCost} · 7-day credit</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* PAST ORDERS */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Order History</Text>
            {loadingOrders ? (
              <ActivityIndicator color={OR} />
            ) : pastOrders.length === 0 ? (
              <View style={s.emptyOrders}>
                <Text style={s.emptyIcon}>📦</Text>
                <Text style={s.emptyTxt}>No past stock orders yet</Text>
                <Text style={s.emptySub}>Your order history will appear here</Text>
              </View>
            ) : pastOrders.map((order, i) => {
              const sc = getStatusColor(order.status);
              return (
                <View key={i} style={s.orderHistCard}>
                  <View style={s.orderHistTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.orderHistId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                      <Text style={s.orderHistDetail}>{order.quantity} cans · ₹{order.price_per_can}/can</Text>
                      <Text style={s.orderHistDate}>{new Date(order.created_at).toLocaleDateString('en-IN')}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 5 }}>
                      <Text style={s.orderHistTotal}>₹{order.total_cost}</Text>
                      <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                        <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
                        <Text style={[s.statusTxt, { color: sc.text }]}>{order.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const HD = '#BF360C'; const OR = '#E65100';
const WH = '#FFFFFF'; const TX = '#1A1A1A'; const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: WH },
  header:            { backgroundColor: HD, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 5 },
  backBtn:           { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backIcon:          { fontSize: 22, color: WH, fontWeight: '700' },
  title:             { fontFamily: SERIF, fontSize: 20, fontWeight: '700', fontStyle: 'italic', color: WH, textAlign: 'center' },
  sub:               { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'center' },
  scroll:            { flex: 1, backgroundColor: '#FFF8F5' },
  stockAlert:        { margin: 14, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1 },
  stockAlertLow:     { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' },
  stockAlertOk:      { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  stockAlertIcon:    { fontSize: 24 },
  stockAlertTxt:     { fontSize: 13, fontWeight: '700', color: TX, marginBottom: 2 },
  stockAlertSub:     { fontSize: 11, color: MU },
  sec:               { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  secTitle:          { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: TX, marginBottom: 10 },
  tierGrid:          { flexDirection: 'row', gap: 8 },
  tierCard:          { flex: 1, backgroundColor: WH, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFE0B2', elevation: 1 },
  tierCardActive:    { backgroundColor: OR, borderColor: OR, elevation: 4 },
  tierBadge:         { fontSize: 20, marginBottom: 4 },
  tierLabel:         { fontSize: 10, fontWeight: '700', color: MU, marginBottom: 4 },
  tierLabelActive:   { color: WH },
  tierPrice:         { fontFamily: SERIF, fontSize: 16, fontWeight: '800', color: OR, marginBottom: 2 },
  tierPriceActive:   { color: WH },
  tierRange:         { fontSize: 9, color: MU },
  savingsBadge:      { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  savingsTxt:        { fontSize: 8, fontWeight: '700', color: '#2E7D32' },
  qtyCard:           { backgroundColor: WH, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1, marginBottom: 10 },
  qtyBtn:            { backgroundColor: '#FFF3E0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: '#FFE0B2' },
  qtyBtnTxt:         { fontSize: 14, fontWeight: '800', color: OR },
  qtyCenter:         { alignItems: 'center', minWidth: 80 },
  qtyNum:            { fontFamily: SERIF, fontSize: 40, fontWeight: '800', color: TX },
  qtyLbl:            { fontSize: 11, color: MU },
  quickRow:          { flexDirection: 'row', gap: 8 },
  quickBtn:          { flex: 1, backgroundColor: WH, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFE0B2' },
  quickBtnActive:    { backgroundColor: OR, borderColor: OR },
  quickBtnTxt:       { fontSize: 13, fontWeight: '700', color: TX },
  quickBtnTxtActive: { color: WH },
  summaryCard:       { backgroundColor: WH, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  activeTierBanner:  { padding: 10, alignItems: 'center' },
  activeTierTxt:     { fontSize: 13, fontWeight: '700', color: WH },
  summaryBody:       { padding: 16 },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#FFF3E0' },
  summaryKey:        { fontSize: 13, color: MU },
  summaryVal:        { fontSize: 13, fontWeight: '600', color: TX },
  summaryTotalKey:   { fontSize: 16, fontWeight: '800', color: TX },
  summaryTotalVal:   { fontFamily: SERIF, fontSize: 22, fontWeight: '800', color: OR },
  infoCard:          { backgroundColor: WH, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  infoRow:           { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  infoIcon:          { fontSize: 20 },
  infoTitle:         { fontSize: 13, fontWeight: '700', color: TX, marginBottom: 2 },
  infoDesc:          { fontSize: 11, color: MU, lineHeight: 16 },
  orderBtn:          { backgroundColor: OR, borderRadius: 16, padding: 18, alignItems: 'center', elevation: 6 },
  orderBtnDisabled:  { backgroundColor: '#FFCCBC', elevation: 0 },
  orderBtnTxt:       { fontSize: 17, fontWeight: '800', color: WH, marginBottom: 4 },
  orderBtnSub:       { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  emptyOrders:       { backgroundColor: WH, borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  emptyIcon:         { fontSize: 40, marginBottom: 8 },
  emptyTxt:          { fontSize: 14, fontWeight: '700', color: TX, marginBottom: 4 },
  emptySub:          { fontSize: 12, color: MU },
  orderHistCard:     { backgroundColor: WH, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  orderHistTop:      { flexDirection: 'row', alignItems: 'center' },
  orderHistId:       { fontSize: 10, color: MU, marginBottom: 2 },
  orderHistDetail:   { fontSize: 13, fontWeight: '700', color: TX, marginBottom: 2 },
  orderHistDate:     { fontSize: 10, color: MU },
  orderHistTotal:    { fontFamily: SERIF, fontSize: 15, fontWeight: '800', color: OR, marginBottom: 4 },
  statusBadge:       { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  statusDot:         { width: 5, height: 5, borderRadius: 3 },
  statusTxt:         { fontSize: 9, fontWeight: '700' },
});