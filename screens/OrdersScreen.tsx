import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import BottomNav from './BottomNav';

interface Props { onTabChange?: (tab: string) => void; }

const ORDERS = [
  { id:'#SW-2049', qty:2, type:'Exchange', slot:'12–1 PM',  date:'Today',     status:'Out for Delivery', amt:100,  deposit:0   },
  { id:'#SW-2041', qty:1, type:'Exchange', slot:'11–12 PM', date:'Yesterday', status:'Delivered',        amt:50,   deposit:0   },
  { id:'#SW-2035', qty:2, type:'New Can',  slot:'9–10 AM',  date:'7 May',     status:'Delivered',        amt:340,  deposit:240 },
  { id:'#SW-2020', qty:1, type:'Exchange', slot:'4–5 PM',   date:'5 May',     status:'Delivered',        amt:50,   deposit:0   },
  { id:'#SW-2010', qty:3, type:'Exchange', slot:'7–8 PM',   date:'3 May',     status:'Cancelled',        amt:150,  deposit:0   },
  { id:'#SW-2001', qty:1, type:'New Can',  slot:'9–10 AM',  date:'1 May',     status:'Delivered',        amt:170,  deposit:120 },
];

const STATUS: Record<string, { bg:string; text:string; dot:string }> = {
  'Delivered':        { bg:'#EAF5DE', text:'#3B6D11', dot:'#6DB33F' },
  'Out for Delivery': { bg:'#FFF8E1', text:'#E65100', dot:'#FF8F00' },
  'Pending':          { bg:'#E3F2FD', text:'#1565C0', dot:'#1E88E5' },
  'Cancelled':        { bg:'#FFEBEE', text:'#C62828', dot:'#EF5350' },
};

const FILTERS = ['All', 'Active', 'Delivered', 'Cancelled'];

