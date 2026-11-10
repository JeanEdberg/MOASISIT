# Moasist — Guía minuciosa: conectar Neon a Vercel (paso a paso con pausas)

Objetivo: que los datos de Moasist se guarden de verdad (dejen de borrarse al
reiniciar). Tiempo estimado: 10–15 minutos. **No hay que escribir SQL ni código.**

Regla de oro: la cadena de conexión es un **secreto**. Solo se pega en Vercel.
Nunca en el chat, ni en capturas, ni en el repositorio.

---

## PARTE A — Obtener la credencial en Neon

### A1. Entrar a Neon
1. Abre el navegador y ve a **https://console.neon.tech**
2. Pulsa **Sign in** y entra con el mismo método que usaste al crear la cuenta
   (GitHub, Google o correo).

**⏸️ PAUSA 1** — Debes ver el **panel de Neon** con tu proyecto
`my-first-project` (o el nombre que le pusiste) en una lista al costado o en el
centro. Si lo ves, continúa.

### A2. Abrir el proyecto
1. Haz **clic en el nombre del proyecto**.

**⏸️ PAUSA 2** — Debes ver una pantalla con pestañas o secciones como
**Tables**, **SQL Editor**, **Branches**, **Monitoring**, y un botón grande que
suele decir **Connect** (o **Connection string**).

### A3. Abrir la ventana "Connect"
1. Busca y pulsa el botón **Connect** (arriba, cerca del nombre del proyecto).
   - Si no lo ves, busca en el menú lateral **Dashboard → Connection string**.

**⏸️ PAUSA 3** — Se abre un panel/ventana con un **desplegable** que dice algo
como *Connection type*, *Branch*, *Database*, y un **selector de tipo de
conexión**. Y abajo un cuadro con un texto largo que empieza con
`postgresql://`.

### A4. Elegir la conexión AGRUPADA (muy importante)
1. En el desplegable **Connection type** (o donde diga *Pooled / Direct*),
   elige **Pooled connection**.
   - Pista: en el texto de la cadena debe aparecer **`-pooler`** en el medio del
     host, por ejemplo:
     `...ep-super-base-bbzb19ta-pooler.c-15.us-east-1.aws.neon.tech...`
   - Si NO dice `-pooler`, estás en la **Direct**; cámbiala a **Pooled**.

**⏸️ PAUSA 4** — En el cuadro, la cadena debe verse así (con `-pooler`):

```
postgresql://neondb_owner:ALGO@ep-super-base-bbzb19ta-pooler.c-15.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### A5. Copiar la cadena
1. Pulsa el botón **Copy** (ícono de copiar, al lado del cuadro de texto).
   - O selecciona todo el texto manualmente y cópialo (Ctrl+C / Cmd+C).
2. **Pégala en un bloc de notas temporal** (Notas, Word, o un archivo de texto)
   para tenerla a mano mientras vas a Vercel.
   - ⚠️ No la pegues en el chat ni la compartas. Es tu contraseña de base.

**⏸️ PAUSA 5** — Tienes la cadena completa guardada temporalmente, y empieza con
`postgresql://` y contiene `-pooler`. **Deja esa ventana de Neon abierta** por si
necesitas volver a copiarla. Continúa con la Parte B.

---

## PARTE B — Pegar la credencial en Vercel

### B1. Entrar a Vercel
1. Abre una pestaña nueva y ve a **https://vercel.com/login**
2. Entra con la misma cuenta con la que desplegaste Moasist
   (GitHub es lo habitual).

**⏸️ PAUSA 6** — Debes ver tu **dashboard** con la lista de proyectos.

### B2. Abrir el proyecto
1. En la lista, haz **clic en el proyecto de Moasist**
   (por el nombre del repositorio, p. ej. **MOASISIT**).

**⏸️ PAUSA 7** — Debes ver la pantalla del proyecto con pestañas arriba:
**Project**, **Deployments**, **Analytics**, **Speed Insights**,
**Logs**, **Storage**, **Settings** (la última suele estar al final del menú
superior o lateral).

### B3. Abrir Variables de entorno
1. Pulsa **Settings**.
2. En el menú lateral izquierdo, pulsa **Environment Variables**.

**⏸️ PAUSA 8** — Debes ver una sección titulada **Environment Variables** y un
botón **Add New** (o **Add Environment Variable**). Si ya hay variables
listadas, no las toques; solo agregaremos dos.

### B4. Crear la primera variable: `DATABASE_URL`
1. Pulsa **Add New** (o el campo **Key**).
2. En **Key** (o **Name**) escribe, exactamente, en minúsculas y con guion bajo:
   ```
   DATABASE_URL
   ```
3. En **Value**, **pega la cadena pooled** que copiaste de Neon
   (la que tiene `-pooler`).
   - Revisa que **no** haya un **espacio** al inicio ni al final.
   - Revisa que empiece con `postgresql://` y termine en `channel_binding=require`.
