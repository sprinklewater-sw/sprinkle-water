import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
  Platform, Animated, Dimensions,
} from 'react-native';
import { supabase } from '../lib/supabase';

const { width: SW } = Dimensions.get('window');

interface Props { onOrder?: () => void; onTabChange?: (tab: string) => void; }

interface Order {
  id: string;
  quantity: number;
  is_exchange: boolean;
  delivery_slot: string;
  created_at: string;
  status: string;
  amount: number;
}

interface UserProfile {
  name: string;
  phone: string;
  area: string;
}

interface WalletData {
  wallet_balance: number;
  can_pack_balance: number;
  deposit_balance: number;
}

const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  'delivered':          { bg: '#EAF5DE', text: '#3B6D11', dot: '#6DB33F' },
  'out_for_delivery':   { bg: '#FFF8E1', text: '#E65100', dot: '#FF8F00' },
  'pending':            { bg: '#E3F2FD', text: '#1565C0', dot: '#1E88E5' },
  'confirmed':          { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0' },
  'cancelled':          { bg: '#FFEBEE', text: '#C62828', dot: '#EF5350' },
};

const STATUS_LABEL: Record<string, string> = {
  'delivered':        'Delivered',
  'out_for_delivery': 'Out for Delivery',
  'pending':          'Pending',
  'confirmed':        'Confirmed',
  'cancelled':        'Cancelled',
};

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function HomeScreen({ onOrder, onTabChange }: Props) {
  const [tab, setTab] = useState('home');
  const [profile, setProfile] = useState<UserProfile>({ name: 'Guest', phone: '', area: 'BTM Layout' });
  const [wallet, setWallet] = useState<WalletData>({ wallet_balance: 0, can_pack_balance: 0, deposit_balance: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fade   = useRef(new Animated.Value(0)).current;
  const slide  = useRef(new Animated.Value(24)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const fill   = useRef(new Animated.Value(0)).current;
  const pulse  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(bounce, { toValue: -7, duration: 1400, useNativeDriver: true }),
      Animated.timing(bounce, { toValue:  0, duration: 1400, useNativeDriver: true }),
    ])).start();
    Animated.timing(fill, { toValue: 1, duration: 1800, delay: 300, useNativeDriver: false }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Load user profile
        const { data: profileData } = await supabase
          .from('users')
          .select('name, phone, area')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({
            name: profileData.name || 'Guest',
            phone: profileData.phone || '',
            area: profileData.area || 'BTM Layout',
          });
        }

        // Load wallet
        const { data: walletData } = await supabase
          .from('wallets')
          .select('wallet_balance, can_pack_balance, deposit_balance')
          .eq('user_id', user.id)
          .single();

        if (walletData) {
          setWallet(walletData);
        }

        // Load recent orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersData) {
          setRecentOrders(ordersData);
          // Find active order
          const active = ordersData.find(o =>
            o.status === 'pending' || o.status === 'confirmed' || o.status === 'out_for_delivery'
          );
          setActiveOrder(active || null);
        }
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const waterH = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '62%'] });
  const firstName = profile.name.split(' ')[0];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GH} />

      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>Sprinkle</Text>
          <Text style={s.tagline}>Stay Refreshed</Text>
        </View>
        <View style={s.hRight}>
          <View style={s.locPill}>
            <Text style={s.locTxt}>📍 {profile.area || 'BTM Layout'}</Text>
          </View>
          <TouchableOpacity style={s.bell}>
            <Text style={s.bellIcon}>🔔</Text>
            <View style={s.badge}><Text style={s.badgeTxt}>2</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 88 }}>

        {/* GREETING + HERO */}
        <Animated.View style={[s.heroWrap, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <Text style={s.greet}>{greet()}, <Text style={s.greetName}>{firstName}</Text> 👋</Text>

          {/* HERO CARD */}
          <View style={s.heroCard}>
            <View style={s.wv1} />
            <View style={s.wv2} />
            <View style={s.heroInner}>

              {/* ANIMATED CAN */}
              <Animated.View style={[s.canWrap, { transform: [{ translateY: bounce }] }]}>
                <View style={s.canCap} />
                <View style={s.canBody}>
                  <Animated.View style={[s.waterLayer, { height: waterH }]} />
                  <View style={s.canLblWrap}>
                    <Text style={s.canBrand}>Sprinkle</Text>
                    <Text style={s.canSize}>20L</Text>
                  </View>
                </View>
                <View style={s.canBase} />
                <View style={s.drip1} />
                <View style={s.drip2} />
              </Animated.View>

              {/* HERO TEXT */}
              <View style={s.heroTxt}>
                <Text style={s.heroTitle}>20 Litre{'\n'}Water Can</Text>
                <View style={s.pricePill}>
                  <Text style={s.ppLabel}>Exchange</Text>
                  <Text style={s.ppVal}>₹50</Text>
                </View>
                <View style={[s.pricePill, { backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 4 }]}>
                  <Text style={s.ppLabel}>New Can</Text>
                  <Text style={s.ppVal}>₹170</Text>
                </View>
                <TouchableOpacity onPress={onOrder} activeOpacity={0.85}>
                  <Animated.View style={[s.orderBtn, { transform: [{ scale: pulse }] }]}>
                    <Text style={s.orderBtnTxt}>Order Now →</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* WALLET */}
        <View style={s.sec}>
          <View style={s.secRow}>
            <Text style={s.secTitle}>My Wallet</Text>
            <TouchableOpacity onPress={() => { setTab('wallet'); onTabChange && onTabChange('wallet'); }}>
              <Text style={s.seeAll}>Manage →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.wCards}>
            {[
              { tag: 'W', lbl: 'Wallet Balance', val: `₹${wallet.wallet_balance}`,       sub: 'Add money',     clr: '#3B6D11', bg: '#EAF5DE' },
              { tag: 'B', lbl: 'Can Pack',        val: `${wallet.can_pack_balance} cans`, sub: 'Never expires', clr: '#1565C0', bg: '#E3F2FD' },
              { tag: 'L', lbl: 'Deposit',         val: `₹${wallet.deposit_balance}`,      sub: 'Refundable',    clr: '#6A1B9A', bg: '#F3E5F5' },
            ].map((w, i) => (
              <TouchableOpacity key={i} style={[s.wCard, { backgroundColor: w.bg }]}>
                <View style={[s.wTag, { backgroundColor: w.clr }]}>
                  <Text style={s.wTagTxt}>{w.tag}</Text>
                </View>
                <Text style={[s.wVal, { color: w.clr }]}>{w.val}</Text>
                <Text style={s.wLbl}>{w.lbl}</Text>
                <Text style={s.wSub}>{w.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.wActions}>
            <TouchableOpacity style={s.addBtn} onPress={() => { setTab('wallet'); onTabChange && onTabChange('wallet'); }}>
              <Text style={s.addBtnTxt}>+ Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.packBtn} onPress={() => { setTab('wallet'); onTabChange && onTabChange('wallet'); }}>
              <Text style={s.packBtnTxt}>🎁 5 Cans · ₹225</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTIVE ORDER */}
        {activeOrder && (
          <View style={s.sec}>
            <View style={s.activeCard}>
              <View style={s.activeTop}>
                <View style={s.liveBadge}>
                  <View style={s.liveDot} />
                  <Text style={s.liveTxt}>Live Order</Text>
                </View>
                <TouchableOpacity onPress={() => { setTab('orders'); onTabChange && onTabChange('orders'); }}>
                  <Text style={s.trackLink}>Track →</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.activeId}>
                #{activeOrder.id.slice(0, 8).toUpperCase()} · {activeOrder.quantity} Can{activeOrder.quantity > 1 ? 's' : ''} · {activeOrder.delivery_slot}
              </Text>
              <View style={s.trackBar}>
                {['Placed', 'Out for Delivery', 'Delivered'].map((st, i) => (
                  <View key={i} style={s.trackStep}>
                    <View style={[s.trackCirc, i <= 1 && s.trackCircActive]}>
                      {i <= 1 && <Text style={s.trackTick}>✓</Text>}
                    </View>
                    {i < 2 && <View style={[s.trackLine, i < 1 && s.trackLineActive]} />}
                    <Text style={[s.trackLbl, i <= 1 && s.trackLblActive]}>{st}</Text>
                  </View>
                ))}
              </View>
              <View style={s.vendRow}>
                <Text style={s.vendIcon}>🚴</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.vendName}>Vendor Assigned</Text>
                  <Text style={s.vendSub}>Your delivery partner</Text>
                </View>
                <TouchableOpacity style={s.callBtn}>
                  <Text style={s.callTxt}>📞 Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* QUICK ACTIONS */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Quick Actions</Text>
          <View style={s.quickGrid}>
            {[
              { icon: '⚡', lbl: 'Emergency\nDelivery', sub: '+₹10 surcharge',    clr: '#E65100', bg: '#FFF3E0', action: 'order'   },
              { icon: '📋', lbl: 'Order\nHistory',      sub: 'All past orders',   clr: '#1565C0', bg: '#E3F2FD', action: 'orders'  },
              { icon: '🔄', lbl: 'Refer\n& Earn',       sub: 'Get wallet credits', clr: '#3B6D11', bg: '#EAF5DE', action: 'profile' },
              { icon: '💬', lbl: 'WhatsApp\nSupport',   sub: 'Chat with us',      clr: '#075E54', bg: '#E0F2F1', action: 'profile' },
            ].map((q, i) => (
              <TouchableOpacity key={i} style={[s.qCard, { backgroundColor: q.bg }]}
                onPress={() => {
                  if (q.action === 'order') { onOrder && onOrder(); }
                  else { setTab(q.action); onTabChange && onTabChange(q.action); }
                }}>
                <Text style={s.qIcon}>{q.icon}</Text>
                <Text style={[s.qLbl, { color: q.clr }]}>{q.lbl}</Text>
                <Text style={s.qSub}>{q.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RECENT ORDERS */}
        <View style={s.sec}>
          <View style={s.secRow}>
            <Text style={s.secTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => { setTab('orders'); onTabChange && onTabChange('orders'); }}>
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length === 0 ? (
            <View style={s.emptyOrders}>
              <Text style={s.emptyIcon}>📦</Text>
              <Text style={s.emptyTxt}>No orders yet — place your first order!</Text>
              <TouchableOpacity style={s.firstOrderBtn} onPress={onOrder}>
                <Text style={s.firstOrderTxt}>Order Now →</Text>
              </TouchableOpacity>
            </View>
          ) : recentOrders.map((o, i) => {
            const sc = STATUS[o.status] || STATUS['pending'];
            return (
              <TouchableOpacity key={i} style={s.oCard} activeOpacity={0.8}
                onPress={() => { setTab('orders'); onTabChange && onTabChange('orders'); }}>
                <View style={[s.oIcon, { backgroundColor: sc.bg }]}>
                  <Text style={{ fontSize: 18 }}>💧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.oId}>#{o.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={s.oDetail}>{o.quantity} Can{o.quantity > 1 ? 's' : ''} · {o.is_exchange ? 'Exchange' : 'New Can'}</Text>
                  <Text style={s.oSlot}>{formatDate(o.created_at)} · {o.delivery_slot}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                  <Text style={s.oAmt}>₹{o.amount}</Text>
                  <View style={[s.sBadge, { backgroundColor: sc.bg }]}>
                    <View style={[s.sDot, { backgroundColor: sc.dot }]} />
                    <Text style={[s.sTxt, { color: sc.text }]}>{STATUS_LABEL[o.status] || o.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* REFERRAL */}
        <View style={[s.sec, { paddingBottom: 4 }]}>
          <View style={s.refCard}>
            <Text style={s.refTitle}>🎁 Refer & Earn</Text>
            <Text style={s.refSub}>Share your code — both of you get free wallet credits!</Text>
            <View style={s.refRow}>
              <Text style={s.refCode}>SPRINK-{firstName.toUpperCase().slice(0, 4)}</Text>
              <TouchableOpacity style={s.copyBtn}>
                <Text style={s.copyTxt}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={s.nav}>
        {[
          { id: 'home',    icon: '🏠', lbl: 'Home'    },
          { id: 'orders',  icon: '📦', lbl: 'Orders'  },
          { id: 'wallet',  icon: '💰', lbl: 'Wallet'  },
          { id: 'cans',    icon: '🫙', lbl: 'Cans'    },
          { id: 'profile', icon: '👤', lbl: 'Profile' },
        ].map(t => {
          const active = tab === t.id;
          return (
            <TouchableOpacity key={t.id} style={s.nTab}
              onPress={() => { setTab(t.id); onTabChange && onTabChange(t.id); }}
              activeOpacity={0.7}>
              {active && <View style={s.nBar} />}
              <Text style={s.nIcon}>{t.icon}</Text>
              <Text style={[s.nLbl, active && s.nLblActive]}>{t.lbl}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const GH   = '#4A7C2F';
const GM   = '#6DB33F';
const GD   = '#3B6D11';
const GP   = '#EAF5DE';
const GU   = '#F5FAF5';
const BD   = '#D4EAC0';
const WH   = '#FFFFFF';
const TX   = '#1A1A1A';
const MU   = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: WH },
  header:     { backgroundColor: GH, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 5, shadowColor: GD, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  brand:      { fontFamily: SERIF, fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: WH, letterSpacing: 0.5 },
  tagline:    { fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, fontStyle: 'italic' },
  hRight:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locPill:    { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  locTxt:     { fontSize: 11, color: WH, fontWeight: '600' },
  bell:       { position: 'relative', width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bellIcon:   { fontSize: 16 },
  badge:      { position: 'absolute', top: 4, right: 4, width: 13, height: 13, backgroundColor: '#FF5252', borderRadius: 7, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: WH },
  badgeTxt:   { fontSize: 7, color: WH, fontWeight: '800' },
  scroll:     { flex: 1, backgroundColor: GU },
  heroWrap:   { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 4 },
  greet:      { fontSize: 14, color: MU, marginBottom: 12 },
  greetName:  { fontFamily: SERIF, fontStyle: 'italic', fontWeight: '700', color: GD },
  heroCard:   { backgroundColor: GH, borderRadius: 20, overflow: 'hidden', elevation: 6, shadowColor: GD, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, minHeight: 175 },
  wv1:        { position: 'absolute', bottom: 0, left: -20, right: -20, height: 45, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 36 },
  wv2:        { position: 'absolute', bottom: 8, left: -10, right: -10, height: 35, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 30 },
  heroInner:  { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  canWrap:    { alignItems: 'center', position: 'relative' },
  canCap:     { width: 28, height: 10, backgroundColor: '#81C784', borderRadius: 3, marginBottom: 2, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  canBody:    { width: 62, height: 95, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 7, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', position: 'relative' },
  waterLayer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(129,212,250,0.45)', borderRadius: 5 },
  canLblWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  canBrand:   { fontFamily: SERIF, fontSize: 10, fontStyle: 'italic', fontWeight: '700', color: WH },
  canSize:    { fontSize: 15, fontWeight: '800', color: WH },
  canBase:    { width: 66, height: 9, backgroundColor: '#4A7C2F', borderRadius: 3, marginTop: 2 },
  drip1:      { position: 'absolute', bottom: 7, left: 15, width: 5, height: 7, backgroundColor: 'rgba(129,212,250,0.7)', borderRadius: 3 },
  drip2:      { position: 'absolute', bottom: 1, left: 21, width: 4, height: 5, backgroundColor: 'rgba(129,212,250,0.5)', borderRadius: 2 },
  heroTxt:    { flex: 1, gap: 6 },
  heroTitle:  { fontFamily: SERIF, fontSize: 21, fontWeight: '800', color: WH, lineHeight: 27 },
  pricePill:  { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  ppLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  ppVal:      { fontFamily: SERIF, fontSize: 15, fontWeight: '800', color: WH },
  orderBtn:   { backgroundColor: WH, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', elevation: 3, shadowColor: GD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4 },
  orderBtnTxt:{ fontSize: 12, fontWeight: '800', color: GH },
  sec:        { paddingHorizontal: 14, paddingTop: 16 },
  secRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  secTitle:   { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: TX, marginBottom: 10 },
  seeAll:     { fontSize: 13, color: GM, fontWeight: '700' },
  wCards:     { flexDirection: 'row', gap: 7, marginBottom: 9 },
  wCard:      { flex: 1, borderRadius: 14, padding: 11, alignItems: 'flex-start', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  wTag:       { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 7 },
  wTagTxt:    { fontSize: 9, fontWeight: '800', color: WH },
  wVal:       { fontFamily: SERIF, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  wLbl:       { fontSize: 9, fontWeight: '700', color: TX, marginBottom: 1 },
  wSub:       { fontSize: 8, color: MU },
  wActions:   { flexDirection: 'row', gap: 8 },
  addBtn:     { flex: 1, backgroundColor: WH, borderRadius: 11, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: GM, elevation: 1 },
  addBtnTxt:  { fontSize: 13, fontWeight: '700', color: GM },
  packBtn:    { flex: 1, backgroundColor: GP, borderRadius: 11, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: BD },
  packBtnTxt: { fontSize: 13, fontWeight: '700', color: GD },
  activeCard: { backgroundColor: WH, borderRadius: 18, padding: 15, borderWidth: 1.5, borderColor: '#FFE082', borderLeftWidth: 4, borderLeftColor: '#FF8F00', elevation: 3, shadowColor: '#FF8F00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
  activeTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  liveBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF8E1', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  liveDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF8F00' },
  liveTxt:    { fontSize: 10, fontWeight: '700', color: '#E65100' },
  trackLink:  { fontSize: 13, color: GM, fontWeight: '700' },
  activeId:   { fontSize: 11, color: MU, marginBottom: 13 },
  trackBar:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 13 },
  trackStep:  { alignItems: 'center', flex: 1, position: 'relative' },
  trackCirc:  { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 5, zIndex: 1 },
  trackCircActive: { backgroundColor: GM },
  trackTick:  { fontSize: 10, color: WH, fontWeight: '800' },
  trackLine:  { position: 'absolute', top: 10, left: '50%', right: '-50%', height: 2, backgroundColor: '#E0E0E0', zIndex: 0 },
  trackLineActive: { backgroundColor: GM },
  trackLbl:   { fontSize: 8, color: MU, textAlign: 'center', fontWeight: '500' },
  trackLblActive: { color: GD, fontWeight: '700' },
  vendRow:    { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: GP, borderRadius: 11, padding: 9 },
  vendIcon:   { fontSize: 20 },
  vendName:   { fontSize: 12, fontWeight: '700', color: TX },
  vendSub:    { fontSize: 9, color: MU },
  callBtn:    { backgroundColor: GM, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5 },
  callTxt:    { fontSize: 10, fontWeight: '700', color: WH },
  quickGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  qCard:      { width: (SW - 28 - 9) / 2 - 4, borderRadius: 14, padding: 13, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  qIcon:      { fontSize: 22, marginBottom: 5 },
  qLbl:       { fontSize: 12, fontWeight: '700', lineHeight: 17, marginBottom: 2 },
  qSub:       { fontSize: 9, color: MU },
  emptyOrders:{ alignItems: 'center', paddingVertical: 30, backgroundColor: WH, borderRadius: 16, borderWidth: 1, borderColor: BD },
  emptyIcon:  { fontSize: 40, marginBottom: 8 },
  emptyTxt:   { fontSize: 13, color: MU, marginBottom: 12, textAlign: 'center' },
  firstOrderBtn: { backgroundColor: GM, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  firstOrderTxt: { fontSize: 13, fontWeight: '700', color: WH },
  oCard:      { backgroundColor: WH, borderRadius: 14, padding: 13, marginBottom: 7, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: BD, elevation: 1, shadowColor: GM, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  oIcon:      { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  oId:        { fontSize: 9, color: MU, marginBottom: 2 },
  oDetail:    { fontSize: 12, fontWeight: '700', color: TX, marginBottom: 2 },
  oSlot:      { fontSize: 9, color: MU },
  oAmt:       { fontFamily: SERIF, fontSize: 14, fontWeight: '800', color: GD },
  sBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  sDot:       { width: 4, height: 4, borderRadius: 2 },
  sTxt:       { fontSize: 8, fontWeight: '700' },
  refCard:    { backgroundColor: GD, borderRadius: 18, padding: 16, elevation: 4, shadowColor: GD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8 },
  refTitle:   { fontSize: 15, fontWeight: '800', color: WH, marginBottom: 4 },
  refSub:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 11, lineHeight: 17 },
  refRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 9 },
  refCode:    { fontFamily: SERIF, fontSize: 15, fontWeight: '800', color: WH, letterSpacing: 1 },
  copyBtn:    { backgroundColor: WH, borderRadius: 7, paddingHorizontal: 12, paddingVertical: 5 },
  copyTxt:    { fontSize: 11, fontWeight: '800', color: GD },
  nav:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: WH, borderTopWidth: 1, borderTopColor: BD, flexDirection: 'row', paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 9, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 5 },
  nTab:       { flex: 1, alignItems: 'center', position: 'relative', paddingTop: 2 },
  nBar:       { position: 'absolute', top: -8, width: 30, height: 3, backgroundColor: GM, borderRadius: 2 },
  nIcon:      { fontSize: 19, marginBottom: 2 },
  nLbl:       { fontSize: 9, color: MU, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  nLblActive: { color: GM, fontWeight: '800' },
});
