# Moasist — Arquitectura escalable multiempresa (Fase 1)

> Estado: **propuesta para aprobación**. No implementado todavía.
> Objetivo: soportar **100+ empresas** (y crecer) sin perder datos por
> concurrencia, con lecturas/escrituras rápidas y aislamiento por empresa real.

---

## 1. Por qué cambiar (diagnóstico del estado actual)

Hoy **todas** las empresas viven dentro de **una sola fila** `hr_dataset`
(id = 1), en un único documento JSONB:

- `src/lib/hr/dataset.server.ts` → `loadDataset()` / `saveDataset()`
- Cada lectura carga **todo** el documento; cada escritura **reescribe todo**
  (`on conflict (id) do update set data = excluded.data`).
- El aislamiento por empresa es **lógico** (`sanitizeForViewer`, puro), no del
  motor de base de datos.
- **No hay transacciones ni bloqueo**: dos guardados simultáneos = "el último
  gana" y puede perderse un cambio.

Con 3 empresas funciona. Con 100+ y años de marcaciones, el documento crece a
decenas de MB y aparecen lentitud, riesgo de pisarse y fuga de datos si se
filtra la cadena de conexión.

---

## 2. Diseño objetivo: esquema compartido, una fila por entidad

Patrón estándar SaaS multiempresa (*shared database, shared schema*): tablas
normales, cada fila con su `company_id`, e **índices** por `company_id`. El
motor solo toca las filas de la empresa consultada.

### 2.1 Tablas

```
companies          -- una fila por empresa (antes: companies[] dentro del JSONB)
  id                text PK
  name, short_name, trade_name, ruc, address, city, email, phone
  brand_name, brand_mark, brand_color, accent_color
  rmv, uit, tope_afp, essalud, onp, afp_aporte, afp_seguro,
  afp_comision      jsonb            -- { habitat, integra, prima, profuturo }
  eps_aporte_trabajador numeric
  active            boolean default true
  created_at, updated_at timestamptz

insurers           -- aseguradoras por empresa (antes: company.insurers[])
  id text PK, company_id text FK -> companies(id) on delete cascade
  name, kind ('eps'|'sctr'|'vida_ley'), rate, pension_rate, health_rate, active

areas
  id text PK, company_id text FK, name

employees
  id text PK, company_id text FK, area_id text FK -> areas(id)
  code, names, paternal, maternal, dni, email, phone, birth_date, address,
  hire_date, end_date, status, position, manager_id, contract, regime,
  salary numeric, family_allowance, pension,
  health_insurance, eps_insurer_id, sctr_insurer_id, vida_ley_insurer_id,
  work_mode, salary_bank, salary_account, cts_bank, cts_account,
  children int, vacation_history numeric
  unique (company_id, dni)

attendance
  id text PK, company_id text FK, employee_id text FK -> employees(id)
  date date, kind, check_in, check_out, extra25, extra35
  unique (employee_id, date)

requests
  id text PK, company_id text FK, employee_id text FK
  kind, start_date, end_date, status, note, created_at, decided_at

documents
  id text PK, company_id text FK, employee_id text null
  title, kind, date, status, period

payslips           -- boletas congeladas (antes: snapshots[period][])
  id text PK, company_id text FK, employee_id text FK, period text
  payload jsonb    -- las líneas y totales de la boleta (Payslip)
  unique (employee_id, period)

hr_credential      -- ya existe; se conserva tal cual
hr_session         -- ya existe; se conserva tal cual

audit_log          -- NUEVO: quién cambió qué y cuándo
  id bigserial PK, company_id text, actor_login text,
  action text, target text, payload jsonb, at timestamptz default now()
```

### 2.2 Índices (clave para la escala)

Toda tabla de dominio lleva `create index on <tabla> (company_id)`. Además:

- `employees (company_id, status)`
- `attendance (company_id, date)`, `attendance (employee_id, date)` (único)
- `requests (company_id, status)`
- `documents (company_id, employee_id)`
- `payslips (company_id, period)`

---

## 3. Aislamiento por empresa

### 3.1 En la aplicación (siempre)

Cada consulta y cada escritura filtra **por `company_id` de la sesión**,
resuelto en el servidor (nunca por un id enviado por el cliente). Se reemplaza
`loadDataset()` por funciones de repositorio por entidad, por ejemplo:

```
listEmployees(companyId, { role, employeeId })
upsertAttendance(companyId, row)   -- en una transacción
```

