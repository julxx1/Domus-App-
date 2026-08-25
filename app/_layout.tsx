import { useCallback, useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import {
  Newsreader_500Medium,
  Newsreader_500Medium_Italic,
  Newsreader_600SemiBold,
} from '@expo-google-fonts/newsreader'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'

import RootCrash from '@/components/RootCrash'
import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider'
import { colors, motion } from '@/theme/tokens'

// Hold the native splash until the fonts are ready, so the first frame is real
// Domus type rather than a flash of system fallback.
void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Newsreader_500Medium,
    Newsreader_500Medium_Italic,
    Newsreader_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  // A font failure must not brick the app — fall back to system type instead.
  const ready = fontsLoaded || Boolean(fontError)

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  const onLayout = useCallback(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  if (!ready) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        {/* Domus is a warm light-only palette; the status bar never inverts. */}
        <StatusBar style="dark" />
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

/**
 * Redirects between (auth) / (onboarding) / (tabs) based on `AuthProvider`'s
 * status, and holds a plain loading view — never the Stack itself — until the
 * very first session resolution finishes. That first-resolution gate is what
 * prevents a login → Inicio → login flash: nothing under (tabs) can mount
 * before we actually know whether there's a valid session.
 */
function AuthGate() {
  const { status } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (status === 'initializing') return

    // `/(auth)/reset-password` establishes a real session via `setSession()`
    // once it parses the recovery link's tokens (see that screen) — to
    // AuthProvider this looks exactly like a normal sign-in, so `status`
    // flips to 'ready' while the user is still supposed to be typing a new
    // password. Without this exemption, the block below would immediately
    // `router.replace('/(tabs)')` and yank them into the app before they
    // ever see "Nueva contraseña" — which is the bug that made the reset
    // link "not arrive" at the right screen. That screen owns its own
    // navigation on both outcomes (success or invalid), so the redirect
    // logic here should stay out of its way entirely.
    if (segments[1] === 'reset-password') return

    const group = segments[0]
    const inAuth = group === '(auth)'
    const inOnboarding = group === '(onboarding)'

    if ((status === 'unauthenticated' || status === 'error') && !inAuth) {
      router.replace('/(auth)/welcome')
    } else if (status === 'no-household' && !inOnboarding) {
      router.replace('/(onboarding)/family-choice')
    } else if (status === 'ready' && (inAuth || inOnboarding)) {
      router.replace('/(tabs)')
    }
  }, [status, segments, router])

  if (status === 'initializing') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.terra} />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.cream },
        // Secondary screens (Perfil, Mapa, detalles) push from the right.
        // The tab shell and the auth/onboarding groups opt out below and run
        // their own transitions (tabs: none; auth/onboarding: fade).
        animation: 'slide_from_right',
        animationDuration: motion.duration.nav,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
    </Stack>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
})

/** Expo Router renders this instead of a blank screen when a route throws. */
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return <RootCrash error={error} onRetry={() => void retry()} />
}
