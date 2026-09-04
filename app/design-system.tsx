import { useState, type ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import {
  DomusThemeProvider,
  useDomusTheme,
  useDomusThemeContext,
  DomusButton,
  DomusIconButton,
  DomusFloatingButton,
  DomusCard,
  DomusInput,
  DomusSearchField,
  DomusSegmentedControl,
  DomusChip,
  DomusBadge,
  DomusAvatar,
  DomusGlass,
  DomusDivider,
  DomusProgress,
  DomusEmptyState,
  typography,
  type TypographyScale,
} from '@/design-system'
import type { GlassVariant } from '@/design-system/tokens/glass'

/**
 * INTERNAL, DEV-ONLY. Not part of the production tab bar or any nav flow —
 * reach it manually (`router.push('/design-system')` from a dev console, or
 * type the URL bar in Expo Go's dev menu). Safe to delete this single file
 * with zero impact on the rest of the app; nothing imports it.
 *
 * Wraps itself in `DomusThemeProvider` locally — Phase 1 does not mount the
 * provider anywhere in the real app tree (see docs/DESIGN_SYSTEM_2.md),
 * so this screen is self-contained.
 */
export default function DesignSystemShowcaseRoute() {
  return (
    <DomusThemeProvider>
      <Showcase />
    </DomusThemeProvider>
  )
}

function Showcase() {
  const theme = useDomusTheme()
  const { preference, setPreference, resolvedMode } = useDomusThemeContext()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [segment, setSegment] = useState<'todos' | 'hoy' | 'semana'>('todos')
  const [chipSelected, setChipSelected] = useState(false)
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')
  const [search, setSearch] = useState('')

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{
        paddingTop: insets.top + theme.spacing[5],
        paddingBottom: insets.bottom + theme.spacing[10],
        paddingHorizontal: theme.semanticSpacing.screenHorizontal,
        gap: theme.spacing[8],
      }}
    >
      <View>
        <Text style={[typography.caption, { color: theme.colors.accent.primary }]}>DOMUS</Text>
        <Text style={[typography.display, { color: theme.colors.text.primary }]}>Design System 2.0</Text>
        <DomusButton label="← Volver a Domus" variant="plain" onPress={() => router.back()} />
      </View>

      <Section title="Tema">
        <View style={{ flexDirection: 'row', gap: theme.spacing[3] }}>
          {(['system', 'light', 'dark'] as const).map(p => (
            <DomusChip
              key={p}
              label={p === 'system' ? `Sistema (${resolvedMode})` : p === 'light' ? 'Claro' : 'Oscuro'}
              variant={preference === p ? 'selected' : 'filter'}
              onPress={() => setPreference(p)}
            />
          ))}
        </View>
      </Section>

      <Section title="Tipografía">
        <View style={{ gap: theme.spacing[3] }}>
          {(Object.keys(typography) as TypographyScale[]).map(scale => (
            <Text key={scale} style={[typography[scale], { color: theme.colors.text.primary }]}>
              {scale} — Tu hogar empieza aquí
            </Text>
          ))}
        </View>
      </Section>

      <Section title="Botones">
        <View style={{ gap: theme.spacing[3] }}>
          <DomusButton label="Primary" variant="primary" onPress={() => {}} />
          <DomusButton label="Secondary" variant="secondary" onPress={() => {}} />
          <DomusButton label="Glass" variant="glass" onPress={() => {}} />
          <DomusButton label="Plain" variant="plain" onPress={() => {}} />
          <DomusButton label="Destructive" variant="destructive" onPress={() => {}} />
          <DomusButton label="Loading" variant="primary" loading onPress={() => {}} />
          <DomusButton label="Disabled" variant="primary" disabled onPress={() => {}} />
        </View>
      </Section>

      <Section title="Icon / Floating buttons">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[5] }}>
          <DomusIconButton icon="bell" accessibilityLabel="Notificaciones" onPress={() => {}} />
          <DomusIconButton icon="bell" accessibilityLabel="Notificaciones" variant="glass" onPress={() => {}} />
          <DomusFloatingButton icon="plus" accessibilityLabel="Agregar" onPress={() => {}} />
          <DomusFloatingButton icon="plus" accessibilityLabel="Agregar" tone="glass" onPress={() => {}} />
        </View>
      </Section>

      <Section title="Glass — variantes">
        <View style={{ gap: theme.spacing[3] }}>
          {(['regular', 'thin', 'prominent', 'control', 'floating'] as GlassVariant[]).map(variant => (
            <DomusGlass key={variant} variant={variant} style={{ padding: theme.spacing[5] }}>
              <Text style={[typography.subheadline, { color: theme.colors.text.primary }]}>{variant}</Text>
            </DomusGlass>
          ))}
        </View>
      </Section>

      <Section title="Cards">
        <View style={{ gap: theme.spacing[3] }}>
          <DomusCard variant="content">
            <Text style={[typography.body, { color: theme.colors.text.primary }]}>Content card</Text>
          </DomusCard>
          <DomusCard variant="elevated">
            <Text style={[typography.body, { color: theme.colors.text.primary }]}>Elevated card</Text>
          </DomusCard>
          <DomusCard variant="interactive" onPress={() => {}} accessibilityLabel="Tarjeta interactiva">
            <Text style={[typography.body, { color: theme.colors.text.primary }]}>Interactive card — toca</Text>
          </DomusCard>
        </View>
      </Section>

      <Section title="Inputs">
        <View>
          <DomusInput label="Nombre" placeholder="Renata" value={text} onChangeText={setText} />
          <DomusInput label="Contraseña" placeholder="Mínimo 6 caracteres" secure value={password} onChangeText={setPassword} />
          <DomusInput label="Con error" placeholder="tú@correo.com" error="Ese correo no es válido." value="" onChangeText={() => {}} />
          <DomusSearchField value={search} onChangeText={setSearch} placeholder="Buscar en Domus" />
        </View>
      </Section>

      <Section title="Segmented control">
        <DomusSegmentedControl
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'hoy', label: 'Hoy' },
            { value: 'semana', label: 'Semana' },
          ]}
          value={segment}
          onChange={setSegment}
        />
      </Section>

      <Section title="Chips">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          <DomusChip label="+ Comida familiar" variant="action" icon="plus" onPress={() => {}} />
          <DomusChip
            label={chipSelected ? 'Seleccionado' : 'Filtro'}
            variant={chipSelected ? 'selected' : 'filter'}
            onPress={() => setChipSelected(v => !v)}
          />
        </View>
      </Section>

      <Section title="Badges">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          <DomusBadge label="Accent" tone="accent" />
          <DomusBadge label="Success" tone="success" />
          <DomusBadge label="Warning" tone="warning" />
          <DomusBadge label="Error" tone="error" />
          <DomusBadge label="Neutral" tone="neutral" />
        </View>
      </Section>

      <Section title="Avatares">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
          <DomusAvatar name="Renata" size={32} />
          <DomusAvatar name="Duarte" size={44} color={theme.colors.status.info} online />
          <DomusAvatar name="Domus" size={56} />
        </View>
      </Section>

      <Section title="Progreso">
        <View style={{ gap: theme.spacing[4] }}>
          <DomusProgress value={0.35} />
          <DomusProgress value={1} />
        </View>
      </Section>

      <Section title="Empty state">
        <DomusEmptyState
          icon="cam"
          title="Aún no has conectado cámaras"
          description="Conecta una cámara compatible para verla aquí."
        />
      </Section>

      <Section title="Divider">
        <DomusDivider />
      </Section>
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useDomusTheme()
  return (
    <View style={{ gap: theme.spacing[4] }}>
      <Text style={[typography.title3, { color: theme.colors.text.primary }]}>{title}</Text>
      {children}
    </View>
  )
}
