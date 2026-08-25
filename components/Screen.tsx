import type { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/theme/tokens'

/**
 * Height of the floating tab bar plus its bottom offset, so content clears it.
 * Recomputed after the tab bar moved closer to the true bottom edge — keep
 * in sync with TabBar's `bottom: max(insets.bottom - 20, 8)` and `bar.height`.
 */
const TAB_BAR_CLEARANCE = 80

interface ScreenProps {
  children: ReactNode
  /** Set on screens that hide the tab bar (detail views) to reclaim the space. */
  hideTabs?: boolean
  scroll?: boolean
  style?: StyleProp<ViewStyle>
  refreshControl?: React.ComponentProps<typeof ScrollView>['refreshControl']
}

export default function Screen({
  children,
  hideTabs = false,
  scroll = true,
  style,
  refreshControl,
}: ScreenProps) {
  const insets = useSafeAreaInsets()
  const paddingBottom = hideTabs ? insets.bottom + 20 : insets.bottom + TAB_BAR_CLEARANCE

  if (!scroll) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }, style]}>
        <View style={{ flex: 1, paddingBottom }}>{children}</View>
      </View>
    )
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }, style]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
})
