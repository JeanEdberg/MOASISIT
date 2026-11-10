# Moasist — Control de Asistencia y Planillas

Aplicación de **asistencia y planillas** para **INMOA Logística y Soluciones
E.I.R.L.** (Puerto Maldonado, Perú). Gestiona colaboradores, asistencia por
geolocalización, solicitudes, documentos y cálculo de planilla peruana
(AFP/ONP, EsSalud, CTS, gratificaciones, renta de quinta categoría).

Stack: **TanStack Start + React 19 + Vite + Nitro + Tailwind 4**, pensada para
desplegarse en **Vercel** con base de datos **Postgres/Neon**.

---

## Requisitos

- **Node.js 22.12 o superior** (probado en v24 y v26).
- **npm** (incluido con Node).
- Git.

```bash
node -v   # debe ser v22.12+
```

## Instalación y arranque local

```bash
git clone https://github.com/JeanEdberg/MOASISIT.git
cd MOASISIT
npm install
cp .env.example .env     # completa los valores (ver abajo)
npm run dev
```

Abre **http://localhost:8080**.

> Usa siempre `npm run dev` (no `npx vite dev`). El script carga
> `.grok/app-env.json`; saltárselo hace que el servidor de desarrollo y el
> build de producción no coincidan (por eso existe `npm run check:auth`).

## Credenciales de acceso

Moasist tiene su **propio login**:

- **Administración** → correo + contraseña.
- **Colaborador** → **DNI (8 dígitos)** + **PIN**.

La cuenta de Administración se crea en el primer arranque:

- Si defines `MOASIST_ADMIN_PASSWORD` en `.env`, esa es la contraseña inicial.
- Si no, se genera una aleatoria y se imprime en la consola del servidor.

Los **PIN de cada colaborador** también se imprimen en la consola al primer
login (busca `[moasist] Credenciales iniciales`). Cada PIN se entrega en
privado a su dueño.

En el **primer ingreso** el sistema obliga a cambiar la contraseña/PIN.

Para volver a generar el PIN de un colaborador: entra como RR.HH. → ficha del
colaborador → **Generar PIN**.

## Base de datos

Dos modos, elegidos con la variable `DATABASE_URL`:

| `DATABASE_URL` | Motor | Persistencia |
|---|---|---|
| Definida | Postgres (Neon, Supabase, RDS, local…) | **Sí** — recomendado para uso real |
| Vacía | PGLite embebido en memoria | **No** — los datos se borran al reiniciar (solo demos) |

Con `DATABASE_URL` definida, aplica el esquema una vez:

```bash
npm run db:migrate
```

En el deploy, `npm run build` ya ejecuta las migraciones automáticamente, así
que Vercel arranca con el esquema listo.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `:8080` |
| `npm run build` | Build de producción + migraciones |
| `npm run preview` | Sirve el build de producción |
| `npm test` | Suite completa de pruebas |
| `npm run typecheck` | Chequeo de tipos (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:migrate` | Aplica migraciones a `DATABASE_URL` |
| `npm run check:auth` | Verifica que dev y build coincidan |

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Crea una base **Postgres** (Neon es lo más simple: https://neon.tech).
3. En Vercel → Project → Settings → Environment Variables, define:
   - `DATABASE_URL` → cadena de conexión de Postgres.
   - `MOASIST_ADMIN_PASSWORD` → contraseña inicial de Administración.
4. Deploy. El `build` aplica las migraciones y la app queda lista.

## Variables de entorno

Ver `.env.example`. Las principales:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | No* | Postgres. Sin ella usa PGLite en memoria. |
| `MOASIST_ADMIN_PASSWORD` | Recomendada | Contraseña inicial del admin. |
| `VITE_AUTH_ENABLED` | No | Flag de la plantilla base; Moasist usa su propio login. |

\* Obligatoria para uso real (persistencia de datos).

> **Seguridad:** `.env` está en `.gitignore`. Nunca subas secretos al repo.

## Solución de problemas

- **"Port 8080 is already in use"** → ya hay un servidor corriendo:
  `fuser -k 8080/tcp` (o cierra el proceso anterior).
- **Los datos desaparecen al reiniciar** → estás en modo PGLite (sin
  `DATABASE_URL`). Define `DATABASE_URL` para persistir.
- **"relation hr_credential does not exist"** → faltan migraciones:
  `npm run db:migrate`.
- **El login no responde / PIN no funciona** → revisa la consola del servidor:
  ahí se imprimen las credenciales iniciales. Recuerda que el primer ingreso
  fuerza el cambio de PIN/contraseña.
- **dev y build no coinciden** → `npm run check:auth`.
