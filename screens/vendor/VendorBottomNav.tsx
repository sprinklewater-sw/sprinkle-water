import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'home',    icon: '🏠', label: 'Home'    },
  { id: 'orders',  icon: '📦', label: 'Orders'  },
  { id: 'stock',   icon: '🫙', label: 'Stock'   },
  { id: 'wallet',  icon: '💰', label: 'Wallet'  },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export default function VendorBottomNav({ activeTab, onTabChange }: Props) {
  return (
    <View style={s.nav}>
      {TABS.map(t => {
        const active = activeTab === t.id;
        return (
          <TouchableOpacity key={t.id} style={s.tab} onPress={() => onTabChange(t.id)} activeOpacity={0.7}>
            {active && <View style={s.activeBar} />}
            <Text style={s.icon}>{t.icon}</Text>
            <Text style={[s.label, active && s.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  nav:         { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#FFE0B2', flexDirection: 'row', paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 10, elevation: 10 },
  tab:         { flex: 1, alignItems: 'center', position: 'relative', paddingTop: 2 },
  activeBar:   { position: 'absolute', top: -8, width: 30, height: 3, backgroundColor: '#E65100', borderRadius: 2 },
  icon:        { fontSize: 19, marginBottom: 2 },
  label:       { fontSize: 9, color: '#757575', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  labelActive: { color: '#E65100', fontWeight: '800' },
});