`activeCompanyId()` y la regla del superadmin (`company_id NULL` + selector) se
mantienen.

### 3.2 En la base de datos (segunda barrera, opcional)

Activar **Row-Level Security (RLS)** en las tablas de dominio:

- La app se conecta con un rol `moasist_app` (no dueño de las tablas).
- Al inicio de cada transacción: `select set_config('app.company_id', $1, true)`.
- Política: `using (company_id = current_setting('app.company_id', true))`.

Así, aunque haya un bug en el código, el motor **no devuelve** filas de otra
empresa. (Requiere crear el rol y conectar con él; se documenta como paso de
endurecimiento.)

---

## 4. Concurrencia y consistencia

El bug actual (el último que guarda pisa al otro) se corrige así:

1. **Escrituras por fila, en transacción** (`begin … commit`), no reescribir el
   documento completo.
2. Para operaciones que abarcan varias filas de una empresa (p. ej. cerrar
   planilla), usar `select … for update` o un *advisory lock* por empresa:
   `pg_advisory_xact_lock(hashtext(company_id))`.
3. `saveDataset()` desaparece del camino de escritura; el JSONB queda como
   **respaldo de solo lectura** durante la transición.

---

## 5. Migración de los datos actuales

Idempotente, en `migrations/`, aplicada por el migrador que ya existe
(`scripts/migrate.mjs` en deploy, `src/lib/db.ts` en PGLite):

- `0005_core_tables.sql` — crea las tablas e índices (§2).
- `0006_backfill_from_dataset.sql` — copia `hr_dataset.data` a las tablas:
  - `companies` ← `data.companies[]`
  - `insurers` ← `company.insurers[]`
  - `areas`, `employees`, `attendance`, `requests`, `documents` ← arreglos
  - `payslips` ← `data.snapshots{}` (una fila por `employeeId`+`period`)
  - Usa `on conflict do nothing` para ser re-ejecutable.
- La capa de datos se cambia a leer de las tablas. El JSONB se conserva un
  tiempo como respaldo y luego se puede eliminar (`0007_drop_dataset.sql`,
  opcional, tras validar).

> Orden de despliegue seguro: aplicar `0005`+`0006` (no rompe nada, la app sigue
> leyendo el JSONB) → desplegar el código nuevo → validar → recién entonces
> retirar el JSONB.

---

## 6. Nueva función: "Crear empresa" (desde la app)

Pantalla solo para **superadmin** (Empresa → Empresas → *Nueva empresa*):

1. Formulario: razón social, nombre corto, nombre comercial, RUC, ciudad,
   dirección, correo, colores y parámetros de planilla (valores por defecto de
   la referencia 2026).
2. En **una transacción**: crea la fila en `companies`, sus áreas iniciales y
   el **usuario RR.HH.** (login por correo + contraseña temporal,
   `must_change = true`).
3. Registra el alta en `audit_log`.

El superadmin también podrá **activar/desactivar** y **exportar** una empresa
(cada empresa es exportable por separado: `employees`, `attendance`, `payslips`
→ CSV/JSON).

Acciones nuevas en `HrAction` (autorizadas en el servidor):
`addCompany`, `toggleCompany`, `addCompanyAdmin`.

---

## 7. Fases de entrega

| Fase | Alcance | Resultado |
|---|---|---|
| **0** | Neon + `DATABASE_URL` + `MOASIST_ADMIN_PASSWORD` en Vercel | Datos persistentes, sin cambios de código |
| **1a** | `0005`+`0006`: tablas + backfill | Esquema listo, app sigue igual |
| **1b** | Capa de datos por entidad + transacciones | Lecturas/escrituras por empresa, sin pisarse |
| **1c** | Pantalla **Crear empresa** + `audit_log` | Alta de empresas sin tocar código |
| **2** | RLS, paginación, export/backup por empresa | Endurecido para 100+ empresas |

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Perder datos en la migración | Backfill idempotente + JSONB conservado como respaldo + validación previa |
| Regresión funcional al cambiar la capa de datos | Pruebas por repositorio; mantener `sanitizeForViewer` como referencia de reglas |
| Concurrencia | Transacciones + `for update`/advisory lock por empresa |
| Fuga entre empresas | Filtro por `company_id` en servidor + RLS opcional |
| Costos | Neon free arranca; escalar a plan pago solo si el volumen lo exige |
