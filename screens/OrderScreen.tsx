import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, Platform, Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

const SLOTS = [
  '9–10 AM', '10–11 AM', '11 AM–12 PM',
  '12–1 PM', '1–2 PM', '2–3 PM',
  '3–4 PM', '4–5 PM', '5–6 PM',
  '6–7 PM', '7–8 PM', '8–9 PM', '9–10 PM',
];

const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

function isSlotPast(index: number): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const slotHour = SLOT_HOURS[index];
  if (slotHour < currentHour) return true;
  if (slotHour === currentHour && currentMin >= 30) return true;
  return false;
}

interface Props { onBack?: () => void; }

export default function OrderScreen({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [isExchange, setIsExchange] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [canPrice, setCanPrice] = useState(50);
  const [depositPrice, setDepositPrice] = useState(120);
  const [emergencyFee, setEmergencyFee] = useState(10);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['can_price', 'deposit_amount', 'emergency_surcharge']);
      if (data) {
        data.forEach(s => {
          if (s.key === 'can_price') setCanPrice(Number(s.value));
          if (s.key === 'deposit_amount') setDepositPrice(Number(s.value));
          if (s.key === 'emergency_surcharge') setEmergencyFee(Number(s.value));
        });
      }
    } catch (err) {
      console.log('Pricing load error:', err);
    }
  };

  const emergencySurcharge = isEmergency ? emergencyFee : 0;
  const waterTotal = canPrice * quantity;
  const depositTotal = isExchange ? 0 : depositPrice * quantity;
  const total = waterTotal + depositTotal + emergencySurcharge;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const placeOrder = async () => {
    if (!paymentMethod) return;
    setLoading(true);
    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
          customer_id: userId,
          quantity: quantity,
          amount: total,
          deposit_amount: depositTotal,
          is_exchange: isExchange,
          is_emergency: isEmergency,
          delivery_slot: selectedSlot !== null ? SLOTS[selectedSlot] : '',
          payment_method: paymentMethod,
          status: 'pending',
          payment_status: 'unpaid',
          delivery_address: 'BTM Layout',
          area: 'BTM Layout',
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Order Error', JSON.stringify(error));
        setLoading(false);
        return;
      }

      setOrderId(orderData.id.slice(0, 8).toUpperCase());
      setOrderPlaced(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={GM} />
        <ScrollView contentContainerStyle={styles.successContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.successTick}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSub}>Your water is on its way 💧</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Order ID</Text>
              <Text style={styles.detailVal}>#{orderId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Quantity</Text>
              <Text style={styles.detailVal}>{quantity} Can{quantity > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Type</Text>
              <Text style={styles.detailVal}>{isExchange ? 'Exchange' : 'New Can'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Slot</Text>
              <Text style={styles.detailVal}>{selectedSlot !== null ? SLOTS[selectedSlot] : '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Payment</Text>
              <Text style={styles.detailVal}>{paymentMethod}</Text>
            </View>
            {!isExchange && (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Deposit</Text>
                <Text style={styles.detailVal}>₹{depositTotal} (Refundable)</Text>
              </View>
            )}
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.detailKey, { fontWeight: '700', color: TX }]}>Total Paid</Text>
              <Text style={[styles.detailVal, { color: GD, fontSize: 18 }]}>₹{total}</Text>
            </View>
          </View>
          <View style={styles.vendorCard}>
            <Text style={styles.vendorText}>🚴 Finding nearest vendor...</Text>
            <Text style={styles.vendorSub}>You'll be notified when vendor is assigned</Text>
          </View>
          <TouchableOpacity style={styles.trackBtn}>
            <Text style={styles.trackBtnText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={onBack}>
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GM} />

      <View style={styles.header}>
        <TouchableOpacity onPress={step > 1 ? () => setStep(step - 1) : onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Place Order</Text>
          <Text style={styles.headerSub}>Sprinkle Water · 20L Can</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressSteps}>
          {['Select Order', 'Choose Slot', 'Payment'].map((label, i) => (
            <Text key={i} style={[styles.progressStep, step === i + 1 && styles.progressStepActive]}>
              {i + 1}. {label}
            </Text>
          ))}
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` as any }]} />
        </View>
      </View>

      {step === 1 && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.addressCard}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Delivering to</Text>
              <Text style={styles.addressText}>BTM Layout, Bengaluru</Text>
            </View>
            <TouchableOpacity><Text style={styles.changeBtn}>Change</Text></TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Select Order Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.toggleCard, isExchange && styles.toggleCardActive]} onPress={() => setIsExchange(true)}>
              <Text style={styles.toggleIcon}>🔄</Text>
              <Text style={[styles.toggleTitle, isExchange && styles.toggleTitleActive]}>Exchange</Text>
              <Text style={[styles.toggleSub, isExchange && styles.toggleSubActive]}>Empty Can</Text>
              <Text style={[styles.togglePrice, isExchange && styles.togglePriceActive]}>₹{canPrice}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleCard, !isExchange && styles.toggleCardActive]} onPress={() => setIsExchange(false)}>
              <Text style={styles.toggleIcon}>🆕</Text>
              <Text style={[styles.toggleTitle, !isExchange && styles.toggleTitleActive]}>New Can</Text>
              <Text style={[styles.toggleSub, !isExchange && styles.toggleSubActive]}>First Order</Text>
              <Text style={[styles.togglePrice, !isExchange && styles.togglePriceActive]}>₹{canPrice + depositPrice}</Text>
            </TouchableOpacity>
          </View>

          {!isExchange && (
            <View style={styles.depositInfo}>
              <Text style={styles.depositInfoText}>
                💡 ₹{depositPrice} deposit included — <Text style={{ fontWeight: '700' }}>fully refundable</Text> when you return the can
              </Text>
              <Text style={styles.depositBreakdown}>Water ₹{canPrice} × {quantity} + Deposit ₹{depositPrice} × {quantity} = ₹{total - emergencySurcharge}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>How many cans?</Text>
          <View style={styles.qtyCard}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.min(5, quantity + 1))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.qtyTotal}>Total: ₹{total - emergencySurcharge}</Text>

          {quantity >= 5 && (
            <View style={styles.bulkCard}>
              <Text style={styles.bulkText}>Need more than 5 cans?</Text>
              <TouchableOpacity style={styles.bulkBtn}>
                <Text style={styles.bulkBtnText}>📱 Contact Us on WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.emergencyRow} onPress={() => setIsEmergency(!isEmergency)}>
            <View>
              <Text style={styles.emergencyTitle}>⚡ Emergency Delivery</Text>
              <Text style={styles.emergencySub}>Within 2 hours · +₹{emergencyFee} surcharge</Text>
            </View>
            <View style={[styles.toggle, isEmergency && styles.toggleOn]}>
              <View style={[styles.toggleThumb, isEmergency && styles.toggleThumbOn]} />
            </View>
          </TouchableOpacity>

          {isEmergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>⚡ Priority Delivery Active · +₹{emergencyFee} added</Text>
            </View>
          )}

          <Text style={styles.grandTotal}>Grand Total: ₹{total}</Text>
          <TouchableOpacity style={styles.continueBtn} onPress={() => setStep(2)}>
            <Text style={styles.continueBtnText}>Continue to Slot Selection →</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {step === 2 && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Choose Delivery Time</Text>
          <Text style={styles.dateLabel}>📅 {today}</Text>
          <Text style={styles.slotNote}>Order must be placed 30 mins before slot closes</Text>
          <View style={styles.slotList}>
            {SLOTS.map((slot, i) => {
              const past = isSlotPast(i);
              const selected = selectedSlot === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.slotCard, selected && styles.slotCardSelected, past && styles.slotCardPast]}
                  onPress={() => !past && setSelectedSlot(i)}
                  disabled={past}
                  activeOpacity={past ? 1 : 0.7}
                >
                  <View style={styles.slotLeft}>
                    <View style={[styles.slotDot, selected && styles.slotDotSelected, past && styles.slotDotPast]} />
                    <Text style={[styles.slotTime, selected && styles.slotTimeSelected, past && styles.slotTimePast]}>
                      {slot}
                    </Text>
                  </View>
                  {selected ? (
                    <Text style={styles.slotCheck}>✓</Text>
                  ) : (
                    <View style={[styles.slotBadge, past ? styles.slotBadgePast : styles.slotBadgeAvail]}>
                      <Text style={[styles.slotBadgeText, past ? styles.slotBadgeTextPast : styles.slotBadgeTextAvail]}>
                        {past ? 'Passed' : 'Available'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedSlot !== null && (
            <View style={styles.selectedSlotCard}>
              <Text style={styles.selectedSlotText}>✓ Selected: {SLOTS[selectedSlot]}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.continueBtn, selectedSlot === null && styles.continueBtnDisabled]}
            onPress={() => selectedSlot !== null && setStep(3)}
          >
            <Text style={styles.continueBtnText}>Continue to Payment →</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {step === 3 && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Water Can × {quantity}</Text>
              <Text style={styles.summaryVal}>₹{canPrice * quantity}</Text>
            </View>
            {!isExchange && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Deposit × {quantity}</Text>
                <Text style={styles.summaryVal}>₹{depositTotal}</Text>
              </View>
            )}
            {isEmergency && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>⚡ Emergency Surcharge</Text>
                <Text style={styles.summaryVal}>₹{emergencyFee}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Delivery Slot</Text>
              <Text style={styles.summaryVal}>{selectedSlot !== null ? SLOTS[selectedSlot] : '-'}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalKey}>Total</Text>
              <Text style={styles.summaryTotalVal}>₹{total}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Payment Method</Text>
          {['💳 Wallet Balance', '📱 UPI / QR Code', '💳 Credit / Debit Card', '💵 Cash on Delivery'].map((method, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.payCard, paymentMethod === method && styles.payCardSelected]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={styles.payLabel}>{method}</Text>
              {paymentMethod === method && <Text style={styles.payCheck}>✓</Text>}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.placeBtn, (!paymentMethod || loading) && styles.placeBtnDisabled]}
            onPress={placeOrder}
            disabled={!paymentMethod || loading}
          >
            <Text style={styles.placeBtnText}>
              {loading ? 'Placing Order...' : `Place Order · ₹${total}`}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const GD = '#1B5E20';
const GM = '#2E7D32';
const GL = '#4CAF50';
const GP = '#E8F5E9';
const GU = '#F1F8F1';
const BD = '#C8E6C9';
const WH = '#FFFFFF';
const TX = '#1A1A1A';
const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: WH },
  header:             { backgroundColor: GM, paddingTop: Platform.OS === 'android' ? 12 : 0, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4, shadowColor: GD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  backBtn:            { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backIcon:           { fontSize: 22, color: WH, fontWeight: '700' },
  headerTitle:        { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: WH, textAlign: 'center' },
  headerSub:          { fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  progressWrap:       { backgroundColor: WH, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: BD },
  progressSteps:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressStep:       { fontSize: 10, color: MU, fontWeight: '500', letterSpacing: 0.3 },
  progressStepActive: { color: GM, fontWeight: '700' },
  progressBarBg:      { height: 4, backgroundColor: GP, borderRadius: 4, overflow: 'hidden' },
  progressBarFill:    { height: '100%', backgroundColor: GM, borderRadius: 4 },
  body:               { flex: 1, backgroundColor: GU, paddingHorizontal: 16, paddingTop: 16 },
  addressCard:        { backgroundColor: WH, borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: BD, elevation: 2 },
  addressIcon:        { fontSize: 20 },
  addressLabel:       { fontSize: 11, color: MU, marginBottom: 2 },
  addressText:        { fontSize: 14, fontWeight: '700', color: TX },
  changeBtn:          { fontSize: 13, color: GM, fontWeight: '700' },
  sectionTitle:       { fontFamily: SERIF, fontSize: 17, fontWeight: '700', color: TX, marginBottom: 10, marginTop: 4 },
  toggleRow:          { flexDirection: 'row', gap: 10, marginBottom: 12 },
  toggleCard:         { flex: 1, backgroundColor: WH, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: BD, alignItems: 'flex-start', elevation: 1 },
  toggleCardActive:   { backgroundColor: GM, borderColor: GM, elevation: 4 },
  toggleIcon:         { fontSize: 22, marginBottom: 6 },
  toggleTitle:        { fontSize: 13, fontWeight: '700', color: TX, marginBottom: 2 },
  toggleTitleActive:  { color: WH },
  toggleSub:          { fontSize: 11, color: MU, marginBottom: 6 },
  toggleSubActive:    { color: 'rgba(255,255,255,0.75)' },
  togglePrice:        { fontSize: 22, fontWeight: '800', color: GM, fontFamily: SERIF },
  togglePriceActive:  { color: WH },
  depositInfo:        { backgroundColor: GP, borderRadius: 12, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: GM },
  depositInfoText:    { fontSize: 13, color: GD, lineHeight: 20 },
  depositBreakdown:   { fontSize: 12, color: GM, fontWeight: '700', marginTop: 4 },
  qtyCard:            { backgroundColor: WH, borderRadius: 16, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, borderWidth: 1, borderColor: BD, elevation: 2 },
  qtyBtn:             { width: 44, height: 44, borderRadius: 22, backgroundColor: GP, borderWidth: 2, borderColor: GM, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText:         { fontSize: 22, fontWeight: '700', color: GM, lineHeight: 26 },
  qtyNum:             { fontSize: 36, fontWeight: '800', color: TX, minWidth: 50, textAlign: 'center', fontFamily: SERIF },
  qtyTotal:           { fontSize: 16, fontWeight: '700', color: GD, textAlign: 'center', marginBottom: 12 },
  bulkCard:           { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FFE082', alignItems: 'center' },
  bulkText:           { fontSize: 13, color: '#F57F17', fontWeight: '600', marginBottom: 8 },
  bulkBtn:            { backgroundColor: '#25D366', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  bulkBtnText:        { fontSize: 13, color: WH, fontWeight: '700' },
  emergencyRow:       { backgroundColor: WH, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: BD },
  emergencyTitle:     { fontSize: 14, fontWeight: '700', color: TX },
  emergencySub:       { fontSize: 11, color: MU, marginTop: 2 },
  toggle:             { width: 48, height: 26, borderRadius: 13, backgroundColor: '#E0E0E0', padding: 2 },
  toggleOn:           { backgroundColor: GL },
  toggleThumb:        { width: 22, height: 22, borderRadius: 11, backgroundColor: WH, elevation: 2 },
  toggleThumbOn:      { marginLeft: 22 },
  emergencyBadge:     { backgroundColor: '#FFF3E0', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#FFB74D' },
  emergencyBadgeText: { fontSize: 12, color: '#E65100', fontWeight: '600', textAlign: 'center' },
  grandTotal:         { fontFamily: SERIF, fontSize: 22, fontWeight: '800', color: GD, textAlign: 'center', marginVertical: 16 },
  continueBtn:        { backgroundColor: GM, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 4, shadowColor: GD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  continueBtnDisabled:{ backgroundColor: '#A5D6A7', elevation: 0 },
  continueBtnText:    { fontSize: 16, fontWeight: '700', color: WH, letterSpacing: 0.5 },
  dateLabel:          { fontSize: 13, color: MU, marginBottom: 4 },
  slotNote:           { fontSize: 11, color: MU, marginBottom: 14, fontStyle: 'italic' },
  slotList:           { gap: 8, marginBottom: 16 },
  slotCard:           { backgroundColor: WH, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: BD, elevation: 1 },
  slotCardSelected:   { backgroundColor: GM, borderColor: GM, elevation: 4 },
  slotCardPast:       { opacity: 0.4 },
  slotLeft:           { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotDot:            { width: 10, height: 10, borderRadius: 5, backgroundColor: GL },
  slotDotSelected:    { backgroundColor: 'rgba(255,255,255,0.8)' },
  slotDotPast:        { backgroundColor: '#BDBDBD' },
  slotTime:           { fontSize: 15, fontWeight: '700', color: TX },
  slotTimeSelected:   { color: WH },
  slotTimePast:       { color: '#BDBDBD' },
  slotBadge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  slotBadgeAvail:     { backgroundColor: GP },
  slotBadgePast:      { backgroundColor: '#F5F5F5' },
  slotBadgeText:      { fontSize: 11, fontWeight: '600' },
  slotBadgeTextAvail: { color: GD },
  slotBadgeTextPast:  { color: '#BDBDBD' },
  slotCheck:          { fontSize: 18, color: WH, fontWeight: '700' },
  selectedSlotCard:   { backgroundColor: GP, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: BD },
  selectedSlotText:   { fontSize: 14, fontWeight: '700', color: GD, textAlign: 'center' },
  summaryCard:        { backgroundColor: WH, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BD, elevation: 2 },
  summaryRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: GP },
  summaryTotalRow:    { borderBottomWidth: 0, marginTop: 4, paddingTop: 12 },
  summaryKey:         { fontSize: 13, color: MU },
  summaryVal:         { fontSize: 13, fontWeight: '600', color: TX },
  summaryTotalKey:    { fontSize: 16, fontWeight: '800', color: TX },
  summaryTotalVal:    { fontSize: 20, fontWeight: '800', color: GD, fontFamily: SERIF },
  payCard:            { backgroundColor: WH, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderColor: BD, elevation: 1 },
  payCardSelected:    { borderColor: GM, backgroundColor: GU },
  payLabel:           { fontSize: 14, fontWeight: '600', color: TX },
  payCheck:           { fontSize: 18, color: GM, fontWeight: '700' },
  placeBtn:           { backgroundColor: GD, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8, elevation: 6, shadowColor: GD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  placeBtnDisabled:   { backgroundColor: '#A5D6A7', elevation: 0 },
  placeBtnText:       { fontSize: 17, fontWeight: '800', color: WH, letterSpacing: 0.5 },
  successContainer:   { alignItems: 'center', padding: 24, paddingTop: 48 },
  successCircle:      { width: 90, height: 90, borderRadius: 45, backgroundColor: GM, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 8 },
  successTick:        { fontSize: 44, color: WH, fontWeight: '800' },
  successTitle:       { fontFamily: SERIF, fontSize: 30, fontWeight: '800', color: GD, marginBottom: 6 },
  successSub:         { fontSize: 15, color: MU, marginBottom: 24 },
  detailCard:         { width: '100%', backgroundColor: WH, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BD, elevation: 2 },
  detailRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: GP },
  detailKey:          { fontSize: 13, color: MU },
  detailVal:          { fontSize: 13, fontWeight: '700', color: TX },
  vendorCard:         { width: '100%', backgroundColor: '#E3F2FD', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#90CAF9', alignItems: 'center' },
  vendorText:         { fontSize: 14, fontWeight: '700', color: '#1565C0', marginBottom: 4 },
  vendorSub:          { fontSize: 12, color: '#1976D2' },
  trackBtn:           { width: '100%', backgroundColor: GM, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10, elevation: 4 },
  trackBtnText:       { fontSize: 16, fontWeight: '700', color: WH },
  homeBtn:            { width: '100%', backgroundColor: WH, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: BD },
  homeBtnText:        { fontSize: 15, fontWeight: '600', color: GM },
});