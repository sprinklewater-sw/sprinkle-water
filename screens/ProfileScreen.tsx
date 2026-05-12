import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Switch } from 'react-native';
import BottomNav from './BottomNav';

interface Props { onTabChange?: (tab: string) => void; }

export default function ProfileScreen({ onTabChange }: Props) {
  const [notif, setNotif] = useState(true);
  const [sms, setSms] = useState(true);

  const addresses = [
    { label:'Home',   addr:'BTM Layout, Bengaluru 560029',  active:true  },
    { label:'Office', addr:'Koramangala, Bengaluru 560034', active:false },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GH} />

      <View style={s.header}>
        <View style={s.avatarWrap}>
          <View style={s.avatar}><Text style={s.avatarTxt}>S</Text></View>
          <View style={s.activeDot} />
        </View>
        <View style={s.profileInfo}>
          <Text style={s.profileName}>Shivaraj</Text>
          <Text style={s.profilePhone}>+91 93456 78901</Text>
          <View style={s.memberBadge}><Text style={s.memberTxt}>🌿 Sprinkle Member</Text></View>
        </View>
        <TouchableOpacity style={s.editBtn}><Text style={s.editBtnTxt}>Edit</Text></TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:30 }}>

        <View style={s.statsRow}>
          {[
            { val:'24',  lbl:'Total Orders' },
            { val:'₹50', lbl:'Per Can'      },
            { val:'1',   lbl:'Cans Held'    },
          ].map((st,i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLbl}>{st.lbl}</Text>
            </View>
          ))}
        </View>

        <View style={s.sec}>
          <View style={s.secRow}>
            <Text style={s.secTitle}>Delivery Addresses</Text>
            <TouchableOpacity><Text style={s.seeAll}>+ Add →</Text></TouchableOpacity>
          </View>
          {addresses.map((a,i) => (
            <View key={i} style={[s.addrCard, a.active && s.addrCardActive]}>
              <Text style={s.addrIcon}>📍</Text>
              <View style={{ flex:1 }}>
                <View style={s.addrTop}>
                  <Text style={s.addrLabel}>{a.label}</Text>
                  {a.active && <View style={s.activeBadge}><Text style={s.activeBadgeTxt}>Default</Text></View>}
                </View>
                <Text style={s.addrText}>{a.addr}</Text>
              </View>
              <TouchableOpacity><Text style={s.addrEdit}>Edit</Text></TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={s.sec}>
          <View style={s.refCard}>
            <Text style={s.refTitle}>🎁 Your Referral Code</Text>
            <Text style={s.refSub}>Share and earn wallet credits for every friend who orders!</Text>
            <View style={s.refCodeRow}>
              <Text style={s.refCode}>SPRINK-SHIV</Text>
              <TouchableOpacity style={s.copyBtn}><Text style={s.copyTxt}>Copy</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Notifications</Text>
          <View style={s.settingCard}>
            {[
              { lbl:'Push Notifications', sub:'Order updates & alerts',       val:notif, set:setNotif },
              { lbl:'SMS Alerts',          sub:'Backup for important updates', val:sms,   set:setSms   },
            ].map((n,i) => (
              <View key={i} style={[s.settingRow, i<1 && s.settingRowBorder]}>
                <View>
                  <Text style={s.settingLbl}>{n.lbl}</Text>
                  <Text style={s.settingSub}>{n.sub}</Text>
                </View>
                <Switch value={n.val} onValueChange={n.set} trackColor={{ false:'#E0E0E0', true:GM }} thumbColor={WH} />
              </View>
            ))}
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Support & Help</Text>
          <View style={s.menuCard}>
            {[
              { icon:'💬', lbl:'WhatsApp Support',  sub:'Chat with us anytime'      },
              { icon:'❓', lbl:'Help / FAQ',         sub:'Common questions answered' },
              { icon:'📄', lbl:'Terms & Conditions', sub:'Our service agreement'     },
              { icon:'🔒', lbl:'Privacy Policy',     sub:'How we handle your data'   },
              { icon:'⭐', lbl:'Rate the App',       sub:'Share your feedback'       },
            ].map((m,i) => (
              <TouchableOpacity key={i} style={[s.menuRow, i<4 && s.menuRowBorder]} activeOpacity={0.7}>
                <Text style={s.menuIcon}>{m.icon}</Text>
                <View style={{ flex:1 }}>
                  <Text style={s.menuLbl}>{m.lbl}</Text>
                  <Text style={s.menuSub}>{m.sub}</Text>
                </View>
                <Text style={s.menuArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Account</Text>
          <View style={s.menuCard}>
            {[
              { icon:'📊', lbl:'Download Invoices',    sub:'Monthly or per order'        },
              { icon:'🔔', lbl:'Notification History', sub:'All past alerts'              },
              { icon:'🗑️', lbl:'Delete Account',      sub:'Permanently remove account'  },
            ].map((m,i) => (
              <TouchableOpacity key={i} style={[s.menuRow, i<2 && s.menuRowBorder, m.lbl==='Delete Account'&&{opacity:0.6}]} activeOpacity={0.7}>
                <Text style={s.menuIcon}>{m.icon}</Text>
                <View style={{ flex:1 }}>
                  <Text style={[s.menuLbl, m.lbl==='Delete Account'&&{color:'#C62828'}]}>{m.lbl}</Text>
                  <Text style={s.menuSub}>{m.sub}</Text>
                </View>
                <Text style={s.menuArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[s.sec, { paddingBottom:4 }]}>
          <TouchableOpacity style={s.logoutBtn}>
            <Text style={s.logoutTxt}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={s.version}>Sprinkle Water v1.0.0 · BTM Layout, Bengaluru</Text>
        </View>

      </ScrollView>

      <BottomNav activeTab="profile" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const GH='#4A7C2F'; const GM='#6DB33F'; const GD='#3B6D11';
const BD='#D4EAC0'; const WH='#FFFFFF'; const TX='#1A1A1A'; const MU='#757575';
const SERIF = Platform.OS==='ios'?'Georgia':'serif';

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:WH },
  header:     { backgroundColor:GH, paddingTop:Platform.OS==='android'?10:4, paddingBottom:16, paddingHorizontal:16, flexDirection:'row', alignItems:'center', gap:14, elevation:5, shadowColor:GD, shadowOffset:{width:0,height:3}, shadowOpacity:0.25, shadowRadius:6 },
  avatarWrap: { position:'relative' },
  avatar:     { width:56, height:56, borderRadius:28, backgroundColor:'rgba(255,255,255,0.25)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.4)' },
  avatarTxt:  { fontFamily:SERIF, fontSize:24, fontWeight:'800', color:WH },
  activeDot:  { position:'absolute', bottom:2, right:2, width:12, height:12, backgroundColor:'#69F0AE', borderRadius:6, borderWidth:2, borderColor:GH },
  profileInfo:{ flex:1 },
  profileName:{ fontFamily:SERIF, fontSize:20, fontWeight:'700', fontStyle:'italic', color:WH, marginBottom:2 },
  profilePhone:{ fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:5 },
  memberBadge:{ backgroundColor:'rgba(255,255,255,0.18)', borderRadius:20, paddingHorizontal:8, paddingVertical:3, alignSelf:'flex-start' },
  memberTxt:  { fontSize:10, color:WH, fontWeight:'600' },
  editBtn:    { backgroundColor:'rgba(255,255,255,0.18)', borderRadius:20, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'rgba(255,255,255,0.3)' },
  editBtnTxt: { fontSize:12, fontWeight:'700', color:WH },
  scroll:     { flex:1, backgroundColor:'#F5FAF5' },
  statsRow:   { flexDirection:'row', gap:8, padding:14 },
  statCard:   { flex:1, backgroundColor:WH, borderRadius:14, padding:14, alignItems:'center', borderWidth:1, borderColor:BD, elevation:1 },
  statVal:    { fontFamily:SERIF, fontSize:20, fontWeight:'800', color:GD, marginBottom:3 },
  statLbl:    { fontSize:10, color:MU, textAlign:'center' },
  sec:        { paddingHorizontal:14, paddingTop:4, paddingBottom:12 },
  secRow:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  secTitle:   { fontFamily:SERIF, fontSize:16, fontWeight:'700', color:TX, marginBottom:10 },
  seeAll:     { fontSize:13, color:GM, fontWeight:'700' },
  addrCard:   { backgroundColor:WH, borderRadius:14, padding:14, marginBottom:8, flexDirection:'row', alignItems:'flex-start', gap:10, borderWidth:1.5, borderColor:BD },
  addrCardActive:{ borderColor:GM, backgroundColor:'#EAF5DE' },
  addrTop:    { flexDirection:'row', alignItems:'center', gap:8, marginBottom:3 },
  addrIcon:   { fontSize:18, marginTop:2 },
  addrLabel:  { fontSize:13, fontWeight:'700', color:TX },
  activeBadge:{ backgroundColor:GM, borderRadius:20, paddingHorizontal:7, paddingVertical:2 },
  activeBadgeTxt:{ fontSize:8, fontWeight:'800', color:WH },
  addrText:   { fontSize:12, color:MU, lineHeight:18 },
  addrEdit:   { fontSize:12, color:GM, fontWeight:'700' },
  refCard:    { backgroundColor:GD, borderRadius:18, padding:16, elevation:3, shadowColor:GD, shadowOffset:{width:0,height:3}, shadowOpacity:0.25, shadowRadius:6 },
  refTitle:   { fontSize:15, fontWeight:'800', color:WH, marginBottom:4 },
  refSub:     { fontSize:12, color:'rgba(255,255,255,0.75)', marginBottom:12, lineHeight:18 },
  refCodeRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:10, padding:10 },
  refCode:    { fontFamily:SERIF, fontSize:16, fontWeight:'800', color:WH, letterSpacing:1 },
  copyBtn:    { backgroundColor:WH, borderRadius:7, paddingHorizontal:12, paddingVertical:5 },
  copyTxt:    { fontSize:11, fontWeight:'800', color:GD },
  settingCard:{ backgroundColor:WH, borderRadius:16, overflow:'hidden', borderWidth:1, borderColor:BD },
  settingRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:14 },
  settingRowBorder:{ borderBottomWidth:1, borderBottomColor:BD },
  settingLbl: { fontSize:13, fontWeight:'600', color:TX, marginBottom:2 },
  settingSub: { fontSize:11, color:MU },
  menuCard:   { backgroundColor:WH, borderRadius:16, overflow:'hidden', borderWidth:1, borderColor:BD },
  menuRow:    { flexDirection:'row', alignItems:'center', gap:12, padding:14 },
  menuRowBorder:{ borderBottomWidth:1, borderBottomColor:BD },
  menuIcon:   { fontSize:20 },
  menuLbl:    { fontSize:13, fontWeight:'600', color:TX, marginBottom:1 },
  menuSub:    { fontSize:11, color:MU },
  menuArrow:  { fontSize:16, color:MU },
  logoutBtn:  { backgroundColor:WH, borderRadius:14, padding:14, alignItems:'center', borderWidth:1.5, borderColor:'#EF9A9A', marginBottom:12 },
  logoutTxt:  { fontSize:14, fontWeight:'700', color:'#C62828' },
  version:    { textAlign:'center', fontSize:10, color:MU },
});
