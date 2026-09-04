const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

/**
 * expo-router's web require.context (`_ctx.web.js` in the installed package)
 * globs every `*.tsx` under app/ for ANY platform — it does not exclude a
 * file just because a `.web.tsx` sibling exists to take routing priority.
 * Metro still has to bundle `app/mapa.tsx`, which statically imports
 * `react-native-maps` — a library with no web build at all (it imports RN
 * internals like `codegenNativeCommands` that don't exist on web), so the
 * whole web bundle fails at build time even though `mapa.web.tsx` is the
 * component that actually renders on web.
 *
 * Fix: stub `react-native-maps` to an empty module specifically for the web
 * platform. `mapa.tsx`'s component is never rendered on web (expo-router's
 * route table already picks `mapa.web.tsx` there), so it only needs to not
 * crash the bundler — it doesn't need real exports.
 */
const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return { type: 'empty' }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
