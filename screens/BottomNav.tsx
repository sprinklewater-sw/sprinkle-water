import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'home',    icon: '🏠', label: 'Home'    },
  { id: 'orders',  icon: '📦', label: 'Orders'  },
  { id: 'wallet',  icon: '💰', label: 'Wallet'  },
  { id: 'cans',    icon: '🫙', label: 'Cans'    },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <View style={s.nav}>
      {TABS.map(t => {
        const active = activeTab === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            style={s.tab}
            onPress={() => onTabChange(t.id)}
            activeOpacity={0.7}
          >
            {active && <View style={s.activeBar} />}
            <Text style={s.icon}>{t.icon}</Text>
            <Text style={[s.label, active && s.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const GM = '#6DB33F';
const MU = '#757575';
const WH = '#FFFFFF';
const BD = '#D4EAC0';

const s = StyleSheet.create({
  nav: {
    backgroundColor: WH,
    borderTopWidth: 1,
    borderTopColor: BD,
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  tab:         { flex: 1, alignItems: 'center', position: 'relative', paddingTop: 2 },
  activeBar:   { position: 'absolute', top: -8, width: 30, height: 3, backgroundColor: GM, borderRadius: 2 },
  icon:        { fontSize: 19, marginBottom: 2 },
  label:       { fontSize: 9, color: MU, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  labelActive: { color: GM, fontWeight: '800' },
});