export default function OrdersScreen({ onTabChange }: Props) {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string|null>(null);

  const filtered = ORDERS.filter(o => {
    if (filter==='All') return true;
    if (filter==='Active') return o.status==='Out for Delivery' || o.status==='Pending';
    return o.status===filter;
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GH} />
      <View style={s.header}>
        <Text style={s.title}>My Orders</Text>
        <Text style={s.sub}>{ORDERS.length} total orders</Text>
      </View>

      <View style={s.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.fPill, filter===f && s.fPillActive]} onPress={() => setFilter(f)}>
              <Text style={[s.fTxt, filter===f && s.fTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:30 }}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTxt}>No orders found</Text>
          </View>
        ) : filtered.map((o, i) => {
          const sc = STATUS[o.status] || STATUS['Pending'];
          const open = expanded === o.id;
          return (
            <TouchableOpacity key={i} style={s.card} onPress={() => setExpanded(open ? null : o.id)} activeOpacity={0.8}>
              <View style={s.cardTop}>
                <View style={[s.iconWrap, { backgroundColor: sc.bg }]}>
                  <Text style={{ fontSize:18 }}>💧</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.orderId}>{o.id}</Text>
                  <Text style={s.orderDetail}>{o.qty} Can{o.qty>1?'s':''} · {o.type}</Text>
                  <Text style={s.orderSlot}>{o.date} · {o.slot}</Text>
                </View>
                <View style={{ alignItems:'flex-end', gap:5 }}>
                  <Text style={s.amount}>₹{o.amt}</Text>
                  <View style={[s.sBadge, { backgroundColor: sc.bg }]}>
                    <View style={[s.sDot, { backgroundColor: sc.dot }]} />
                    <Text style={[s.sTxt, { color: sc.text }]}>{o.status}</Text>
                  </View>
                </View>
              </View>
              {open && (
                <View style={s.expanded}>
                  <View style={s.divider} />
                  <View style={s.detailRow}><Text style={s.dKey}>Order ID</Text><Text style={s.dVal}>{o.id}</Text></View>
                  <View style={s.detailRow}><Text style={s.dKey}>Quantity</Text><Text style={s.dVal}>{o.qty} Can{o.qty>1?'s':''}</Text></View>
                  <View style={s.detailRow}><Text style={s.dKey}>Type</Text><Text style={s.dVal}>{o.type}</Text></View>
                  <View style={s.detailRow}><Text style={s.dKey}>Slot</Text><Text style={s.dVal}>{o.slot}</Text></View>
                  <View style={s.detailRow}><Text style={s.dKey}>Water Amount</Text><Text style={s.dVal}>₹{o.amt - o.deposit}</Text></View>
                  {o.deposit > 0 && <View style={s.detailRow}><Text style={s.dKey}>Deposit</Text><Text style={[s.dVal,{color:'#6A1B9A'}]}>₹{o.deposit} (Refundable)</Text></View>}
                  <View style={[s.detailRow,{borderBottomWidth:0}]}><Text style={[s.dKey,{fontWeight:'700',color:TX}]}>Total</Text><Text style={[s.dVal,{color:GD,fontSize:15}]}>₹{o.amt}</Text></View>
                  {o.status==='Delivered' && <TouchableOpacity style={s.reorderBtn}><Text style={s.reorderTxt}>🔄 Reorder</Text></TouchableOpacity>}
                  {o.status==='Out for Delivery' && <TouchableOpacity style={s.trackBtn}><Text style={s.trackTxt}>📍 Track Order</Text></TouchableOpacity>}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BottomNav activeTab="orders" onTabChange={onTabChange || (() => {})} />
    </SafeAreaView>
  );
}

const GH='#4A7C2F'; const GM='#6DB33F'; const GD='#3B6D11';
const GP='#EAF5DE'; const BD='#D4EAC0'; const WH='#FFFFFF';
const TX='#1A1A1A'; const MU='#757575';
const SERIF = Platform.OS==='ios'?'Georgia':'serif';

const s = StyleSheet.create({
  safe:      { flex:1, backgroundColor:WH },
  header:    { backgroundColor:GH, paddingTop:Platform.OS==='android'?10:4, paddingBottom:14, paddingHorizontal:16, elevation:5, shadowColor:GD, shadowOffset:{width:0,height:3}, shadowOpacity:0.25, shadowRadius:6 },
  title:     { fontFamily:SERIF, fontSize:22, fontWeight:'700', fontStyle:'italic', color:WH },
  sub:       { fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 },
  filterWrap:{ backgroundColor:WH, borderBottomWidth:1, borderBottomColor:BD, paddingVertical:10 },
  filters:   { paddingHorizontal:14, gap:8 },
  fPill:     { paddingHorizontal:16, paddingVertical:6, borderRadius:20, borderWidth:1.5, borderColor:BD, backgroundColor:WH },
  fPillActive:{ backgroundColor:GM, borderColor:GM },
  fTxt:      { fontSize:12, fontWeight:'600', color:MU },
  fTxtActive:{ color:WH },
  scroll:    { flex:1, backgroundColor:'#F5FAF5', paddingHorizontal:14, paddingTop:12 },
  empty:     { alignItems:'center', paddingTop:60 },
  emptyIcon: { fontSize:48, marginBottom:12 },
  emptyTxt:  { fontSize:14, color:MU },
  card:      { backgroundColor:WH, borderRadius:16, padding:14, marginBottom:10, borderWidth:1, borderColor:BD, elevation:1, shadowColor:GM, shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:3 },
  cardTop:   { flexDirection:'row', alignItems:'center', gap:11 },
  iconWrap:  { width:44, height:44, borderRadius:22, justifyContent:'center', alignItems:'center' },
  orderId:   { fontSize:10, color:MU, marginBottom:2 },
  orderDetail:{ fontSize:13, fontWeight:'700', color:TX, marginBottom:2 },
  orderSlot: { fontSize:10, color:MU },
  amount:    { fontFamily:SERIF, fontSize:14, fontWeight:'800', color:GD },
  sBadge:    { flexDirection:'row', alignItems:'center', gap:3, paddingHorizontal:7, paddingVertical:2, borderRadius:20 },
  sDot:      { width:4, height:4, borderRadius:2 },
  sTxt:      { fontSize:8, fontWeight:'700' },
  expanded:  { marginTop:10 },
  divider:   { height:1, backgroundColor:GP, marginBottom:10 },
  detailRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomWidth:1, borderBottomColor:GP },
  dKey:      { fontSize:12, color:MU },
  dVal:      { fontSize:12, fontWeight:'600', color:TX },
  reorderBtn:{ backgroundColor:GP, borderRadius:10, padding:10, alignItems:'center', marginTop:10, borderWidth:1, borderColor:BD },
  reorderTxt:{ fontSize:13, fontWeight:'700', color:GD },
  trackBtn:  { backgroundColor:GM, borderRadius:10, padding:10, alignItems:'center', marginTop:10 },
  trackTxt:  { fontSize:13, fontWeight:'700', color:WH },
});