4. En **Environments**, marca las **tres** casillas:
   **Production**, **Preview** y **Development**.
   - (Suele venir marcadas por defecto; si hay una opción "All Environments",
     úsala.)
5. Pulsa **Save**.

**⏸️ PAUSA 9** — La lista debe mostrar ahora una fila con
**Key = `DATABASE_URL`** y, en la columna Environments, **Production, Preview,
Development**. El **valor estará oculto** (puntos o `••••`) — eso es normal y
correcto.

### B5. Crear la segunda variable: `MOASIST_ADMIN_PASSWORD`
1. Pulsa **Add New** otra vez.
2. En **Key** escribe, exactamente:
   ```
   MOASIST_ADMIN_PASSWORD
   ```
3. En **Value** escribe la contraseña inicial de tu cuenta de Administración.
   - Requisitos: **mínimo 10 caracteres**, con **al menos una mayúscula, una
     minúscula y un número**.
   - Ejemplo de forma (no lo uses tal cual): `Moasist2026`
   - **Anótala** en un lugar seguro: la usarás para entrar la primera vez y el
     sistema te pedirá cambiarla.
4. Marca **Production**, **Preview** y **Development**.
5. Pulsa **Save**.

**⏸️ PAUSA 10** — La lista debe mostrar **dos** filas: `DATABASE_URL` y
`MOASIST_ADMIN_PASSWORD`, cada una con los tres entornos. Si las ves, ya está
todo lo de Vercel configurado.

### B6. Redesplegar para que tome las variables
> Las variables **no se aplican solas**: hay que volver a desplegar.

1. Ve a la pestaña **Deployments** (arriba).
2. En el **último** despliegue (el de más arriba), pulsa el botón **⋯**
   (tres puntos, a la derecha de la fila).
3. En el menú, pulsa **Redeploy**.
4. En el diálogo, **desmarca** "Use existing build cache" si aparece
   (para que reconstruya limpio) y confirma **Redeploy**.

**⏸️ PAUSA 11** — Verás el despliegue con estado **Building** (amarillo o azul
animado). Espera sin cerrar. Cuando termine debe pasar a **Ready** (verde).
- Si queda en **Error** (rojo): no te alarmes. Haz clic en el despliegue, copia
  el **mensaje de error** (ese sí no lleva secretos) y mándalo para resolverlo.

### B7. Probar que quedó conectado
1. Abre la app (el dominio de Vercel, p. ej.
   `https://moasisit.vercel.app`).
2. En la pantalla de inicio de sesión, elige la pestaña **Administración**.
3. Correo: el de tu cuenta admin (p. ej.
   `inmoalogisticaysoluciones@gmail.com`).
4. Contraseña: la que pusiste en `MOASIST_ADMIN_PASSWORD`.
5. Al entrar, el sistema te pedirá **cambiar la contraseña**: elige una nueva y
   guárdala.
6. Entra a **Personas**: verás los datos de ejemplo. Para empezar de cero:
   **Empresa → Quitar personas de ejemplo**.

**⏸️ PAUSA 12 (prueba final de persistencia)** — Cierra la pestaña, espera 1
minuto, vuelve a entrar y revisa que **tus datos siguen ahí**. Si es así, la
base de datos ya está funcionando de forma real y **los datos ya no se borran**.

---

## Verificación en Neon (opcional, para confirmar)

1. Vuelve a **https://console.neon.tech** → tu proyecto → pestaña **Tables**.
2. Debes ver: **`hr_dataset`**, **`hr_credential`**, **`hr_session`**,
   **`_migrations`**.

Si aparecen esas cuatro tablas, el deploy creó el esquema correctamente.

---

## Si algo falla (mensajes típicos y solución)

| Mensaje | Causa | Solución |
|---|---|---|
| `channel binding` / `SASL` | Neon añade un parámetro que el driver no usa | En la cadena, borra `&channel_binding=require` del final |
| `password authentication failed` | La cadena se copió incompleta | Vuelve a Neon, copia de nuevo la cadena completa (con la contraseña) |
| `ENOTFOUND` / `timeout` | Usaste la cadena **direct** (sin `-pooler`) o hay un espacio al pegar | Usa la **pooled** y borra espacios al inicio/final |
| El build no encuentra `DATABASE_URL` | No marcaste Production, o no redesplegaste | Revisa los entornos y haz **Redeploy** |

---

## Recordatorio de seguridad

- La cadena y la contraseña son **secretos**: solo en Vercel.
- Para probar en tu computadora, usa una **rama de Neon** distinta a la de
  producción (Neon → Branches → New Branch) y ponla en un archivo `.env` local
  (que **no** se sube al repositorio).
