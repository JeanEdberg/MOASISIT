# Moasist — Fase 0: base de datos persistente en Neon

Objetivo: dejar de perder datos al reiniciar. **No requiere cambios de código**:
solo crear la base en Neon y definir las variables en Vercel.

---

## 1. Crear la cuenta y el proyecto en Neon

1. Entra a **https://neon.tech** y pulsa **Sign up**.
   - Lo más rápido: **Continue with GitHub** o **Continue with Google**.
   - Con correo: usa tu correo y verifica el mensaje que te envían.
2. Neon pide crear un **proyecto** (es tu base de datos):
   - **Name**: `moasist-prod`
   - **Postgres version**: deja la que viene por defecto (16/17).
   - **Region**: la más cercana a Perú. La mejor opción es
     **AWS US East (N. Virginia)** o **US West (Oregon)**; cualquiera sirve.
   - Pulsa **Create project**.
3. Neon crea el proyecto y te muestra la pantalla **Connection string**.
   - Elige la pestaña **Pooled connection** (importante para serverless).
   - Copia la cadena; se ve así:
     `postgresql://usuario:password@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`

> Tu **"usuario" en Neon** es la cuenta de login del sitio (GitHub/Google/correo).
> La **cadena de conexión** es otra cosa: es la "llave" de la base, y lleva un
> usuario de Postgres y contraseña que Neon genera solo. Esa llave **no se
> comparte** ni se sube al repositorio.

### Dónde volver a ver la cadena
Neon → tu proyecto → **Dashboard → Connection string** → copiar (Pooled).

---

## 2. Definir las variables en Vercel

1. Entra a **https://vercel.com** → tu proyecto **MOASISIT**.
2. **Settings → Environment Variables**.
3. Agrega las variables (marca los tres entornos: Production, Preview,
   Development). Solo `DATABASE_URL` es obligatoria; las demás son opcionales
   pero recomendadas:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la cadena **pooled** copiada de Neon (obligatoria) |
| `MOASIST_ADMIN_PASSWORD` | la contraseña inicial de tu cuenta de Administración (mín. 10 caracteres, con mayúscula, minúscula y número) |
| `MOASIST_ADMIN_LOGIN` | el correo del administrador (opcional; si se deja vacío usa el de INMOA) |
| `MOASIST_LOG_CREDENTIALS` | `false` en producción (opcional y recomendado: evita que la contraseña del admin y los PIN se impriman en los registros del servidor) |
| `RUC_API_ENDPOINT` | (opcional) endpoint para consultar el RUC en SUNAT al crear una empresa |
| `RUC_API_TOKEN` | (opcional) token de ese servicio de consulta de RUC |

4. **Redeploy** (Deployments → … → Redeploy) para que tome las variables.

En el deploy, `npm run build` ejecuta **automáticamente** `npm run db:migrate`,
que crea el esquema en tu base Neon. No hay que hacer nada más.

---

## 3. Primer ingreso

1. Abre la app desplegada.
2. **Administración** → tu correo + `MOASIST_ADMIN_PASSWORD`.
3. El sistema te **obliga a cambiar la contraseña** en el primer ingreso.
4. Entra a **Personas** y verás el dataset de ejemplo. Para empezar de cero:
   **Empresa → Quitar personas de ejemplo**.

---

## 4. Comprobaciones

- Reinicia el deploy: **los datos deben seguir ahí** (ya no es memoria).
- Neon → **Tables**: deben aparecer `hr_dataset`, `hr_credential`,
  `hr_session`, `_migrations`.
- Neon → **Monitoring**: verás las consultas al entrar a la app.

---

## 5. Notas de seguridad y costos

- La cadena de conexión es un **secreto**: solo en Vercel (Environment
  Variables). Nunca en el repositorio ni en capturas.
- Neon free tiene *scale-to-zero*: si nadie usa la app un rato, la base se
  "duerme" y el primer acceso tarda ~1 s en despertar. Es normal.
- Para desarrollo local, copia `.env.example` a `.env` y pon ahí tu
  `DATABASE_URL` de una **rama de Neon aparte** (no la de producción), así
  pruebas sin tocar datos reales.
- Neon permite **ramas** (branches): úsalas para probar cambios de esquema sin
  arriesgar producción.
