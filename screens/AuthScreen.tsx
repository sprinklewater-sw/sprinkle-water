import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from 'react-native-svg';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'signup';
type AuthScreenProps = { onAuthSuccess?: () => void };
type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'phone-pad';
  icon?: string;
};

const ZONES = [
  'BTM Layout 📍',
  'SG Palya 📍',
  'Koramangala 📍',
  'HSR Layout 📍',
  'Indiranagar 📍',
  'Jayanagar 📍',
];
const OTP_LENGTH = 6;
const STREAM_COUNT = 26;
const GALAXY_STARS = [
  { x: 16, y: 20, r: 0.9 }, { x: 23, y: 34, r: 0.8 }, { x: 30, y: 16, r: 1 }, { x: 37, y: 27, r: 0.9 },
  { x: 44, y: 41, r: 0.8 }, { x: 51, y: 20, r: 1 }, { x: 58, y: 35, r: 0.9 }, { x: 65, y: 24, r: 0.8 },
  { x: 22, y: 52, r: 0.9 }, { x: 29, y: 62, r: 1 }, { x: 36, y: 54, r: 0.8 }, { x: 43, y: 68, r: 0.9 },
  { x: 50, y: 58, r: 0.8 }, { x: 57, y: 72, r: 1 }, { x: 64, y: 62, r: 0.9 }, { x: 27, y: 79, r: 0.8 },
  { x: 34, y: 86, r: 0.9 }, { x: 41, y: 78, r: 0.8 }, { x: 48, y: 90, r: 1 }, { x: 55, y: 82, r: 0.9 },
  { x: 61, y: 47, r: 0.8 }, { x: 20, y: 68, r: 0.9 },
];

const AnimatedG = Animated.createAnimatedComponent(G);

