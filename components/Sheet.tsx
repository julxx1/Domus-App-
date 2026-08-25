import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, motion, radii } from '@/theme/tokens'

const EASE = Easing.bezier(motion.easeOut.x1, motion.easeOut.y1, motion.easeOut.x2, motion.easeOut.y2)

interface SheetProps {
  visible: boolean
  onClose: () => void
  children: ReactNode
  /** Fraction of screen height the panel may occupy. */
  maxHeightRatio?: number
}

/**
 * Bottom sheet.
 *
 * Built on RN's `Modal` rather than an absolutely-positioned view so it sits
 * above the floating tab bar and captures the hardware back button on Android.
 * Reanimated's layout animations handle enter/exit, so the panel always
 * animates OUT before unmounting instead of vanishing.
 */
export default function Sheet({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.9,
}: SheetProps) {
  const insets = useSafeAreaInsets()

  // `Modal` unmounts its children instantly when `visible` flips, which would
  // skip the exit animation. Keeping it mounted for the exit duration lets the
  // slide-out actually play.
  const [mounted, setMounted] = useState(visible)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      return
    }
    const t = setTimeout(() => setMounted(false), motion.duration.sheetOut)
    return () => clearTimeout(t)
  }, [visible])

  const handleClose = useCallback(() => onClose(), [onClose])

  if (!mounted) return null

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {visible ? (
        <Animated.View
          entering={FadeIn.duration(motion.duration.sheet).easing(EASE)}
          exiting={FadeOut.duration(motion.duration.sheetOut).easing(EASE)}
          style={styles.backdrop}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} accessibilityLabel="Cerrar" />
        </Animated.View>
      ) : (
        <View style={styles.backdrop} />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        pointerEvents="box-none"
      >
        {visible ? (
          <Animated.View
            entering={SlideInDown.duration(motion.duration.sheet).easing(EASE)}
            exiting={SlideOutDown.duration(motion.duration.sheetOut).easing(EASE)}
            style={[
              styles.panel,
              { maxHeight: `${maxHeightRatio * 100}%`, paddingBottom: insets.bottom + 24 },
            ]}
          >
            <View style={styles.grabberRow}>
              <View style={styles.grabber} />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {children}
            </ScrollView>
          </Animated.View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    width: '100%',
  },
  grabberRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 8,
  },
})
