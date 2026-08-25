import { Tabs } from 'expo-router'
import { Animated, Easing } from 'react-native'
import TabBar from '@/components/TabBar'
import { colors, motion } from '@/theme/tokens'

/**
 * Lateral tab transition.
 *
 * `progress` is -1 when a scene sits left of the active tab, 0 when it IS the
 * active tab, and 1 when it sits right of it. Mapping the spec onto that:
 *
 *   entering from the right : 16px → 0,  opacity 0 → 1
 *   leaving to the left     : 0 → -8px,  opacity 1 → 0.94
 *
 * Both scenes stay mounted through the transition, so there is never an empty
 * frame or a white flash between them.
 */
function sceneStyleInterpolator({ current }: { current: { progress: Animated.Value } }) {
  return {
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0.94, 1, 0],
      }),
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-8, 0, 16],
          }),
        },
      ],
    },
  }
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.cream },
        animation: 'shift',
        sceneStyleInterpolator,
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: motion.duration.nav,
            easing: Easing.bezier(
              motion.easeOut.x1,
              motion.easeOut.y1,
              motion.easeOut.x2,
              motion.easeOut.y2
            ),
          },
        },
      }}
    >
      {/* Order defines transition direction — must match TabBar's TABS. */}
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="seguridad" options={{ title: 'Seguridad' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="mercado" options={{ title: 'Mercado' }} />
    </Tabs>
  )
}
