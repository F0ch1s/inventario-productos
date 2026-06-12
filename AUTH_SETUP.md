# Sistema de Autenticación

## Descripción

Se ha implementado un sistema de autenticación completo utilizando **Supabase Auth**. Todos los usuarios deben iniciar sesión para acceder a la aplicación.

## Características

✅ **Login y Registro** - Los usuarios pueden crear cuenta o iniciar sesión
✅ **Protección de Rutas** - Solo usuarios autenticados pueden acceder
✅ **Gestión de Sesiones** - Las sesiones se mantienen persistentes
✅ **Logout** - Botón para cerrar sesión en el sidebar
✅ **Información del Usuario** - Muestra el email del usuario autenticado

## Configuración

### 1. Variables de Entorno

Asegúrate de que tu archivo `.env.local` contiene:

```
PUBLIC_SUPABASE_URL=tu_supabase_url
PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 2. Configurar Supabase Auth

En tu dashboard de Supabase:

1. Ve a **Authentication > Providers**
2. Asegúrate de que **Email** esté habilitado
3. Opcionalmente, puedes configurar otros proveedores (Google, GitHub, etc.)

## Flujo de Autenticación

```
Usuario sin sesión
        ↓
   /login (LoginForm)
        ↓
  Inicia sesión o se registra
        ↓
  Supabase Auth verifica credenciales
        ↓
   Sesión creada
        ↓
   / (Aplicación principal protegida)
```

## Componentes Principales

### AuthStore (`src/stores/authStore.ts`)
- Gestiona el estado de autenticación usando nanostores
- Métodos: `initializeAuth()`, `signIn()`, `signUp()`, `signOut()`
- Computed stores: `$isAuthenticated`, `$currentUser`, `$authLoading`

### LoginForm (`src/components/LoginForm.tsx`)
- Componente interactivo con modo login/registro
- Muestra errores de autenticación
- Incluye botón "Demo" para llenar credenciales de ejemplo

### LogoutButton (`src/components/LogoutButton.tsx`)
- Botón para cerrar sesión
- Se muestra en el sidebar

### AppWrapper (`src/components/AppWrapper.tsx`)
- Envuelve la aplicación principal
- Protege las rutas: redirige al login si no está autenticado
- Muestra loading mientras verifica la sesión

### Sidebar Actualizado
- Muestra información del usuario (email y username)
- Incluye botón de logout

## Páginas

### /login
- Página de autenticación (accesible sin login)
- Permite iniciar sesión o registrarse

### / (Home)
- Aplicación principal protegida
- Solo accesible para usuarios autenticados

## Uso

### Pruebas Locales

Para probar la autenticación:

1. Ve a `http://localhost:3000/login`
2. Usa el botón "Llenar demo" para llenar credenciales de ejemplo
3. O crea una nueva cuenta
4. Serás redirigido a la aplicación principal

### Cambiar Permisos de Base de Datos (Opcional)

Si quieres que solo usuarios autenticados accedan a la base de datos, actualiza las políticas RLS en Supabase:

```sql
-- Permitir solo a usuarios autenticados
create policy "Usuario autenticado" on products
  for all using (auth.uid() is not null);
```

## Próximos Pasos (Opcionales)

1. **Roles de Usuario** - Implementar admin y user roles
2. **Recuperación de Contraseña** - Email para reset de contraseña
3. **Autenticación Social** - Login con Google, GitHub, etc.
4. **MFA** - Autenticación de dos factores
5. **Auditoria** - Log de actividades por usuario
