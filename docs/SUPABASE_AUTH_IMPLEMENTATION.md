# Supabase Auth — Fase 1 (domus-mobile)

Auditoría + implementación de Auth/Familia/Cuenta. Alcance: exactamente lo pedido
en la fase 1 (Auth, Cuenta, Crear/Unirse a familia). Cámaras, Chat realtime,
sincronización de Agenda/Mercado y notificaciones push quedan fuera a propósito.

## 1. Auditoría — qué ya existía

- **Proyecto Supabase real y ya en uso**: `domus-app/.env` tenía URL + anon key
  de un proyecto activo (`vqvulzuehioxjhzcanor.supabase.co`). Se reutilizó
  el mismo proyecto — no se creó uno nuevo.
- **Schema ya vivo** en `supabase/migrations/20260803000000_initial_schema.sql`
  + `20260803000001_rls_policies.sql`: `profiles`, `households`,
  `calendar_events`, `chores`, `pantry_items`, `messages`, etc, con RLS ya
  activado en todas las tablas y un trigger `handle_new_user` que crea el
  profile automáticamente al registrarse.
- **domus-app (web) ya tenía** un `AuthContext` funcional (`src/lib/auth.tsx`)
  con signIn/signUp/signOut/resetPassword/createHousehold/joinHousehold, y
  una pantalla de onboarding (crear/unirse a hogar). Se reutilizó el mismo
  modelo de datos y el mismo vocabulario de roles — no se inventó una
  arquitectura paralela.
- **Dos gaps reales encontrados en el flujo web** (documentados para que no
  se repitan en mobile):
  1. `createHousehold`/`joinHousehold` en la web hacen dos llamadas sueltas
     (insert household + update profile) sin transacción — si la segunda
     falla, queda un household huérfano sin dueño.
  2. `joinHousehold` hace un `SELECT households WHERE invite_code = X`
     directo desde el cliente. La política RLS de `households` solo permite
     ver el household propio (`id = get_my_household_id()`) — un usuario
     sin household todavía no debería poder ver ESE SELECT bajo esa policy.
     Funciona en la práctica probablemente por cómo Postgres evalúa el filtro,
     pero es frágil y no es el patrón correcto.

## 2. Decisión de arquitectura: "family" del spec == "household" existente

El spec pedía `families` + `family_members` (tabla puente) + `family_invitations`.
Ya existe `households` + `profiles.household_id` (FK directa, no tabla puente).

**Se reutilizó `households`/`profiles.household_id` tal cual.** Con una FK
directa, un perfil solo puede apuntar a UN household a la vez — eso ES
exactamente la regla v1 del spec ("un usuario pertenece a una familia activa"),
sin necesitar una tabla puente adicional que solo invitaría a que ambas
fuentes de verdad se desincronicen.

Terminología: en todo el código mobile, "family"/"familia" del spec se mapea
1:1 a "household" en la base de datos y en el código.

## 3. Qué se añadió — `supabase/migrations/20260812000000_household_invitations_and_rpc.sql`

Migración nueva y aditiva (no se tocó el schema original salvo `ALTER TABLE`
y `CREATE OR REPLACE FUNCTION`, ambos no-destructivos):

- `profiles.first_name` / `profiles.last_name` (nuevas, nullable). `name`
  (NOT NULL) se conserva sin cambios — la web sigue leyendo solo esa columna.
- `CHECK` en `profiles.role` con los 8 valores realmente usados en la web
  (`Mamá, Papá, Hijo, Hija, Abuelo, Abuela, Miembro, Admin`).
- **Trigger `enforce_profile_immutable_fields`**: cierra un hueco de
  seguridad que ya existía en el schema original — la policy
  `"update own profile"` permitía a cualquier usuario hacer
  `UPDATE profiles SET role='Admin' WHERE id=auth.uid()` directamente desde
  el cliente. Ahora `role`/`household_id` solo cambian si la transacción fue
  iniciada por uno de los RPC de abajo (marcado con
  `set_config('domus.trusted_write', 'true', true)`); cualquier otro intento
  se revierte en silencio.
- **`household_invitations`**: código de invitación real — aleatorio (8
  caracteres), con expiración (`expires_at`), de un solo uso (`used_at`).
  RLS: sin policy de INSERT/UPDATE — solo se crea/consume vía los RPC.
- **RPC `create_household(p_name)`**: crea el household + asigna
  `role='Admin'` al creador, todo en una función `plpgsql` (una función es
  una sola transacción — si algo falla, no queda nada a medias).
- **RPC `create_household_invitation(p_role, p_expires_in_hours)`**: solo
  admins/parents de su propio household pueden generar un código.
