import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Switch, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import VendorBottomNav from './VendorBottomNav';

interface Props { onTabChange?: (tab: string) => void; }

const VENDOR_ID = '00000000-0000-0000-0000-000000000002';

export default function VendorProfile({ onTabChange }: Props) {
  const [profile, setProfile] = useState({ name: 'Raju Kumar', phone: '+919876543210', area: 'BTM Layout' });
  const [stock, setStock] = useState({ total_delivered_today: 0 });
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(true);
  const [available, setAvailable] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: profileData } = await supabase.from('users').select('name, phone, area').eq('id', VENDOR_ID).single();
      if (profileData) setProfile(profileData);
      const { data: stockData } = await supabase.from('vendor_stock').select('total_delivered_today').eq('vendor_id', VENDOR_ID).single();
      if (stockData) setStock(stockData);
    } catch (err) { console.log('Error:', err); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HD} />
      <View style={s.header}>
        <View style={s.avatarWrap}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{profile.name.charAt(0)}</Text></View>
          <View style={s.activeDot} />
        </View>
        <View style={s.profileInfo}>
          <Text style={s.profileName}>{profile.name}</Text>
          <Text style={s.profilePhone}>{profile.phone}</Text>
          <View style={s.memberBadge}><Text style={s.memberTxt}>🚴 Sprinkle Vendor</Text></View>
        </View>
        <TouchableOpacity style={s.editBtn}><Text style={s.editBtnTxt}>Edit</Text></TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingWrap}><ActivityIndicator size="large" color={OR} /></View>
      ) : (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

          {/* STATS */}
          <View style={s.statsRow}>
            {[
              { val: '4.8 ⭐', lbl: 'Rating'    },
              { val: String(stock.total_delivered_today), lbl: 'Today'    },
              { val: profile.area, lbl: 'Zone'     },
            ].map((st, i) => (
              <View key={i} style={s.statCard}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            ))}
          </View>

          {/* PERFORMANCE */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Performance</Text>
            <View style={s.perfCard}>
              <View style={s.perfRow}><Text style={s.perfKey}>Delivery Rate</Text><Text style={s.perfVal}>98%</Text></View>
              <View style={s.perfRow}><Text style={s.perfKey}>Customer Rating</Text><Text style={s.perfVal}>4.8 ⭐</Text></View>
              <View style={s.perfRow}><Text style={s.perfKey}>Total Deliveries</Text><Text style={s.perfVal}>248</Text></View>
              <View style={[s.perfRow, { borderBottomWidth: 0 }]}><Text style={s.perfKey}>Performance Bonus</Text><Text style={[s.perfVal, { color: '#2E7D32' }]}>Eligible ✅</Text></View>
            </View>
          </View>

          {/* SETTINGS */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Settings</Text>
            <View style={s.settingCard}>
              {[
                { lbl: 'Available for Orders', sub: 'Toggle online/offline', val: available, set: setAvailable },
                { lbl: 'Push Notifications',   sub: 'Order alerts',          val: notif,     set: setNotif     },
              ].map((n, i) => (
                <View key={i} style={[s.settingRow, i < 1 && s.settingRowBorder]}>
                  <View>
                    <Text style={s.settingLbl}>{n.lbl}</Text>
                    <Text style={s.settingSub}>{n.sub}</Text>
                  </View>
                  <Switch value={n.val} onValueChange={n.set} trackColor={{ false: '#E0E0E0', true: OR }} thumbColor={'#FFFFFF'} />
                </View>
              ))}
            </View>
          </View>

          {/* SUPPORT */}
          <View style={s.sec}>
            <Text style={s.secTitle}>Support</Text>
            <View style={s.menuCard}>
              {[
                { icon: '💬', lbl: 'Contact Admin',     sub: 'Report any issue'         },
                { icon: '📄', lbl: 'Terms & Conditions', sub: 'Vendor agreement'         },
                { icon: '📊', lbl: 'Download Statement', sub: 'Monthly PDF statement'    },
                { icon: '🔗', lbl: 'Refer Customers',    sub: 'Share app download link'  },
              ].map((m, i) => (
                <TouchableOpacity key={i} style={[s.menuRow, i < 3 && s.menuRowBorder]} activeOpacity={0.7}>
                  <Text style={s.menuIcon}>{m.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.menuLbl}>{m.lbl}</Text>
                    <Text style={s.menuSub}>{m.sub}</Text>
                  </View>
                  <Text style={s.menuArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[s.sec, { paddingBottom: 4 }]}>
            <TouchableOpacity style={s.logoutBtn}><Text style={s.logoutTxt}>Sign Out</Text></TouchableOpacity>
            <Text style={s.version}>Sprinkle Water Vendor v1.0.0 · {profile.area}</Text>
          </View>

        </ScrollView>
      )}

      <VendorBottomNav activeTab="profile" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const HD = '#BF360C'; const OR = '#E65100';
const WH = '#FFFFFF'; const TX = '#1A1A1A'; const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: WH },
  header:          { backgroundColor: HD, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 5 },
  avatarWrap:      { position: 'relative' },
  avatar:          { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarTxt:       { fontFamily: SERIF, fontSize: 24, fontWeight: '800', color: WH },
  activeDot:       { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, backgroundColor: '#69F0AE', borderRadius: 6, borderWidth: 2, borderColor: HD },
  profileInfo:     { flex: 1 },
  profileName:     { fontFamily: SERIF, fontSize: 20, fontWeight: '700', fontStyle: 'italic', color: WH, marginBottom: 2 },
  profilePhone:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 5 },
  memberBadge:     { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  memberTxt:       { fontSize: 10, color: WH, fontWeight: '600' },
  editBtn:         { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  editBtnTxt:      { fontSize: 12, fontWeight: '700', color: WH },
  loadingWrap:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:          { flex: 1, backgroundColor: '#FFF8F5' },
  statsRow:        { flexDirection: 'row', gap: 8, padding: 14 },
  statCard:        { flex: 1, backgroundColor: WH, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  statVal:         { fontFamily: SERIF, fontSize: 16, fontWeight: '800', color: OR, marginBottom: 3 },
  statLbl:         { fontSize: 10, color: MU, textAlign: 'center' },
  sec:             { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  secTitle:        { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: TX, marginBottom: 10 },
  perfCard:        { backgroundColor: WH, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE0B2', elevation: 1 },
  perfRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FFF3E0' },
  perfKey:         { fontSize: 13, color: MU },
  perfVal:         { fontSize: 13, fontWeight: '700', color: TX },
  settingCard:     { backgroundColor: WH, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#FFE0B2' },
  settingRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  settingRowBorder:{ borderBottomWidth: 1, borderBottomColor: '#FFE0B2' },
  settingLbl:      { fontSize: 13, fontWeight: '600', color: TX, marginBottom: 2 },
  settingSub:      { fontSize: 11, color: MU },
  menuCard:        { backgroundColor: WH, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#FFE0B2' },
  menuRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuRowBorder:   { borderBottomWidth: 1, borderBottomColor: '#FFE0B2' },
  menuIcon:        { fontSize: 20 },
  menuLbl:         { fontSize: 13, fontWeight: '600', color: TX, marginBottom: 1 },
  menuSub:         { fontSize: 11, color: MU },
  menuArrow:       { fontSize: 16, color: MU },
  logoutBtn:       { backgroundColor: WH, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#EF9A9A', marginBottom: 12 },
  logoutTxt:       { fontSize: 14, fontWeight: '700', color: '#C62828' },
  version:         { textAlign: 'center', fontSize: 10, color: MU },
});