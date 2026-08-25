import { useCallback, useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import Sheet from '@/components/Sheet'
import { Field, PrimaryButton, SheetHeader } from '@/components/Form'
import { EmptyState, Eyebrow, Pill, PressableScale, SectionTitle, Title } from '@/components/Shared'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import type { Camera, CameraStatus } from '@/lib/domain/types'
import { colors, fonts, motion, radii, spacing } from '@/theme/tokens'

type SheetMode = null | 'choose' | 'scan' | 'manual'

/**
 * Seguridad (tab 1).
 *
 * "Buscar cámaras" (automatic ONVIF discovery) and "Configuración avanzada"
 * (manual host + credentials) are deliberately two DIFFERENT flows — discovery
 * is the primary path a normal user takes.
 *
 * Discovery and live playback need native modules that Expo Go does not ship,
 * so those paths say so honestly instead of faking a result. Everything else
 * — registering a camera, listing it, editing, deleting, status — works today.
 */
export default function SeguridadScreen() {
  const router = useRouter()
  const [sheet, setSheet] = useState<SheetMode>(null)

  const cameras = useAsyncData(() => repositories.cameras.list(), [])
  const list = cameras.data ?? []

  const online = list.filter(c => c.status === 'online' || c.status === 'streaming').length
  const streaming = list.filter(c => c.status === 'streaming').length

  const remove = useCallback(
    async (id: string) => {
      cameras.set(prev => (prev ?? []).filter(c => c.id !== id))
      await repositories.cameras.remove(id)
      await cameras.reload()
    },
    [cameras]
  )

  return (
    <Screen>
      <Stagger index={0} style={styles.header}>
        <Eyebrow>Hogar protegido</Eyebrow>
        <Title>Vigilancia</Title>
      </Stagger>

      <Stagger index={1} style={styles.pills}>
        <Pill active={online > 0}>{online} en línea</Pill>
        <Pill>{streaming} en vivo</Pill>
        <Pill>0 alertas</Pill>
      </Stagger>

      <Stagger index={2}>
        {list.length === 0 ? (
          <EmptyState
            title="Aún no has conectado cámaras"
            description="Busca cámaras compatibles en tu red Wi-Fi, o configúralas manualmente si ya conoces sus datos."
          >
            <View style={styles.actions}>
              <PressableScale
                onPress={() => setSheet('choose')}
                accessibilityLabel="Agregar cámara"
                style={[styles.btn, styles.btnPrimary]}
              >
                <Icon name="plus" size={16} color="#fff" strokeWidth={2.2} />
                <Text style={styles.btnPrimaryText}>Agregar cámara</Text>
              </PressableScale>
            </View>
          </EmptyState>
        ) : (
          <View style={styles.list}>
            {list.map(camera => (
              <Animated.View
                key={camera.id}
                layout={LinearTransition.duration(motion.duration.base)}
                entering={FadeIn.duration(motion.duration.base)}
                exiting={FadeOut.duration(motion.duration.fast)}
              >
                <CameraCard camera={camera} onDelete={() => void remove(camera.id)} />
              </Animated.View>
            ))}

            <PressableScale
              onPress={() => setSheet('choose')}
              accessibilityLabel="Agregar cámara"
              style={styles.addRow}
            >
              <Icon name="plus" size={16} color={colors.mute} strokeWidth={2.2} />
              <Text style={styles.addText}>Agregar cámara</Text>
            </PressableScale>
          </View>
        )}
      </Stagger>

      {/* Mapa vive dentro de Seguridad, no es una pestaña */}
      <Stagger index={3} style={styles.block}>
        <SectionTitle eyebrow="Ubicación">Mapa familiar</SectionTitle>
        <PressableScale
          onPress={() => router.push('/mapa')}
          accessibilityLabel="Abrir mapa familiar"
          style={styles.mapRow}
        >
          <View style={styles.rowIcon}>
            <Icon name="map-pin" size={17} color={colors.terra} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Ver mapa familiar</Text>
            <Text style={styles.rowMeta}>Ubicación en tiempo real de tu hogar</Text>
          </View>
          <Icon name="chev-r" size={17} color={colors.mute} />
        </PressableScale>
      </Stagger>

      <Stagger index={4} style={styles.block}>
        <SectionTitle eyebrow="Análisis de hábitos">Actividad del hogar</SectionTitle>
        <EmptyState
          title="Aún no hay suficientes datos"
          description="Las métricas se calculan solo con eventos reales de tus cámaras."
        />
      </Stagger>

      {/* ── Sheets ── */}

      <Sheet visible={sheet === 'choose'} onClose={() => setSheet(null)}>
        <SheetHeader eyebrow="Seguridad" title="Agregar cámara" onClose={() => setSheet(null)} />
        <PressableScale
          onPress={() => setSheet('scan')}
          accessibilityLabel="Buscar cámaras automáticamente"
          style={styles.option}
        >
          <View style={[styles.optionIcon, { backgroundColor: 'rgba(201,123,74,0.12)' }]}>
            <Icon name="wifi" size={20} color={colors.terra} strokeWidth={1.9} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>Buscar cámaras</Text>
            <Text style={styles.optionSub}>
              Domus busca automáticamente cámaras compatibles en tu Wi-Fi
            </Text>
          </View>
          <Icon name="chev-r" size={17} color={colors.mute} />
        </PressableScale>

        <PressableScale
          onPress={() => setSheet('manual')}
          accessibilityLabel="Configuración avanzada"
          style={styles.option}
        >
          <View style={[styles.optionIcon, { backgroundColor: 'rgba(122,139,111,0.14)' }]}>
            <Icon name="pencil" size={19} color={colors.sage} strokeWidth={1.9} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>Configuración avanzada</Text>
            <Text style={styles.optionSub}>Si ya conoces los datos de tu cámara</Text>
          </View>
          <Icon name="chev-r" size={17} color={colors.mute} />
        </PressableScale>
        <View style={{ height: 12 }} />
      </Sheet>

      <Sheet visible={sheet === 'scan'} onClose={() => setSheet(null)}>
        <SheetHeader eyebrow="Seguridad" title="Buscar cámaras" onClose={() => setSheet(null)} />
        <View style={styles.nativeNotice}>
          <Icon name="shield" size={20} color={colors.terraDeep} strokeWidth={1.9} />
          <Text style={styles.nativeTitle}>Esta función requiere la versión nativa de Domus</Text>
          <Text style={styles.nativeText}>
            La búsqueda automática necesita acceso a la red local del iPhone, que
            Expo Go no puede otorgar a Domus. Estará disponible en la versión
            instalada de la app.
          </Text>
          <Text style={styles.nativeText}>
            Mientras tanto puedes agregar tu cámara con Configuración avanzada.
          </Text>
        </View>
        <PrimaryButton label="Configuración avanzada" onPress={() => setSheet('manual')} />
        <View style={{ height: 12 }} />
      </Sheet>

      <Sheet visible={sheet === 'manual'} onClose={() => setSheet(null)}>
        <ManualCameraForm
          onClose={() => setSheet(null)}
          onSaved={() => void cameras.reload()}
        />
      </Sheet>
    </Screen>
  )
}

// ── Camera card ──────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<CameraStatus, string> = {
  registered: 'Sin conectar',
  connecting: 'Conectando…',
  online: 'En línea',
  streaming: 'En vivo',
  offline: 'Desconectada',
  auth_error: 'Credenciales incorrectas',
  unreachable: 'No se encuentra en la red',
}

