import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import BottomNav from './BottomNav';

interface Props { onTabChange?: (tab: string) => void; }

export default function CansScreen({ onTabChange }: Props) {
  const [returnReq, setReturnReq] = useState(false);
  const cansHeld = 1;
  const depositPerCan = 120;
  const totalDeposit = cansHeld * depositPerCan;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GH} />
      <View style={s.header}>
        <Text style={s.title}>My Cans</Text>
        <Text style={s.sub}>Track your cans & deposits</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:30 }}>

        <View style={s.heroCard}>
          <View style={s.heroLeft}>
            <Text style={s.heroLabel}>Empty Cans at Home</Text>
            <Text style={s.heroCount}>{cansHeld}</Text>
            <Text style={s.heroSub}>Vendor collects on next delivery</Text>
          </View>
          <View style={s.canIllustration}>
            <Text style={s.canEmoji}>🫙</Text>
            <View style={s.canBadge}><Text style={s.canBadgeTxt}>EMPTY</Text></View>
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Deposit Summary</Text>
          <View style={s.depositCard}>
            <View style={s.depositRow}><Text style={s.dKey}>Cans held at home</Text><Text style={s.dVal}>{cansHeld} can</Text></View>
            <View style={s.depositRow}><Text style={s.dKey}>Deposit per can</Text><Text style={s.dVal}>₹{depositPerCan}</Text></View>
            <View style={s.depositRow}><Text style={s.dKey}>Total deposit held</Text><Text style={[s.dVal,{color:'#6A1B9A',fontWeight:'800'}]}>₹{totalDeposit}</Text></View>
            <View style={[s.depositRow,{borderBottomWidth:0}]}><Text style={s.dKey}>Refund method</Text><Text style={s.dVal}>Bank Account</Text></View>
            <View style={s.depositInfoBox}>
              <Text style={s.depositInfoTxt}>💡 Deposit is <Text style={{fontWeight:'700'}}>fully refundable</Text> when all cans are returned. Refund processed within 3–5 business days.</Text>
            </View>
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Can Policy</Text>
          {[
            { icon:'🔄', title:'Exchange Order',    desc:'Return empty can when new can is delivered. No deposit charged.' },
            { icon:'🆕', title:'New Can Order',     desc:'₹120 deposit charged per can. Fully refundable when returned.' },
            { icon:'⚠️', title:'Lost or Damaged',  desc:'Existing deposit forfeited. Fresh ₹120 deposit required for replacement.' },
            { icon:'🏦', title:'Deposit Refund',    desc:'Refunded directly to your bank account. Admin processes manually.' },
            { icon:'🚪', title:'Account Closure',   desc:'Return all cans first, then deposit sent to your bank account.' },
          ].map((p,i) => (
            <View key={i} style={s.policyCard}>
              <Text style={s.policyIcon}>{p.icon}</Text>
              <View style={{ flex:1 }}>
                <Text style={s.policyTitle}>{p.title}</Text>
                <Text style={s.policyDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Return Empty Can</Text>
          <View style={s.returnCard}>
            <Text style={s.returnTitle}>Mark can as ready for pickup</Text>
            <Text style={s.returnSub}>Vendor will collect your empty can on your next delivery order.</Text>
            <TouchableOpacity style={[s.returnBtn, returnReq && s.returnBtnActive]} onPress={() => setReturnReq(!returnReq)}>
              <Text style={[s.returnBtnTxt, returnReq && s.returnBtnTxtActive]}>
                {returnReq ? '✓ Marked for Pickup' : 'Mark as Ready for Pickup'}
              </Text>
            </TouchableOpacity>
            {returnReq && (
              <View style={s.returnSuccess}>
                <Text style={s.returnSuccessTxt}>✅ Your can is marked for pickup. Vendor will collect it on your next delivery.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Can History</Text>
          {[
            { date:'Today',     action:'New Can Delivered',  cans:'+1', deposit:'+₹120' },
            { date:'Yesterday', action:'Empty Can Collected', cans:'-1', deposit:'—'    },
            { date:'7 May',     action:'Exchange Delivered', cans:'0',  deposit:'—'    },
            { date:'1 May',     action:'New Can Delivered',  cans:'+1', deposit:'+₹120' },
          ].map((h,i) => (
            <View key={i} style={s.histCard}>
              <View style={s.histLeft}>
                <Text style={s.histDate}>{h.date}</Text>
                <Text style={s.histAction}>{h.action}</Text>
              </View>
              <View style={s.histRight}>
                <Text style={[s.histCans, { color: h.cans.startsWith('+')?GD:h.cans==='-1'?'#E65100':MU }]}>{h.cans} can</Text>
                <Text style={s.histDeposit}>{h.deposit}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.sec}>
          <TouchableOpacity style={s.supportCard}>
            <Text style={s.supportIcon}>💬</Text>
            <View style={{ flex:1 }}>
              <Text style={s.supportTitle}>Can Issue? Contact Us</Text>
              <Text style={s.supportSub}>WhatsApp support for damaged or missing cans</Text>
            </View>
            <Text style={{ fontSize:18 }}>→</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <BottomNav activeTab="cans" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const GH='#4A7C2F'; const GM='#6DB33F'; const GD='#3B6D11';
const BD='#D4EAC0'; const WH='#FFFFFF'; const TX='#1A1A1A'; const MU='#757575';
const SERIF = Platform.OS==='ios'?'Georgia':'serif';

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:WH },
  header:     { backgroundColor:GH, paddingTop:Platform.OS==='android'?10:4, paddingBottom:14, paddingHorizontal:16, elevation:5, shadowColor:GD, shadowOffset:{width:0,height:3}, shadowOpacity:0.25, shadowRadius:6 },
  title:      { fontFamily:SERIF, fontSize:22, fontWeight:'700', fontStyle:'italic', color:WH },
  sub:        { fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 },
  scroll:     { flex:1, backgroundColor:'#F5FAF5' },
  heroCard:   { backgroundColor:GH, margin:14, borderRadius:20, padding:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between', elevation:4, shadowColor:GD, shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:8 },
  heroLeft:   {},
  heroLabel:  { fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:4 },
  heroCount:  { fontFamily:SERIF, fontSize:56, fontWeight:'800', color:WH, lineHeight:60 },
  heroSub:    { fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:4 },
  canIllustration:{ alignItems:'center' },
  canEmoji:   { fontSize:52 },
  canBadge:   { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:20, paddingHorizontal:10, paddingVertical:3, marginTop:6 },
  canBadgeTxt:{ fontSize:9, fontWeight:'800', color:WH, letterSpacing:1 },
  sec:        { paddingHorizontal:14, paddingTop:4, paddingBottom:12 },
  secTitle:   { fontFamily:SERIF, fontSize:16, fontWeight:'700', color:TX, marginBottom:10 },
  depositCard:{ backgroundColor:WH, borderRadius:16, padding:16, borderWidth:1, borderColor:'#CE93D8', elevation:1 },
  depositRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#F3E5F5' },
  dKey:       { fontSize:13, color:MU },
  dVal:       { fontSize:13, fontWeight:'600', color:TX },
  depositInfoBox:{ backgroundColor:'#F3E5F5', borderRadius:10, padding:10, marginTop:12 },
  depositInfoTxt:{ fontSize:12, color:'#6A1B9A', lineHeight:18 },
  policyCard: { backgroundColor:WH, borderRadius:14, padding:14, marginBottom:8, flexDirection:'row', alignItems:'flex-start', gap:12, borderWidth:1, borderColor:BD },
  policyIcon: { fontSize:20 },
  policyTitle:{ fontSize:13, fontWeight:'700', color:TX, marginBottom:3 },
  policyDesc: { fontSize:12, color:MU, lineHeight:18 },
  returnCard: { backgroundColor:WH, borderRadius:16, padding:16, borderWidth:1, borderColor:BD },
  returnTitle:{ fontSize:14, fontWeight:'700', color:TX, marginBottom:4 },
  returnSub:  { fontSize:12, color:MU, marginBottom:14, lineHeight:18 },
  returnBtn:  { backgroundColor:'#EAF5DE', borderRadius:12, padding:13, alignItems:'center', borderWidth:1.5, borderColor:BD },
  returnBtnActive:{ backgroundColor:GM, borderColor:GM },
  returnBtnTxt:{ fontSize:13, fontWeight:'700', color:GD },
  returnBtnTxtActive:{ color:WH },
  returnSuccess:{ backgroundColor:'#EAF5DE', borderRadius:10, padding:12, marginTop:10, borderWidth:1, borderColor:BD },
  returnSuccessTxt:{ fontSize:12, color:GD, lineHeight:18 },
  histCard:   { backgroundColor:WH, borderRadius:12, padding:12, marginBottom:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth:1, borderColor:BD },
  histLeft:   {},
  histDate:   { fontSize:10, color:MU, marginBottom:2 },
  histAction: { fontSize:13, fontWeight:'600', color:TX },
  histRight:  { alignItems:'flex-end' },
  histCans:   { fontSize:14, fontWeight:'800' },
  histDeposit:{ fontSize:10, color:MU, marginTop:2 },
  supportCard:{ backgroundColor:WH, borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:BD, elevation:1 },
  supportIcon:{ fontSize:24 },
  supportTitle:{ fontSize:13, fontWeight:'700', color:TX, marginBottom:2 },
  supportSub: { fontSize:11, color:MU },
});
