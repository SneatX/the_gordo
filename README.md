# 🍔 The Gordo — Sistema de Reservas

Aplicación web para gestionar reservas de mesas del restaurante **Comidas Rápidas The Gordo**. Permite a los clientes reservar mesas de forma autónoma y al administrador gestionar el restaurante desde un panel centralizado.

## Stack

| Tecnología | Uso |
|---|---|
| React + TypeScript | Frontend SPA |
| Vite | Bundler y dev server |
| Tailwind CSS | Estilos |
| Supabase | Base de datos + autenticación |
| React Router | Navegación |
| Vercel | Deploy |

## Arquitectura

El proyecto sigue un patrón **MVC adaptado** donde cada capa solo conoce la capa inmediatamente inferior:

```
Pages → Hooks → Controllers → Services → Supabase
```

```
src/
├── components/
│   ├── admin/          # Componentes del panel admin (AdminLayout, etc.)
│   ├── reservation/    # Sub-componentes del flujo de reserva
│   │   ├── StepIndicator.tsx
│   │   ├── SummaryBar.tsx
│   │   └── LocationAccordion.tsx
│   └── ui/             # Componentes genéricos (Modal, ProtectedRoute, etc.)
├── context/            # React Context (AuthContext)
├── controllers/        # Lógica de negocio y validaciones
├── hooks/              # Bridge entre controllers/context y vistas
├── lib/
│   └── supabase.ts     # Cliente Supabase tipado
├── pages/
│   ├── admin/          # Panel de administración (protegido)
│   ├── public/         # Páginas públicas (home, reservar)
│   └── LoginPage.tsx   # Acceso al panel admin
├── routes/
│   └── AppRouter.tsx   # Rutas de la aplicación
├── services/           # Única capa que habla con Supabase
├── types/
│   ├── database.types.ts   # Tipos auto-generados por Supabase CLI
│   ├── domain/             # Tipos del dominio (camelCase, enums, Date)
│   └── index.ts            # Barrel exports
└── utils/              # Helpers reutilizables
    ├── time.ts         # toAmPm, toMinutes, fromMinutes, RESERVATION_DURATION_MIN
    ├── validation.ts   # isValidEmail
    └── schedule.ts     # groupSchedules
```

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/the_gordo.git
cd the_gordo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Correr en desarrollo
npm run dev
```

## Variables de entorno

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key
```

## Base de datos

Tablas en Supabase (orden de creación por dependencias FK):

```
locations → restaurant_tables → schedules → reservations
```

Para regenerar los tipos TypeScript desde el schema:

```bash
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.types.ts
```

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Home del restaurante |
| `/reservar` | Público | Formulario de reserva anónimo |
| `/login` | Público | Acceso al panel de administración |
| `/admin/reservations` | Admin | Gestión de reservas |
| `/admin/tables` | Admin | Gestión de mesas |
| `/admin/schedules` | Admin | Gestión de horarios |
| `/admin/locations` | Admin | Gestión de locales |

Las rutas `/admin/*` están protegidas por `ProtectedRoute`: si no hay sesión activa, redirigen automáticamente a `/login`.

## Flujo de autenticación

Los **clientes no necesitan cuenta**. La reserva es un formulario anónimo donde se captura nombre, teléfono, fecha, hora y número de personas.

Solo el **administrador** se autentica, a través de Supabase Auth (email + contraseña). La sesión se persiste automáticamente y se restaura al recargar la app via `onAuthStateChange`.

```
Cliente → /reservar → formulario anónimo → reserva guardada en DB
Admin   → /login   → Supabase Auth      → /admin/*
```

## Módulos

**Cliente (público)**
- Home con información del restaurante y horarios de atención desde la DB
- Formulario de reserva en 3 pasos:
  1. Fecha y número de personas (horarios disponibles según agenda del restaurante)
  2. Selección de mesa agrupada por ubicación (acordeones, solo mesas con capacidad suficiente y sin conflicto de horario)
  3. Datos de contacto: nombre, teléfono (10 dígitos) y correo electrónico
- Resumen de la reserva y confirmación
- Página 404 con navegación de regreso

**Administrador (autenticado)**
- Gestión de mesas: crear, editar, bloquear/desbloquear
- Gestión de ubicaciones del salón
- Gestión de horarios por día de la semana
- Listado y cancelación de reservas

## Identidad visual

El diseño está inspirado en el logo del restaurante y en la estética de **Los Picapiedra**: colores cálidos, bordes gruesos, tipografía redondeada y sombras tipo cartoon.

### Paleta de colores

| Token | Variable CSS | Hex | Razón |
|---|---|---|---|
| `brand-orange` | `--color-brand-orange` | `#F97316` | Color dominante del logo, fondo del personaje |
| `brand-orange-light` | `--color-brand-orange-light` | `#FDBA74` | Variante clara para hovers y fondos suaves |
| `brand-orange-dark` | `--color-brand-orange-dark` | `#C2410C` | Variante oscura para estados activos |
| `brand-red` | `--color-brand-red` | `#DC2626` | Banner "The Gordo" en el logo |
| `brand-red-light` | `--color-brand-red-light` | `#FCA5A5` | Variante clara para alertas suaves |
| `brand-red-dark` | `--color-brand-red-dark` | `#991B1B` | Variante oscura para errores |
| `brand-yellow` | `--color-brand-yellow` | `#FCD34D` | Detalles del logo, acento energético |
| `brand-yellow-light` | `--color-brand-yellow-light` | `#FEF08A` | Fondo de badges o destacados |
| `brand-yellow-dark` | `--color-brand-yellow-dark` | `#D97706` | Contraste sobre amarillo claro |
| `stone-dark` | `--color-stone-dark` | `#78350F` | Marrón tierra, bordes y tipografía pesada |
| `stone-mid` | `--color-stone-mid` | `#92400E` | Variante media para sombras cartoon |
| `stone-light` | `--color-stone-light` | `#D97706` | Tierra clara, detalles secundarios |
| `bg-cream` | `--color-bg-cream` | `#FFFBEB` | Fondo general, evita el blanco frío |
| `bg-warm` | `--color-bg-warm` | `#FEF3C7` | Fondo de cards o secciones internas |

### Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Todo el sistema | **Fredoka** (Google Fonts) | Única fuente; pesos `font-semibold`, `font-bold` y `font-black` marcan la jerarquía |

Fredoka se carga desde Google Fonts (pesos 400–700) y se aplica globalmente al `body`. Toda jerarquía visual se logra con variaciones de peso, tamaño y color, sin cambiar de familia tipográfica.

### Estilo de componentes

- Bordes gruesos (`border-2` / `border-4`) en `stone-dark`
- Sombras sólidas offset (`shadow-[6px_6px_0px_#78350F]`) — efecto cartoon
- Botones con efecto "press": la sombra desaparece y el elemento se desplaza al hacer hover
- Bordes redondeados generosos (`rounded-xl`, `rounded-3xl`)

## Deploy

El proyecto se despliega automáticamente en Vercel con cada push a `main`. Configurar las variables de entorno en el panel de Vercel antes del primer deploy.

## Credenciales de administrador

| Campo | Valor |
|---|---|
| Email | `admin@mail.com` |
| Contraseña | `securepwd` |

> ⚠️ Credenciales de entorno de desarrollo/demo. No usar en producción.

## Autores

- **Santiago Alexander Ospina Pabón**
- **Emily Julieth Nieves Badillo**