const STATUS_COLOR: Record<CameraStatus, string> = {
  registered: colors.mute,
  connecting: colors.ochre,
  online: colors.sage,
  streaming: colors.sage,
  offline: colors.mute,
  auth_error: colors.clay,
  unreachable: colors.clay,
}

function CameraCard({ camera, onDelete }: { camera: Camera; onDelete: () => void }) {
  return (
    <View style={styles.cameraCard}>
      <View style={styles.cameraThumb}>
        <Icon name="cam" size={22} color={colors.mute} strokeWidth={1.6} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.rowTitle}>{camera.name}</Text>
        {camera.location ? <Text style={styles.rowMeta}>{camera.location}</Text> : null}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[camera.status] }]} />
          <Text style={[styles.statusText, { color: STATUS_COLOR[camera.status] }]}>
            {STATUS_LABEL[camera.status]}
          </Text>
        </View>
      </View>

      <PressableScale
        onPress={onDelete}
        scaleTo={0.93}
        accessibilityLabel={`Eliminar ${camera.name}`}
        style={styles.iconBtn}
      >
        <Icon name="trash" size={15} color={colors.clay} />
      </PressableScale>
    </View>
  )
}

// ── Manual setup ─────────────────────────────────────────────────────────────

function ManualCameraForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [host, setHost] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && !saving

  async function save() {
    if (!canSave) return
    setSaving(true)
    // Credentials are intentionally NOT collected or stored here: they belong
    // in the OS keychain, which lands with the native ONVIF client.
    await repositories.cameras.create({
      name: name.trim(),
      location: location.trim() || null,
      host: host.trim() || null,
    })
    onSaved()
    onClose()
  }

  return (
    <View>
      <SheetHeader eyebrow="Seguridad" title="Configuración avanzada" onClose={onClose} />

      <Field
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Entrada, Sala, Patio…"
        autoFocus
      />
      <Field
        label="Ubicación (opcional)"
        value={location}
        onChangeText={setLocation}
        placeholder="Planta baja, jardín…"
      />
      <Field
        label="Dirección de la cámara (opcional)"
        value={host}
        onChangeText={setHost}
        placeholder="192.168.1.50"
        autoCapitalize="none"
        autoCorrect={false}
        hint="Podrás completar la conexión y las credenciales en la versión nativa de Domus."
      />

      <PrimaryButton
        label={saving ? 'Guardando…' : 'Guardar cámara'}
        onPress={() => void save()}
        disabled={!canSave}
      />
      <View style={{ height: 12 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.screenX, paddingTop: 16, paddingBottom: 22 },
  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.screenX, marginBottom: 18 },
  block: { marginTop: 28 },
  list: { paddingHorizontal: spacing.screenX, gap: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10, width: '100%' },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: radii.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimary: { backgroundColor: colors.terra },
  btnPrimaryText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: '#fff' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
  },
  addText: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.mute },
  cameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
  },
  cameraThumb: {
    width: 56,
    height: 56,
    borderRadius: radii.sm + 2,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontFamily: fonts.sansSemiBold, fontSize: 11.5 },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink },
  rowMeta: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.mute, marginTop: 2 },
  iconBtn: { padding: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14.5, color: colors.ink },
  optionSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.mute, marginTop: 2, lineHeight: 17 },
  nativeNotice: {
    backgroundColor: 'rgba(201,123,74,0.08)',
    borderColor: 'rgba(201,123,74,0.22)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  nativeTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.terraDeep },
  nativeText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
})
