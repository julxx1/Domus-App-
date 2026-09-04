import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDomusTheme } from '../hooks/useDomusTheme'

export interface DomusSheetSurfaceProps {
  children: ReactNode
  /** Shows the horizontal drag handle — off when the sheet is opened programmatically only. */
  grabber?: boolean
}

/**
 * Material/style wrapper only — no modal/transition logic here. The existing
 * `components/Sheet.tsx` (RN Modal + Reanimated enter/exit) owns actual
 * presentation; this is the visual surface a future migration of that
 * component would render inside. Deliberately opaque/elevated, not glass —
 * a sheet full of readable content needs a calm background, not translucency.
 */
export function DomusSheetSurface({ children, grabber = true }: DomusSheetSurfaceProps) {
  const theme = useDomusTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.primary,
        borderTopLeftRadius: theme.radius.xlarge,
        borderTopRightRadius: theme.radius.xlarge,
        paddingHorizontal: theme.semanticSpacing.screenHorizontal,
        paddingTop: theme.spacing[3],
        paddingBottom: insets.bottom + theme.spacing[5],
        shadowColor: theme.colors.glass.shadow,
        ...theme.elevation.high,
      }}
    >
      {grabber ? (
        <View
          style={{
            alignSelf: 'center',
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.separator.primary,
            marginBottom: theme.spacing[4],
          }}
        />
      ) : null}
      {children}
    </View>
  )
}
