import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Alert, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { AuthField } from '@/components/auth/AuthChrome'
import { PrimaryButton } from '@/components/Form'
import { Eyebrow, PressableScale, SectionTitle, Title } from '@/components/Shared'
import { useAuth } from '@/lib/auth/AuthProvider'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import { canInvite } from '@/lib/domain/types'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

const AVATAR_COLORS = [
  '#C97B4A', '#7A8B6F', '#B85842', '#D4A256',
  '#D4877A', '#5B7BA5', '#7B5B9A', '#4A8B6F',
]

/**
 * Cuenta — opened from the avatar on Inicio, never a sixth tab. Real Supabase
 * identity now (profiles/households), replacing the old free-text local form.
 */
export default function CuentaScreen() {
  const router = useRouter()
  const { profile, household, refreshProfile, signOut, deleteAccount } = useAuth()
  const members = useAsyncData(() => repositories.profile.listMembers(), [profile?.household_id])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [color, setColor] = useState(AVATAR_COLORS[0]!)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const lastNameRef = useRef<TextInput>(null)

  useEffect(() => {
    if (!profile) return
    setFirstName(profile.first_name ?? '')
    setLastName(profile.last_name ?? '')
    setColor(profile.color)
  }, [profile])

  async function save() {
    if (!profile) return
    setSaving(true)
    await repositories.profile.update({ name: `${firstName.trim()} ${lastName.trim()}`.trim(), color })
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function confirmSignOut() {
    Alert.alert('Cerrar sesión', '¿Quieres cerrar sesión en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void signOut() },
    ])
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es permanente. Se borrará tu cuenta y tu perfil de Domus, y no podrás recuperarlos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', style: 'destructive', onPress: confirmDeleteAccountFinal },
      ]
    )
  }

  function confirmDeleteAccountFinal() {
    Alert.alert(
      '¿Eliminar tu cuenta definitivamente?',
      'No hay forma de deshacer esto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar cuenta', style: 'destructive', onPress: () => void performDeleteAccount() },
      ]
    )
  }

  async function performDeleteAccount() {
    setDeleting(true)
    const result = await deleteAccount()
    setDeleting(false)
    if (result.error) {
      Alert.alert('No se pudo eliminar la cuenta', result.error)
    }
    // On success the session is gone — AuthGate redirects to Welcome on its own.
  }

  const initial = firstName.trim() ? firstName.trim()[0]!.toUpperCase() : '·'
  const showInvite = canInvite(profile?.role)
  const memberCount = 1 + (members.data?.length ?? 0)

  return (
    <Screen hideTabs>
      <Stagger index={0} style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          scaleTo={0.93}
          accessibilityLabel="Volver"
          style={styles.back}
        >
          <Icon name="chev-l" size={20} color={colors.ink} strokeWidth={2.2} />
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Eyebrow>Tu cuenta</Eyebrow>
          <Title>Cuenta</Title>
        </View>
      </Stagger>

      {/* PERFIL */}
      <Stagger index={1} style={styles.avatarBlock}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.swatches}>
          {AVATAR_COLORS.map(c => (
            <PressableScale
              key={c}
              onPress={() => setColor(c)}
              scaleTo={0.9}
              accessibilityLabel={`Color ${c}`}
              style={[
                styles.swatch,
                { backgroundColor: c, borderColor: color === c ? colors.ink : 'transparent' },
              ]}
            />
          ))}
        </View>
      </Stagger>

      <Stagger index={2} style={styles.form}>
        <SectionTitle eyebrow="Perfil">Tus datos</SectionTitle>
        <AuthField
          label="Nombre"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Renata"
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthField
          ref={lastNameRef}
          label="Apellido"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Duarte"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <AuthField label="Correo" value={profile?.email ?? ''} editable={false} style={{ opacity: 0.6 }} />
        <PrimaryButton
          label={saved ? 'Guardado ✓' : 'Guardar cambios'}
          onPress={() => void save()}
          disabled={saving}
        />
      </Stagger>

      {/* HOGAR */}
      <Stagger index={3} style={styles.block}>
        <SectionTitle eyebrow="Hogar">{household?.name ?? 'Tu hogar'}</SectionTitle>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Icon name="home" size={17} color={colors.terra} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Mi rol</Text>
            <Text style={styles.rowMeta}>{profile?.role ?? '—'}</Text>
          </View>
        </View>

        <PressableScale
          onPress={() => router.push('/mi-familia')}
          accessibilityLabel="Ver miembros de mi familia"
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <Icon name="chat" size={17} color={colors.terra} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Miembros</Text>
            <Text style={styles.rowMeta}>{memberCount} en {household?.name ?? 'tu hogar'}</Text>
          </View>
          <Icon name="chev-r" size={17} color={colors.mute} />
        </PressableScale>

        {showInvite ? (
          <PressableScale
            onPress={() => router.push('/invitar')}
            accessibilityLabel="Invitar miembro"
            style={styles.row}
          >
            <View style={styles.rowIcon}>
              <Icon name="plus" size={17} color={colors.terra} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Invitar miembro</Text>
              <Text style={styles.rowMeta}>Genera un código de invitación</Text>
            </View>
            <Icon name="chev-r" size={17} color={colors.mute} />
          </PressableScale>
        ) : null}
      </Stagger>

      {/* PREFERENCIAS */}
      <Stagger index={4} style={styles.block}>
        <SectionTitle eyebrow="Ajustes">Preferencias</SectionTitle>
        <PressableScale
          onPress={() => router.push('/configuracion')}
          accessibilityLabel="Abrir configuración"
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <Icon name="settings" size={17} color={colors.terra} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Configuración</Text>
            <Text style={styles.rowMeta}>Notificaciones, apariencia y datos guardados</Text>
          </View>
          <Icon name="chev-r" size={17} color={colors.mute} />
        </PressableScale>
      </Stagger>

      {/* SEGURIDAD */}
      <Stagger index={4} style={styles.block}>
        <SectionTitle eyebrow="Seguridad">Contraseña</SectionTitle>
        <PressableScale
          onPress={() => router.push('/cambiar-password')}
          accessibilityLabel="Cambiar contraseña"
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <Icon name="lock" size={17} color={colors.terra} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Cambiar contraseña</Text>
          </View>
          <Icon name="chev-r" size={17} color={colors.mute} />
        </PressableScale>
      </Stagger>

      {/* SESIÓN */}
      <Stagger index={4} style={styles.block}>
        <PressableScale onPress={confirmSignOut} accessibilityLabel="Cerrar sesión" style={styles.signOutRow}>
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </PressableScale>
      </Stagger>

      {/* ZONA DE PELIGRO */}
      <Stagger index={4} style={[styles.block, { marginBottom: 12 }]}>
        <SectionTitle eyebrow="Zona de peligro">Eliminar cuenta</SectionTitle>
        <PressableScale
          onPress={deleting ? undefined : confirmDeleteAccount}
          disabled={deleting}
          accessibilityLabel="Eliminar cuenta"
          style={styles.deleteRow}
        >
          <Text style={styles.deleteText}>
            {deleting ? 'Eliminando…' : 'Eliminar mi cuenta de Domus'}
          </Text>
          <Text style={styles.deleteHint}>
            Borra tu cuenta y tu perfil de forma permanente. No se puede deshacer.
          </Text>
        </PressableScale>
      </Stagger>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    paddingBottom: 22,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radii.md - 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBlock: { alignItems: 'center', marginBottom: 20, paddingHorizontal: spacing.screenX },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.serif, fontSize: 38, color: '#fff' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 14 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 3 },
  form: { paddingHorizontal: spacing.screenX },
  block: { marginTop: 28, paddingHorizontal: spacing.screenX, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  signOutRow: {
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(184,88,66,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.danger },
  deleteRow: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(184,88,66,0.3)',
    backgroundColor: 'rgba(184,88,66,0.06)',
    padding: 14,
    gap: 4,
  },
  deleteText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.danger },
  deleteHint: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.mute, lineHeight: 16 },
})
