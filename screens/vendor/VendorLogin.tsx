import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Platform, TextInput, Alert, ActivityIndicator,
  Animated, KeyboardAvoidingView, ScrollView,
} from 'react-native';

interface Props { onLoginSuccess: () => void; }

export default function VendorLogin({ onLoginSuccess }: Props) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(30);
  const otpRefs = useRef<Array<TextInput | null>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isOtpStep) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setCounter(30);
    intervalRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOtpStep]);

  const sendOtp = () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Enter a valid 10 digit mobile number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOtpStep(true);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1000);
  };

  const verifyOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Enter the 6 digit OTP.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1000);
  };

  const updateOtp = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    if (!digit && index > 0) otpRefs.current[index - 1]?.focus();
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HD} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* LOGO */}
          <Animated.View style={[s.logoSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }] }]}>
            <View style={s.logoCircle}>
              <Text style={s.logoIcon}>🚴</Text>
            </View>
            <Text style={s.brandName}>Sprinkle</Text>
            <Text style={s.brandSub}>Vendor Partner App</Text>
            <View style={s.tagBadge}>
              <Text style={s.tagTxt}>Delivery Partner Portal</Text>
            </View>
          </Animated.View>

          {/* CARD */}
          <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {!isOtpStep ? (
              <>
                <Text style={s.cardTitle}>Welcome Back!</Text>
                <Text style={s.cardSub}>Login with your registered mobile number</Text>
                <View style={s.phoneWrap}>
                  <View style={s.phonePrefix}>
                    <Text style={s.phonePrefixTxt}>🇮🇳 +91</Text>
                  </View>
                  <View style={s.phoneDivider} />
                  <TextInput
                    style={s.phoneInput}
                    placeholder="Enter phone number"
                    placeholderTextColor="#FFCCBC"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                  />
                </View>
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                  <TouchableOpacity style={s.sendBtn} onPress={sendOtp} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.sendBtnTxt}>Send OTP →</Text>}
                  </TouchableOpacity>
                </Animated.View>
                <View style={s.infoBox}>
                  <Text style={s.infoTxt}>📌 Only registered Sprinkle vendors can login. Contact admin if you face issues.</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={s.cardTitle}>Enter OTP</Text>
                <Text style={s.cardSub}>Sent to +91 {phone}</Text>
                <View style={s.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      style={[s.otpBox, digit ? s.otpBoxFilled : null]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={v => updateOtp(v, i)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
                          otpRefs.current[i - 1]?.focus();
                        }
                      }}
                      textAlign="center"
                    />
                  ))}
                </View>
                <TouchableOpacity onPress={() => { if (counter === 0) { setIsOtpStep(false); setOtp(['','','','','','']); } }}>
                  <Text style={s.resendTxt}>{counter > 0 ? `Resend OTP in ${counter}s` : 'Resend OTP'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.sendBtn} onPress={verifyOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.sendBtnTxt}>Verify & Login →</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.backBtn} onPress={() => { setIsOtpStep(false); setOtp(['','','','','','']); }}>
                  <Text style={s.backBtnTxt}>← Change Number</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          <Text style={s.footer}>
            Sprinkle Water · Vendor Partner Program{'\n'}
            <Text style={s.footerLink}>support@sprinklewater.in</Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const HD = '#BF360C'; const OR = '#E65100';
const WH = '#FFFFFF'; const TX = '#1A1A1A'; const MU = '#757575';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: HD },
  scroll:        { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 30 },
  logoSection:   { alignItems: 'center', paddingTop: 50, paddingBottom: 30 },
  logoCircle:    { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  logoIcon:      { fontSize: 44 },
  brandName:     { fontFamily: SERIF, fontSize: 32, fontWeight: '800', fontStyle: 'italic', color: WH, marginBottom: 4 },
  brandSub:      { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 12, letterSpacing: 1 },
  tagBadge:      { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  tagTxt:        { fontSize: 11, color: WH, fontWeight: '600', letterSpacing: 0.5 },
  card:          { backgroundColor: WH, borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  cardTitle:     { fontFamily: SERIF, fontSize: 24, fontWeight: '800', color: TX, marginBottom: 6 },
  cardSub:       { fontSize: 13, color: MU, marginBottom: 24, lineHeight: 20 },
  phoneWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8F5', borderRadius: 14, borderWidth: 1.5, borderColor: '#FFE0B2', marginBottom: 16, overflow: 'hidden' },
  phonePrefix:   { paddingHorizontal: 14, paddingVertical: 14 },
  phonePrefixTxt:{ fontSize: 14, fontWeight: '700', color: OR },
  phoneDivider:  { width: 1, height: 24, backgroundColor: '#FFE0B2' },
  phoneInput:    { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, fontWeight: '600', color: TX },
  sendBtn:       { backgroundColor: OR, borderRadius: 14, padding: 16, alignItems: 'center', elevation: 4, shadowColor: OR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 16 },
  sendBtnTxt:    { fontSize: 16, fontWeight: '800', color: WH, letterSpacing: 0.5 },
  infoBox:       { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FFE0B2' },
  infoTxt:       { fontSize: 12, color: '#BF360C', lineHeight: 18 },
  otpRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  otpBox:        { width: 46, height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#FFE0B2', backgroundColor: '#FFF8F5', fontSize: 22, fontWeight: '800', color: TX },
  otpBoxFilled:  { borderColor: OR, backgroundColor: '#FFF3E0' },
  resendTxt:     { textAlign: 'center', color: OR, fontWeight: '700', marginBottom: 16, textDecorationLine: 'underline' },
  backBtn:       { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  backBtnTxt:    { fontSize: 14, fontWeight: '600', color: OR },
  footer:        { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 24, lineHeight: 20 },
  footerLink:    { color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
});