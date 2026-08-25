import { Stack } from 'expo-router'
import { colors } from '@/theme/tokens'

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.cream },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="family-choice" options={{ animation: 'fade' }} />
    </Stack>
  )
}
