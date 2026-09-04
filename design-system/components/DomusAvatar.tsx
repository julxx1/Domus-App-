import { Image, Text, View } from 'react-native'
import { useDomusTheme } from '../hooks/useDomusTheme'

export interface DomusAvatarProps {
  name: string
  imageUri?: string | null
  color?: string
  size?: number
  /** Small colored ring/status dot in the corner (e.g. "at home"). */
  online?: boolean
}

export function DomusAvatar({ name, imageUri, color, size = 40, online }: DomusAvatarProps) {
  const theme = useDomusTheme()
  const initial = name.trim() ? name.trim()[0]!.toUpperCase() : '?'

  return (
    <View style={{ width: size, height: size }}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color ?? theme.colors.accent.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={[
              theme.typography.headline,
              { color: theme.colors.accent.onAccent, fontSize: Math.round(size * 0.4) },
            ]}
          >
            {initial}
          </Text>
        </View>
      )}
      {online ? (
        <View
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: Math.max(10, size * 0.28),
            height: Math.max(10, size * 0.28),
            borderRadius: Math.max(5, size * 0.14),
            backgroundColor: theme.colors.status.success,
            borderWidth: 2,
            borderColor: theme.colors.background.primary,
          }}
        />
      ) : null}
    </View>
  )
}