function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  icon = '✍️',
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 190,
      useNativeDriver: false,
    }).start();
  }, [focused, labelAnim, value]);

  return (
    <View style={styles.fieldShell}>
      <Animated.Text
        style={[
          styles.floatingLabel,
          {
            top: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 8] }),
            fontSize: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 12] }),
            color: focused ? '#84F1FF' : 'rgba(185, 224, 255, 0.68)',
          },
        ]}
      >
        {label}
      </Animated.Text>
      <Text style={styles.inputIcon}>{icon}</Text>
      <TextInput
        style={styles.floatingInput}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder=""
        placeholderTextColor="transparent"
      />
    </View>
  );
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [zone, setZone] = useState('');
  const [showZoneMenu, setShowZoneMenu] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(30);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const phoneGlow = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const ctaHover = useRef(new Animated.Value(0)).current;
  const ctaFlow = useRef(new Animated.Value(0)).current;
  const ctaRipple = useRef(new Animated.Value(0)).current;
  const waterShine = useRef(new Animated.Value(-240)).current;
  const dropBob = useRef(new Animated.Value(0)).current;
  const dropGlowPulse = useRef(new Animated.Value(0)).current;
  const waveShift1 = useRef(new Animated.Value(0)).current;
  const waveShift2 = useRef(new Animated.Value(0)).current;
  const dripProgress = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otpRefs = useRef<Array<TextInput | null>>([]);

  const streamAnims = useRef(
    Array.from({ length: STREAM_COUNT }, (_, i) => ({
      x: new Animated.Value(-220 + i * 18),
      y: new Animated.Value(-260 + i * 26),
      opacity: new Animated.Value(0.04 + (i % 4) * 0.012),
    }))
  ).current;
  const letterAnims = useRef('SPRINKLE'.split('').map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: authMode === 'login' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 88,
    }).start();
  }, [authMode, slideAnim]);

  useEffect(() => {
    Animated.timing(phoneGlow, {
      toValue: isPhoneFocused ? 1 : 0,
      duration: 230,
      useNativeDriver: false,
    }).start();
  }, [isPhoneFocused, phoneGlow]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dropBob, {
          toValue: -10,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(dropBob, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dropGlowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(dropGlowPulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(waveShift1, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.timing(waveShift2, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dripProgress, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(dripProgress, { toValue: 0, duration: 1, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(waterShine, {
          toValue: 240,
          duration: 980,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(3020),
        Animated.timing(waterShine, { toValue: -240, duration: 10, useNativeDriver: true }),
      ])
    ).start();

    letterAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 110),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    streamAnims.forEach((stream, i) => {
      const duration = 4300 + (i % 8) * 520;
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(stream.x, {
              toValue: 520 + i * 16,
              duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(stream.y, {
              toValue: 460 + i * 10,
              duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(stream.x, {
              toValue: -250,
              duration: 20,
              useNativeDriver: true,
            }),
            Animated.timing(stream.y, {
              toValue: -280,
              duration: 20,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaFlow, {
          toValue: 1,
          duration: 2300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(ctaFlow, { toValue: 0, duration: 20, useNativeDriver: true }),
      ])
    ).start();

  }, [
    ctaFlow,
    dropBob,
    dropGlowPulse,
    letterAnims,
    waveShift1,
    waveShift2,
    dripProgress,
    streamAnims,
    waterShine,
  ]);

  useEffect(() => {
    if (!isOtpStep) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    setCounter(30);
    intervalRef.current = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOtpStep]);

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const completePhone = `+91${phoneDigits}`;
  const otpCode = otp.join('');
  const waveTransform1 = waveShift1.interpolate({
    inputRange: [0, 1],
    outputRange: ['translate(0 0)', 'translate(-40 0)'],
  });
  const waveTransform2 = waveShift2.interpolate({
    inputRange: [0, 1],
    outputRange: ['translate(0 0)', 'translate(-36 0)'],
  });
  const dropGlowStrong = dropGlowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0.9] });
  const dripOpacity = dripProgress.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.95, 0.8, 0] });
  const dripScale = dripProgress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1.05] });
  const dripY = dripProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const splashScale = dripProgress.interpolate({ inputRange: [0, 0.72, 1], outputRange: [0.4, 0.4, 1.5] });
  const splashOpacity = dripProgress.interpolate({ inputRange: [0, 0.74, 1], outputRange: [0, 0, 0.6] });

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(ctaScale, { toValue: 0.97, tension: 220, friction: 7, useNativeDriver: true }),
      Animated.timing(ctaHover, { toValue: 1, duration: 170, useNativeDriver: false }),
      Animated.timing(ctaRipple, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start(() => ctaRipple.setValue(0));
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(ctaScale, { toValue: 1, tension: 170, friction: 9, useNativeDriver: true }),
      Animated.timing(ctaHover, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start();
  };

  const triggerOtp = async () => {
    if (phoneDigits.length !== 10) return Alert.alert('Invalid phone', 'Enter a valid 10 digit mobile number.');
    if (authMode === 'signup' && (!fullName.trim() || !zone.trim())) {
      return Alert.alert('Missing details', 'Please enter full name and select your area.');
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: completePhone });
    setLoading(false);
    if (error) return Alert.alert('OTP failed', error.message);
    setIsOtpStep(true);
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  };

  const verifyOtp = async () => {
    if (otpCode.length !== OTP_LENGTH) return Alert.alert('Invalid OTP', 'Please enter the 6 digit OTP.');
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone: completePhone, token: otpCode, type: 'sms' });
    if (error || !data.user) {
      setLoading(false);
      return Alert.alert('Verification failed', error?.message ?? 'Could not verify OTP.');
    }
    const userId = data.user.id;
    const { data: existingUser, error: existingErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (existingErr) {
      setLoading(false);
      return Alert.alert('Profile check failed', existingErr.message);
    }
    if (!existingUser) {
      const { error: insertErr } = await supabase.from('users').insert({
        id: userId,
        role: 'customer',
        name: fullName.trim() || null,
        phone: completePhone,
        area: zone || null,
      });
      if (insertErr) {
        setLoading(false);
        return Alert.alert('Account setup failed', insertErr.message);
      }
    }
    setLoading(false);
    onAuthSuccess?.();
  };

  const updateOtpDigit = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
    if (!digit && index > 0) otpRefs.current[index - 1]?.focus();
  };
  const onOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const resendOtp = async () => {
    if (counter > 0) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: completePhone });
    setLoading(false);
    if (error) return Alert.alert('Resend failed', error.message);
    setCounter(30);
    intervalRef.current = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#040D21', '#0A1628', '#0E2A4A']} style={StyleSheet.absoluteFill} />

      <BlurView intensity={45} tint="dark" style={[styles.orb, styles.orbTopRight]} />
      <BlurView intensity={42} tint="dark" style={[styles.orb, styles.orbTopLeft]} />
      <BlurView intensity={48} tint="dark" style={[styles.orb, styles.orbBottom]} />

      {streamAnims.map((stream, i) => (
        <Animated.View
          key={`stream-${i}`}
          style={[
            styles.stream,
            {
              transform: [{ translateX: stream.x }, { translateY: stream.y }, { rotate: '-30deg' }],
              opacity: stream.opacity,
            },
          ]}
        />
      ))}

      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <Animated.View style={[styles.dropLayer, { transform: [{ translateY: dropBob }] }]}>
              <Animated.View style={[styles.dropGlowA, { opacity: dropGlowStrong }]} />
              <Animated.View
                style={[
                  styles.dropGlowB,
                  { opacity: dropGlowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.72] }) },
                ]}
              />
              <Svg width={80} height={100} viewBox="0 0 80 100">
                <Defs>
                  <SvgGradient id="mainDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#00d4ff" />
                    <Stop offset="100%" stopColor="#0033cc" />
                  </SvgGradient>
                  <ClipPath id="mainDropClip">
                    <Path d="M40 2C40 2 9 37 9 60C9 82 23.8 98 40 98C56.2 98 71 82 71 60C71 37 40 2 40 2Z" />
                  </ClipPath>
                </Defs>
                <Path d="M40 2C40 2 9 37 9 60C9 82 23.8 98 40 98C56.2 98 71 82 71 60C71 37 40 2 40 2Z" fill="url(#mainDropGrad)" />
                <AnimatedG clipPath="url(#mainDropClip)" transform={waveTransform1 as any}>
                  <Path d="M-40 58C-30 50 -20 66 -10 58C0 50 10 66 20 58C30 50 40 66 50 58C60 50 70 66 80 58C90 50 100 66 110 58V110H-40Z" fill="rgba(255,255,255,0.22)" />
                </AnimatedG>
                <AnimatedG clipPath="url(#mainDropClip)" transform={waveTransform2 as any}>
                  <Path d="M-36 64C-26 56 -16 72 -6 64C4 56 14 72 24 64C34 56 44 72 54 64C64 56 74 72 84 64C94 56 104 72 114 64V110H-36Z" fill="rgba(255,255,255,0.16)" />
                </AnimatedG>
                <Path
                  d="M40 2C40 2 9 37 9 60C9 82 23.8 98 40 98C56.2 98 71 82 71 60C71 37 40 2 40 2Z"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.2"
                />
                <Ellipse cx={30} cy={26} rx={8} ry={5.4} fill="rgba(255,255,255,0.28)" />
                <Ellipse cx={52} cy={18} rx={2.3} ry={2.3} fill="rgba(255,255,255,0.5)" />
              </Svg>
              <Animated.View
                style={[
                  styles.dripWrap,
                  {
                    opacity: dripOpacity,
                    transform: [{ translateY: dripY }, { scale: dripScale }],
                  },
                ]}
              >
                <Svg width={16} height={24} viewBox="0 0 16 24">
                  <Defs>
                    <SvgGradient id="dripGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#00d4ff" />
                      <Stop offset="100%" stopColor="#0033cc" />
                    </SvgGradient>
                  </Defs>
                  <Path d="M8 1C8 1 2 9 2 14C2 19 4.8 22 8 22C11.2 22 14 19 14 14C14 9 8 1 8 1Z" fill="url(#dripGrad)" />
                </Svg>
              </Animated.View>
              <Animated.View
                style={[
                  styles.splashRing,
                  {
                    opacity: splashOpacity,
                    transform: [{ scaleX: splashScale }, { scaleY: splashScale }],
                  },
                ]}
              />
            </Animated.View>

            <Text style={styles.sprinkleWord}>SPRINKLE</Text>

            <View style={styles.waterWrap}>
              <LinearGradient colors={['#00D4FF', '#00F5A0', '#0066FF', '#00D4FF']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
                <Text style={styles.waterText}>WATER</Text>
              </LinearGradient>
              <Animated.View style={[styles.waterShine, { transform: [{ translateX: waterShine }, { rotate: '18deg' }] }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <Text style={styles.tagline}>Pure · Fresh · Delivered</Text>
          </View>

          <BlurView intensity={30} tint="dark" style={styles.tabWrap}>
            <View style={styles.tabInner}>
              <Animated.View
                style={[
                  styles.tabSliderGlow,
                  { transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }) }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.tabSlider,
                  { transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }) }] },
                ]}
              >
                <LinearGradient colors={['#1E90FF', '#00D4FF']} style={styles.tabSlider} />
              </Animated.View>
              <TouchableOpacity style={styles.tabBtn} onPress={() => setAuthMode('login')}>
                <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabBtn} onPress={() => setAuthMode('signup')}>
                <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          <BlurView intensity={24} tint="dark" style={styles.card}>
            {!isOtpStep ? (
              <>
                {authMode === 'signup' ? (
                  <>
                    <FloatingInput label="Full Name" value={fullName} onChangeText={setFullName} icon="👤" />
                    <View style={styles.fieldShell}>
                      <Text style={[styles.dropdownLabel, zone ? styles.dropdownLabelRaised : null]}>Service Zone</Text>
                      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowZoneMenu((prev) => !prev)}>
                        <Text style={[styles.dropdownText, !zone && styles.dropdownPlaceholder]}>{zone || 'Select Bengaluru area'}</Text>
                        <Text style={styles.dropdownChevron}>{showZoneMenu ? '▴' : '▾'}</Text>
                      </TouchableOpacity>
                      {showZoneMenu ? (
                        <View style={styles.zoneMenu}>
                          {ZONES.map((item) => (
                            <TouchableOpacity
                              key={item}
                              style={styles.zoneItem}
                              onPress={() => {
                                setZone(item);
                                setShowZoneMenu(false);
                              }}
                            >
                              <Text style={styles.zoneItemText}>{item}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </>
                ) : null}

                <Animated.View
                  style={[
                    styles.phoneField,
                    {
                      borderColor: phoneGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(0,212,255,0.2)', '#66F0FF'],
                      }),
                    },
                  ]}
                >
                  <Text style={styles.phonePrefix}>🇮🇳 +91</Text>
                  <View style={styles.phoneDivider} />
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={(txt) => setPhone(txt.replace(/\D/g, '').slice(0, 10))}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                    keyboardType="phone-pad"
                    placeholder="Phone Number"
                    placeholderTextColor="rgba(205, 230, 255, 0.45)"
                    maxLength={10}
                  />
                  <Text style={styles.phoneIcon}>📱</Text>
                </Animated.View>
              </>
            ) : (
              <>
                <Text style={styles.otpTitle}>Enter OTP</Text>
                <Text style={styles.otpSubtitle}>Sent to {completePhone}</Text>
                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={`otp-${i}`}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      style={[styles.otpBox, digit ? styles.otpBoxActive : null]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => updateOtpDigit(value, i)}
                      onKeyPress={({ nativeEvent }) => onOtpKeyPress(nativeEvent.key, i)}
                      textAlign="center"
                      selectionColor="#7BF2FF"
                    />
                  ))}
                </View>
                <TouchableOpacity onPress={resendOtp}>
                  <Text style={styles.resendText}>{counter > 0 ? `Resend OTP in ${counter}s` : 'Resend OTP'}</Text>
                </TouchableOpacity>
              </>
            )}

            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                onPress={isOtpStep ? verifyOtp : triggerOtp}
                style={[
                  styles.ctaWrap,
                  {
                    shadowOpacity: ctaHover.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] }),
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.ctaRipple,
                    {
                      opacity: ctaRipple.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
                      transform: [{ scale: ctaRipple.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.45] }) }],
                    },
                  ]}
                />
                <LinearGradient colors={['#1E90FF', '#00D4FF', '#00F5A0']} style={styles.cta}>
                  <Animated.View
                    style={[
                      styles.ctaFlow,
                      {
                        transform: [{ translateX: ctaFlow.interpolate({ inputRange: [0, 1], outputRange: [-160, 220] }) }],
                      },
                    ]}
                  />
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>{isOtpStep ? 'Verify OTP' : 'Send OTP'}</Text>}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </BlurView>

          <Text style={styles.footer}>
            By continuing you agree to our <Text style={styles.footerLink}>Terms</Text> &{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040D21' },
  keyboard: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 26 },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(0,212,255,0.14)' },
  orbTopRight: { width: 200, height: 200, right: -60, top: 40 },
  orbTopLeft: { width: 160, height: 160, left: -50, top: 190 },
  orbBottom: { width: 220, height: 220, right: -80, bottom: 80 },
  stream: {
    position: 'absolute',
    width: 2,
    height: 20,
    borderRadius: 2,
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  logoSection: { minHeight: 320, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  dropLayer: { width: 180, height: 170, alignItems: 'center', justifyContent: 'center' },
  dropGlowA: {
    position: 'absolute',
    width: 74,
    height: 92,
    borderRadius: 36,
    backgroundColor: 'rgba(0,180,255,0.7)',
    shadowColor: 'rgba(0,180,255,0.7)',
    shadowOpacity: 0.9,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
  dropGlowB: {
    position: 'absolute',
    width: 82,
    height: 98,
    borderRadius: 38,
    backgroundColor: 'rgba(0,80,200,0.4)',
    shadowColor: 'rgba(0,80,200,0.4)',
    shadowOpacity: 0.8,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 0 },
  },
  dripWrap: {
    position: 'absolute',
    top: 98,
  },
  splashRing: {
    position: 'absolute',
    top: 138,
    width: 26,
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(170, 230, 255, 0.7)',
    backgroundColor: 'transparent',
  },
  wordRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 2 },
  sprinkleWord: {
    marginTop: 12,
    fontSize: 24,
    fontFamily: 'Bell MT',
    fontStyle: 'italic',
    letterSpacing: 8,
    color: '#00d4ff',
    textShadowColor: 'rgba(0,212,255,0.4)',
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  waterWrap: { overflow: 'hidden', borderRadius: 6, marginTop: -2 },
  waterText: {
    fontSize: 38,
    fontFamily: 'Bell MT',
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: 6,
    color: '#fff',
    paddingHorizontal: 2,
  },
  waterShine: { position: 'absolute', width: 70, height: 82, left: -40, top: -12 },
  tagline: {
    marginTop: 8,
    color: 'rgba(0,212,255,0.45)',
    letterSpacing: 5,
    fontSize: 9,
    fontFamily: 'Bell MT',
    fontStyle: 'italic',
  },
  tabWrap: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabInner: { flexDirection: 'row', position: 'relative', height: 56, alignItems: 'center' },
  tabSlider: { position: 'absolute', width: 150, height: 48, marginLeft: 4, borderRadius: 999 },
  tabSliderGlow: {
    position: 'absolute',
    width: 150,
    height: 48,
    marginLeft: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 212, 255, 0.36)',
    shadowColor: '#00D4FF',
    shadowOpacity: 0.75,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF' },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
    padding: 16,
  },
  fieldShell: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.13)',
    minHeight: 68,
    marginBottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  floatingLabel: { position: 'absolute', left: 16, fontWeight: '700', letterSpacing: 0.3 },
  inputIcon: { position: 'absolute', right: 14, top: 22, fontSize: 16, opacity: 0.86 },
  floatingInput: { color: '#fff', fontSize: 16, fontWeight: '600', paddingTop: 16 },
  dropdownLabel: { position: 'absolute', top: 20, left: 16, color: 'rgba(185,224,255,0.7)', fontSize: 15, fontWeight: '700' },
  dropdownLabelRaised: { top: 8, fontSize: 12, color: '#84F1FF' },
  dropdownBtn: { minHeight: 56, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownText: { color: '#fff', fontSize: 15.5, fontWeight: '600' },
  dropdownPlaceholder: { color: 'rgba(211,234,255,0.62)' },
  dropdownChevron: { color: '#83EAFF', fontSize: 17 },
  zoneMenu: { marginTop: 8, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(142,206,255,0.28)', backgroundColor: 'rgba(4,16,30,0.92)', overflow: 'hidden' },
  zoneItem: { paddingVertical: 11, paddingHorizontal: 12 },
  zoneItemText: { color: '#D5F4FF', fontWeight: '600', fontSize: 14 },
  phoneField: {
    marginTop: 4,
    borderRadius: 18,
    borderWidth: 1.2,
    backgroundColor: 'rgba(0,0,0,0.16)',
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  phonePrefix: { color: '#84F1FF', fontSize: 15, fontWeight: '700', minWidth: 74 },
  phoneDivider: { width: 1, height: 24, backgroundColor: 'rgba(149,213,255,0.35)', marginHorizontal: 10 },
  phoneInput: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '600' },
  phoneIcon: { fontSize: 17, opacity: 0.85 },
  otpTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  otpSubtitle: { color: 'rgba(202,233,255,0.8)', textAlign: 'center', marginTop: 8, marginBottom: 14, fontSize: 14, fontWeight: '600' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  otpBox: { width: 50, height: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(152,212,255,0.34)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 22, fontWeight: '800' },
  otpBoxActive: { borderColor: '#7CEFFF', shadowColor: '#65E6FF', shadowOpacity: 0.85, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  resendText: { textAlign: 'center', color: '#8BEAFF', fontWeight: '700', marginBottom: 6, textDecorationLine: 'underline' },
  ctaWrap: { marginTop: 16, borderRadius: 999, shadowColor: '#00D4FF', shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
  ctaRipple: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(138, 244, 255, 0.8)',
  },
  cta: {
    minHeight: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  ctaFlow: { position: 'absolute', width: 120, height: 120, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.24)' },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  footer: { marginTop: 18, textAlign: 'center', color: 'rgba(208,233,255,0.72)', fontSize: 12.5, lineHeight: 18, paddingHorizontal: 14 },
  footerLink: { color: '#7FEEFF', textDecorationLine: 'underline', fontWeight: '700' },
});