- **RPC `join_household_with_code(p_code)`**: valida código → expiración →
  no usado → el usuario no tiene household ya, todo en una transacción. Si
  no encuentra el código en `household_invitations`, cae de vuelta al
  `households.invite_code` original (permanente) — así los households
  creados por la web ANTES de esta migración siguen siendo unibles desde
  mobile sin tener que regenerar nada.

**Cómo aplicar esta migración**: no hay sesión de Supabase CLI enlazada en
este entorno (requeriría login interactivo o la contraseña de la base de
datos, que nunca se pide). Debe pegarse manualmente — ver instrucciones al
usuario al final de esta sesión.

## 4. Cliente / paquetes

- `@supabase/supabase-js@^2.112.0` — misma versión que domus-app.
- `react-native-url-polyfill` — supabase-js necesita `URL`/`URLSearchParams`,
  que no existen en el runtime de RN sin polyfill.
- `expo-clipboard` — para "Copiar código" en Invitar miembro.
- `lib/supabase/client.ts`: instancia única, `AsyncStorage` como storage,
  `persistSession: true`, `autoRefreshToken: true`, más un listener de
  `AppState` que llama `startAutoRefresh`/`stopAutoRefresh` — sin esto el
  token no se refresca solo en segundo plano en RN (a diferencia del web,
  que lo hace automáticamente vía el DOM).
- `detectSessionInUrl: false` — no hay `window`/URL de navegador en RN; el
  flujo de recuperación de contraseña se maneja a mano en
  `app/(auth)/reset-password.tsx` vía `expo-linking`.

## 5. Roles en las invitaciones — simplificación deliberada

El spec pedía roles de invitación "Padre/Madre, Hijo/a, Miembro, Observador".
La base de datos ya usa un vocabulario específico por género
(Mamá/Papá/Hijo/Hija/Abuelo/Abuela/Miembro/Admin) en la web, sin equivalente
para "Observador". Se usó el vocabulario existente tal cual en el selector de
rol de "Invitar miembro" — no se inventó un rol nuevo sin RLS/UI que lo
soporte en la web. `Admin` no es un rol invitable (solo se asigna al crear un
household).

## 6. Namespacing de datos locales

`lib/storage/kv.ts` ahora soporta `setUserNamespace(userId)`. Agenda/Deberes/
Mercado/Chat siguen 100% locales esta fase (sin cambios), pero sus claves
pasan a vivir bajo `domus:<userId>:...` en vez de `domus:...` una vez hay
sesión real — así dos cuentas reales en el mismo teléfono no comparten datos
locales por accidente. Los datos de prueba ya guardados antes de esta fase
(bajo el prefijo sin namespace) NO se borraron ni se migraron — quedan
huérfanos pero intactos, tal como pedía el spec.

## 7. Lo que falta configurar en el Dashboard de Supabase

Ver el mensaje final de esta sesión — ahí están los pasos exactos (qué abrir,
dónde hacer clic, qué pegar). Resumen:

1. **Pegar la migración SQL** (`supabase/migrations/20260812000000_household_invitations_and_rpc.sql`)
   en el SQL Editor del proyecto.
2. **Confirmación de email**: el código ya maneja ambos casos automáticamente
   (revisa si Supabase devuelve sesión o no al hacer signUp) — no requiere
   ningún cambio de configuración para funcionar, pero vale la pena que el
   usuario confirme qué comportamiento espera en Authentication → Providers →
   Email → "Confirm email".
3. **Redirect URL para recuperar contraseña**: Authentication → URL
   Configuration → Redirect URLs. Ver limitación de Expo Go abajo.

## 8. Limitación conocida: recuperar contraseña en Expo Go

`Linking.createURL('reset-password')` genera una URL `exp://<ip>:<puerto>/--/reset-password`
válida SOLO mientras el mismo servidor de desarrollo (`npx expo start`) que
la generó sigue corriendo en esa IP/puerto. Si el correo se abre después de
reiniciar el servidor (otra red, otro día), el enlace no abrirá Domus.

Esto es una limitación de Expo Go, no del código — una build de desarrollo o
producción real tiene un esquema de URL estable (`domus://reset-password`,
ya declarado en `app.json`) que no depende del servidor de Metro. El resto
del flujo (parseo de tokens, `setSession`, `updateUser`) ya está listo y
funcionará sin cambios en cuanto exista una build real.

## 9. Qué NO se hizo (fuera de alcance, según el spec)

Cámaras/ONVIF, Chat realtime, sincronización de Agenda/Mercado/Deberes con
Supabase, notificaciones push, Apple/Google Sign In, pagos. `domus-app` no se
tocó. `domus-native` no se tocó.
