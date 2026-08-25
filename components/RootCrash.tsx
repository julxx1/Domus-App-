import { StyleSheet, Text, View } from 'react-native'
import { PressableScale } from './Shared'
import { colors, fonts, radii } from '@/theme/tokens'

/**
 * Last-resort UI. The rule from the spec: never leave the user on an empty
 * beige screen — always explain, and always offer a way forward.
 */
export default function RootCrash({
  error,
  onRetry,
}: {
  error?: Error
  onRetry?: () => void
}) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Algo salió mal</Text>
      <Text style={styles.message}>
        {error?.message || 'Domus encontró un error inesperado.'}
      </Text>
      {onRetry ? (
        <PressableScale onPress={onRetry} style={styles.button} accessibilityLabel="Reintentar">
          <Text style={styles.buttonText}>Reintentar</Text>
        </PressableScale>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.mute,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    height: 50,
    paddingHorizontal: 28,
    borderRadius: radii.md,
    backgroundColor: colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: '#fff',
  },
})
