import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, TextInput } from 'react-native';
import BottomNav from './BottomNav';

interface Props { onTabChange?: (tab: string) => void; }

const TRANSACTIONS = [
  { id:'TXN001', type:'debit',  desc:'Order #SW-2049 · 2 Cans', date:'Today 12:30 PM',     amt:100, bal:250 },
  { id:'TXN002', type:'credit', desc:'Wallet Top Up',             date:'Today 10:00 AM',     amt:200, bal:350 },
  { id:'TXN003', type:'debit',  desc:'Order #SW-2041 · 1 Can',   date:'Yesterday 11:15 AM', amt:50,  bal:150 },
  { id:'TXN004', type:'credit', desc:'Referral Bonus',            date:'6 May 3:00 PM',      amt:30,  bal:200 },
  { id:'TXN005', type:'debit',  desc:'Order #SW-2035 · 2 Cans',  date:'7 May 9:30 AM',      amt:100, bal:170 },
  { id:'TXN006', type:'credit', desc:'Deposit Refund',            date:'4 May 2:00 PM',      amt:120, bal:270 },
];

const QUICK_AMOUNTS = [50, 100, 200, 500];

export default function WalletScreen({ onTabChange }: Props) {
  const [customAmt, setCustomAmt] = useState('');
  const [selectedAmt, setSelectedAmt] = useState<number|null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GH} />
      <View style={s.header}>
        <Text style={s.title}>My Wallet</Text>
        <Text style={s.sub}>All your balances in one place</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:30 }}>

        <View style={s.balanceGrid}>
          {[
            { tag:'W', lbl:'Wallet Balance',   val:'₹250',  sub:'Available to spend',  clr:'#3B6D11', bg:'#EAF5DE', border:'#C8E6A0' },
            { tag:'B', lbl:'Can Pack Balance', val:'3 cans',sub:'Never expires',        clr:'#1565C0', bg:'#E3F2FD', border:'#90CAF9' },
            { tag:'L', lbl:'Security Deposit', val:'₹120',  sub:'Refundable to bank',  clr:'#6A1B9A', bg:'#F3E5F5', border:'#CE93D8' },
          ].map((b,i) => (
            <View key={i} style={[s.balCard, { backgroundColor:b.bg, borderColor:b.border }]}>
              <View style={[s.balTag, { backgroundColor:b.clr }]}><Text style={s.balTagTxt}>{b.tag}</Text></View>
              <Text style={[s.balVal, { color:b.clr }]}>{b.val}</Text>
              <Text style={s.balLbl}>{b.lbl}</Text>
              <Text style={s.balSub}>{b.sub}</Text>
            </View>
          ))}
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Add Money</Text>
          <View style={s.quickRow}>
            {QUICK_AMOUNTS.map(a => (
              <TouchableOpacity key={a} style={[s.qAmt, selectedAmt===a && s.qAmtActive]} onPress={() => { setSelectedAmt(a); setCustomAmt(String(a)); }}>
                <Text style={[s.qAmtTxt, selectedAmt===a && s.qAmtTxtActive]}>₹{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.customRow}>
            <View style={s.inputWrap}>
              <Text style={s.inputPrefix}>₹</Text>
              <TextInput style={s.input} placeholder="Enter amount" keyboardType="numeric" value={customAmt} onChangeText={t => { setCustomAmt(t); setSelectedAmt(null); }} placeholderTextColor={MU} />
            </View>
            <TouchableOpacity style={s.addBtn}><Text style={s.addBtnTxt}>Add Money</Text></TouchableOpacity>
          </View>
          <View style={s.suggestRow}>
            {['Recharge for 5 cans ₹225','Recharge for 10 cans ₹450'].map((sg,i) => (
              <TouchableOpacity key={i} style={s.suggest}><Text style={s.suggestTxt}>{sg}</Text></TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.secTitle}>Buy Can Pack</Text>
          <View style={s.packRow}>
            {[
              { cans:5,  price:225, save:25,  popular:false },
              { cans:10, price:450, save:50,  popular:true  },
            ].map((p,i) => (
              <TouchableOpacity key={i} style={[s.packCard, p.popular && s.packCardPopular]}>
                {p.popular && <View style={s.popularBadge}><Text style={s.popularTxt}>Best Value</Text></View>}
                <Text style={s.packCans}>{p.cans} Cans</Text>
                <Text style={s.packPrice}>₹{p.price}</Text>
                <Text style={s.packSave}>Save ₹{p.save}</Text>
                <Text style={s.packNote}>Never expires · Use anytime</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.sec}>
          <View style={s.depositCard}>
            <View style={s.depositTop}>
              <Text style={s.depositTitle}>🔒 Security Deposit</Text>
              <Text style={s.depositAmt}>₹120</Text>
            </View>
            <Text style={s.depositSub}>1 can held · Refundable when all cans returned</Text>
            <View style={s.depositRow}><Text style={s.depositKey}>Deposit per can</Text><Text style={s.depositVal}>₹120</Text></View>
            <View style={s.depositRow}><Text style={s.depositKey}>Cans held</Text><Text style={s.depositVal}>1</Text></View>
            <View style={[s.depositRow,{borderBottomWidth:0}]}><Text style={s.depositKey}>Refund goes to</Text><Text style={s.depositVal}>Bank Account</Text></View>
            <TouchableOpacity style={s.refundBtn}><Text style={s.refundTxt}>Request Refund</Text></TouchableOpacity>
          </View>
        </View>

        <View style={s.sec}>
          <View style={s.secRow}>
            <Text style={s.secTitle}>Transaction History</Text>
            <TouchableOpacity><Text style={s.seeAll}>Download →</Text></TouchableOpacity>
          </View>
          {TRANSACTIONS.map((t,i) => (
            <View key={i} style={s.txnCard}>
              <View style={[s.txnIcon, { backgroundColor: t.type==='credit'?'#EAF5DE':'#FFF3E0' }]}>
                <Text style={{ fontSize:16 }}>{t.type==='credit'?'↓':'↑'}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={s.txnDesc}>{t.desc}</Text>
                <Text style={s.txnDate}>{t.date}</Text>
              </View>
              <View style={{ alignItems:'flex-end' }}>
                <Text style={[s.txnAmt, { color: t.type==='credit'?GD:'#E65100' }]}>{t.type==='credit'?'+':'-'}₹{t.amt}</Text>
                <Text style={s.txnBal}>Bal: ₹{t.bal}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.sec}>
          <View style={s.transferCard}>
            <Text style={s.transferTitle}>↔️ Transfer to Friend</Text>
            <Text style={s.transferSub}>Send wallet balance to any Sprinkle customer</Text>
            <TouchableOpacity style={s.transferBtn}><Text style={s.transferBtnTxt}>Transfer Wallet Balance</Text></TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      <BottomNav activeTab="wallet" onTabChange={onTabChange || (() => {})} />
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
  balanceGrid:{ flexDirection:'row', gap:8, padding:14 },
  balCard:    { flex:1, borderRadius:14, padding:11, borderWidth:1 },
  balTag:     { width:22, height:22, borderRadius:11, justifyContent:'center', alignItems:'center', marginBottom:7 },
  balTagTxt:  { fontSize:9, fontWeight:'800', color:WH },
  balVal:     { fontFamily:SERIF, fontSize:16, fontWeight:'800', marginBottom:2 },
  balLbl:     { fontSize:9, fontWeight:'700', color:TX, marginBottom:1 },
  balSub:     { fontSize:8, color:MU },
  sec:        { paddingHorizontal:14, paddingTop:4, paddingBottom:12 },
  secRow:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  secTitle:   { fontFamily:SERIF, fontSize:16, fontWeight:'700', color:TX, marginBottom:10 },
  seeAll:     { fontSize:13, color:GM, fontWeight:'700' },
  quickRow:   { flexDirection:'row', gap:8, marginBottom:10 },
  qAmt:       { flex:1, backgroundColor:WH, borderRadius:10, paddingVertical:10, alignItems:'center', borderWidth:1.5, borderColor:BD },
  qAmtActive: { backgroundColor:GM, borderColor:GM },
  qAmtTxt:    { fontSize:13, fontWeight:'700', color:TX },
  qAmtTxtActive:{ color:WH },
  customRow:  { flexDirection:'row', gap:8, marginBottom:10 },
  inputWrap:  { flex:1, flexDirection:'row', alignItems:'center', backgroundColor:WH, borderRadius:10, borderWidth:1.5, borderColor:BD, paddingHorizontal:12 },
  inputPrefix:{ fontSize:16, fontWeight:'700', color:GD, marginRight:4 },
  input:      { flex:1, fontSize:15, color:TX, paddingVertical:10 },
  addBtn:     { backgroundColor:GM, borderRadius:10, paddingHorizontal:16, paddingVertical:12, justifyContent:'center' },
  addBtnTxt:  { fontSize:13, fontWeight:'700', color:WH },
  suggestRow: { gap:6 },
  suggest:    { backgroundColor:'#EAF5DE', borderRadius:8, padding:10, borderWidth:1, borderColor:BD },
  suggestTxt: { fontSize:12, fontWeight:'600', color:GD },
  packRow:    { flexDirection:'row', gap:10 },
  packCard:   { flex:1, backgroundColor:WH, borderRadius:16, padding:14, borderWidth:1.5, borderColor:BD, overflow:'hidden' },
  packCardPopular:{ borderColor:GM, backgroundColor:'#EAF5DE' },
  popularBadge:{ backgroundColor:GM, borderRadius:6, paddingHorizontal:8, paddingVertical:3, alignSelf:'flex-start', marginBottom:8 },
  popularTxt: { fontSize:9, fontWeight:'800', color:WH },
  packCans:   { fontFamily:SERIF, fontSize:18, fontWeight:'800', color:TX, marginBottom:4 },
  packPrice:  { fontFamily:SERIF, fontSize:22, fontWeight:'800', color:GD, marginBottom:2 },
  packSave:   { fontSize:11, fontWeight:'700', color:GM, marginBottom:4 },
  packNote:   { fontSize:9, color:MU },
  depositCard:{ backgroundColor:WH, borderRadius:16, padding:16, borderWidth:1, borderColor:'#CE93D8' },
  depositTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  depositTitle:{ fontSize:14, fontWeight:'700', color:TX },
  depositAmt: { fontFamily:SERIF, fontSize:20, fontWeight:'800', color:'#6A1B9A' },
  depositSub: { fontSize:11, color:MU, marginBottom:12 },
  depositRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:7, borderBottomWidth:1, borderBottomColor:'#F3E5F5' },
  depositKey: { fontSize:12, color:MU },
  depositVal: { fontSize:12, fontWeight:'600', color:TX },
  refundBtn:  { backgroundColor:'#F3E5F5', borderRadius:10, padding:10, alignItems:'center', marginTop:12, borderWidth:1, borderColor:'#CE93D8' },
  refundTxt:  { fontSize:13, fontWeight:'700', color:'#6A1B9A' },
  txnCard:    { backgroundColor:WH, borderRadius:12, padding:12, marginBottom:8, flexDirection:'row', alignItems:'center', gap:10, borderWidth:1, borderColor:BD },
  txnIcon:    { width:36, height:36, borderRadius:18, justifyContent:'center', alignItems:'center' },
  txnDesc:    { fontSize:12, fontWeight:'600', color:TX, marginBottom:2 },
  txnDate:    { fontSize:10, color:MU },
  txnAmt:     { fontSize:14, fontWeight:'800' },
  txnBal:     { fontSize:9, color:MU },
  transferCard:{ backgroundColor:WH, borderRadius:16, padding:16, borderWidth:1, borderColor:BD },
  transferTitle:{ fontSize:14, fontWeight:'700', color:TX, marginBottom:4 },
  transferSub:{ fontSize:11, color:MU, marginBottom:12 },
  transferBtn:{ backgroundColor:GM, borderRadius:10, padding:12, alignItems:'center' },
  transferBtnTxt:{ fontSize:13, fontWeight:'700', color:WH },
});
