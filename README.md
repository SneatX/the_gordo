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
├── controllers/        # Lógica de negocio y validaciones
├── hooks/              # Bridge entre controllers y vistas
├── lib/
│   └── supabase.ts     # Cliente Supabase tipado
├── pages/
│   └── admin/          # Panel de administración
├── routes/
│   └── AppRouter.tsx   # Rutas de la aplicación
├── services/           # Única capa que habla con Supabase
└── types/
    ├── database.types.ts   # Tipos auto-generados por Supabase CLI
    ├── domain/             # Tipos del dominio (camelCase, enums, Date)
    └── index.ts            # Barrel exports
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

## Módulos

**Cliente (público)**
- Vista gráfica del salón con estado en tiempo real de cada mesa
- Selección de mesa, fecha, hora y número de personas
- Formulario de reserva y pantalla de confirmación

**Administrador (autenticado)**
- Gestión de mesas: crear, editar, bloquear/desbloquear
- Gestión de ubicaciones del salón
- Gestión de horarios por día de la semana
- Listado y cancelación de reservas

## Deploy

El proyecto se despliega automáticamente en Vercel con cada push a `main`. Configurar las variables de entorno en el panel de Vercel antes del primer deploy.
