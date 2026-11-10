/**
 * Genera el manual de uso de Moasist en PDF, uno por rol.
 *
 *   node scripts/generate-manual.mjs
 *
 * Escribe los HTML y los PDF en public/manuales/. Requiere Chromium/Chrome en el
 * PATH (o la variable CHROME_PATH). No necesita red ni dependencias nuevas.
 *
 * La carpeta public/manuales/ se sirve como archivos estáticos, por eso el
 * superadmin puede descargarlos desde la app (botón en la pantalla Manual).
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/manuales");

const BRAND = "#0284c7";
const BRAND_DARK = "#075985";

/** Utilidades de marcado (evitan repetir HTML en el contenido). */
const h2 = (t) => `<h2>${t}</h2>`;
const h3 = (t) => `<h3>${t}</h3>`;
const p = (t) => `<p>${t}</p>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const ol = (items) => `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
const tip = (t) => `<div class="box tip"><span class="tag">Recomendación</span>${t}</div>`;
const warn = (t) => `<div class="box warn"><span class="tag">Importante</span>${t}</div>`;
const info = (t) => `<div class="box info"><span class="tag">Nota</span>${t}</div>`;
const table = (rows, head) =>
  `<table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;

// ── Contenido por rol ────────────────────────────────────────────────────────

const COMMON_INTRO = {
  "que-es": [
    h2("¿Qué es Moasist?"),
    p(
      "Moasist es el sistema de <strong>control de asistencia y planillas</strong> de tu empresa. " +
        "Reúne en un solo lugar a las personas, su asistencia, sus vacaciones, sus documentos y su boleta de pago, " +
        "siguiendo la normativa laboral peruana (RMV, UIT, ONP/AFP, EsSalud, CTS y gratificaciones).",
    ),
    p("Funciona en el navegador (no hay que instalar nada en la PC). Cada empresa ve únicamente su propia información."),
  ].join(""),
  "como-entrar": [
    h2("Cómo entrar al sistema"),
    p("En la pantalla de inicio de sesión elige la pestaña que te corresponde:"),
    table(
      [
        ["Administración", "Correo electrónico y contraseña", "Superadmin (el dueño del sistema)"],
        ["Colaborador", "DNI (8 dígitos) y PIN", "Todo el personal con cuenta"],
      ],
      ["Pestaña", "Qué se escribe", "Para quién"],
    ),
    p(
      "La primera vez que entras, el sistema te obliga a <strong>cambiar tu PIN o contraseña</strong> por seguridad. " +
        "Los PIN iniciales los entrega Recursos Humanos en privado.",
    ),
    warn("No compartas tu PIN ni tu contraseña. Cada acción queda registrada con tu usuario."),
  ].join(""),
};

const MANUALS = [
  {
    file: "manual-superadmin",
    role: "Superadministrador (Desarrollador)",
    tagline: "Cómo funciona toda la aplicación",
    color: BRAND,
    intro:
      "Este manual está dirigido a la persona que administra el sistema completo (por ejemplo, el responsable de TI o el proveedor). " +
      "Explica cada módulo y las tareas exclusivas de este rol.",
    sections: [
      {
        id: "rol",
        title: "Tu rol y lo que puedes hacer",
        html: [
          p("El superadministrador es el único rol que ve <strong>todas las empresas</strong> y puede cambiar entre ellas."),
          table(
            [
              ["Ver todas las empresas y cambiar de empresa", "Sí"],
              ["Crear, editar y eliminar empresas", "Sí"],
              ["Administrar suscripciones (precio, cobro, vencimiento)", "Sí"],
              ["Todo lo que hace Recursos Humanos", "Sí"],
            ],
            ["Permiso", "Superadmin"],
          ),
          info("Los demás roles (RR.HH., jefatura, colaborador) solo ven la empresa a la que pertenecen."),
        ].join(""),
      },
      {
        id: "selector",
        title: "Selector de empresa",
        html: [
          p(
            "Arriba a la izquierda, junto al nombre del sistema, hay un <strong>selector</strong> con todas las empresas. " +
              "Al elegir una, toda la aplicación muestra los datos de esa empresa.",
          ),
          ol(["Entra con tu cuenta de Administración.", "Usa el selector de la parte superior para cambiar de empresa.", "Verifica que el nombre y el RUC correspondan a la empresa correcta."]),
        ].join(""),
      },
      {
        id: "inicio",
        title: "Inicio (panel general)",
        html: [
          p("Es el resumen del día. Muestra tarjetas con:"),
          ul([
            "<strong>Personas activas</strong> en la empresa.",
            "<strong>Neto a pagar</strong> en la planilla del mes.",
            "<strong>Marcaciones de hoy</strong> y tardanzas de la semana.",
            "<strong>Solicitudes por revisar</strong> (vacaciones, permisos, descansos).",
            "<strong>CTS del semestre</strong> cuando corresponde.",
          ]),
        ].join(""),
      },
      {
        id: "personas",
        title: "Personas (colaboradores)",
        html: [
          p("Es el directorio del personal. Desde aquí se da de alta a cada persona y se edita su ficha laboral."),
          h3("Agregar una persona"),
          ol([
            "Entra a <strong>Personas</strong> y pulsa <strong>Nueva persona</strong>.",
            "Completa los datos: nombres, apellidos, DNI, correo, teléfono, fecha de nacimiento y dirección.",
            "Define lo laboral: área, cargo, jefe, tipo de contrato, régimen, sueldo, pensión (ONP/AFP), seguro de salud y modalidad de trabajo.",
            "Guarda. El sistema genera automáticamente su <strong>contrato en Word</strong> y su cuenta de acceso.",
          ]),
          h3("Importar varias personas (CSV)"),
          p("Permite cargar todo el personal de una sola vez con una plantilla CSV. Ideal para la puesta en marcha inicial."),
          h3("Cuentas de acceso"),
          p("Cada persona entra con su <strong>DNI</strong>. El PIN inicial se genera solo y se entrega en privado. Desde la ficha se puede <strong>regenerar el PIN</strong> si se olvida."),
          tip("El DNI es el usuario de acceso. Si cambias el DNI de una persona, el sistema actualiza su usuario automáticamente."),
        ].join(""),
      },
      {
        id: "organizacion",
        title: "Organización",
        html: [
          p("Muestra la jerarquía por jefatura y la distribución por áreas. En esta vista <strong>no se muestran sueldos</strong>."),
        ].join(""),
      },
      {
        id: "vacaciones",
        title: "Vacaciones",
        html: [
          p("Registra y aprueba el descanso vacacional. El saldo se calcula por régimen: <strong>30 días al año</strong> en régimen general y <strong>15 días</strong> en pequeña empresa, microempresa y prácticas."),
          ul(["Ver el saldo y lo que está en trámite.", "Registrar una solicitud (fechas y tipo).", "Aprobar o rechazar la solicitud."]),
        ].join(""),
      },
      {
        id: "asistencia",
        title: "Asistencia",
        html: [
          p("Controla la jornada: entradas, salidas, tardanzas, faltas y horas extra."),
          h3("Cómo se valida la ubicación"),
          p("Depende de la modalidad de cada persona:"),
          table(
            [
              ["Presencial / Híbrido", "Exige estar dentro de la geocerca de la oficina"],
              ["Campo / Virtual / Itinerante", "Registra sin geocerca estricta"],
            ],
            ["Modalidad", "Regla de ubicación"],
          ),
          h3("Sin conexión a internet"),
          p("Las marcaciones se guardan en el dispositivo y se <strong>sincronizan solas</strong> al recuperar la red."),
          h3("Reglas de cálculo"),
          ul([
            "Una falta descuenta un treintavo del sueldo.",
            "Las dos primeras horas extra van al 25%; el resto, al 35%.",
          ]),
        ].join(""),
      },
      {
        id: "planilla",
        title: "Planilla (boletas de pago)",
        html: [
          p("Calcula la boleta de cada persona: sueldo, asignación familiar, AFP u ONP, quinta categoría, EsSalud y descuentos."),
          ul([
            "En <strong>julio y diciembre</strong> se suma la gratificación.",
            "En <strong>mayo y noviembre</strong> se suma la CTS del semestre.",
          ]),
          tip("El cálculo es referencial para gestionar tu planilla; no reemplaza la presentación oficial del PLAME ante SUNAT."),
        ].join(""),
      },
      {
        id: "consolidado",
        title: "Consolidado Masivo",
        html: [
          p("Calcula de una sola vez la <strong>CTS y las gratificaciones</strong> de todo el personal, bajo normativa peruana. Sirve para preparar los depósitos bancarios."),
          p("El <strong>Consolidado de Asistencia</strong> resume por mes la asistencia, tardanzas y horas extra de todo el personal."),
        ].join(""),
      },
      {
        id: "documentos",
        title: "Documentos",
        html: [
          p("Guarda contratos, boletas y políticas en un solo lugar."),
          warn("Marcar un documento como <strong>firmado</strong> es un registro interno de la empresa: no es la firma electrónica del Ministerio de Trabajo."),
        ].join(""),
      },
      {
        id: "empresa",
        title: "Empresa (configuración)",
        html: [
          p("Desde <strong>Empresa</strong> se ajusta la identidad y los parámetros de cálculo:"),
          ul([
            "<strong>Identidad:</strong> razón social, nombre comercial, RUC, ciudad, dirección y correo.",
            "<strong>Marca y colores:</strong> nombre del producto, color principal y de acento.",
            "<strong>Parámetros de planilla:</strong> RMV, UIT, tope AFP, EsSalud, ONP, aporte AFP, prima de seguro y comisiones AFP por flujo.",
            "<strong>Aseguradoras y seguros:</strong> EPS, SCTR y Seguro de Vida Ley con sus tasas.",
            "<strong>Áreas:</strong> áreas de la empresa.",
          ]),
          tip("Los valores iniciales siguen la referencia 2026. Actualízalos cuando cambie la norma."),
        ].join(""),
      },
      {
        id: "suscripciones",
        title: "Suscripciones (solo superadmin)",
        html: [
          p("Gestiona el plan de cada empresa: <strong>precio mensual, día de cobro, fecha de alta y vencimiento</strong>. La app calcula el prorrateo del primer mes y avisa cuando toca cobrar."),
          ul(["Activar o cancelar la suscripción.", "Eliminar una empresa (con confirmación)."]),
          warn("Solo el superadministrador ve y edita esta sección. Los demás roles no tienen acceso."),
        ].join(""),
      },
      {
        id: "nueva-empresa",
        title: "Crear una empresa nueva",
        html: [
          ol([
            "Entra a <strong>Empresa</strong> y pulsa <strong>Nueva empresa</strong>.",
            "Escribe el RUC. El sistema consulta SUNAT y autocompleta la razón social y la dirección.",
            "Confirma el nombre corto (se usa en los saludos) y guarda.",
          ]),
          info("Cada empresa nueva queda aislada: sus datos no se mezclan con los de las demás."),
        ].join(""),
      },
      {
        id: "seguridad",
        title: "Seguridad y protección de datos",
        html: [
          ul([
            "Los permisos se validan en el <strong>servidor</strong>, no en el navegador.",
            "Cada empresa está <strong>aislada</strong>: no se puede leer ni escribir datos de otra.",
            "Los datos personales (DNI, sueldos, cuentas) <strong>no viajan al navegador</strong> hasta que inicias sesión.",
            "Tras varios intentos fallidos, la cuenta se bloquea temporalmente.",
          ]),
          tip("Recomendado en producción: activar la base de datos persistente (Neon) y apagar el registro de credenciales en consola."),
        ].join(""),
      },
    ],
  },

  {
    file: "manual-rrhh",
    role: "Recursos Humanos",
    tagline: "Las opciones a las que tienes acceso",
    color: "#0f766e",
    intro:
      "Este manual está dirigido al área de Recursos Humanos. Explica cada opción disponible en tu menú y cómo usarla paso a paso.",
    sections: [
      {
        id: "rol",
        title: "Tu rol y lo que puedes hacer",
        html: [
          p("Como Recursos Humanos gestionas todo el personal de <strong>tu empresa</strong>."),
          table(
            [
              ["Ver y editar a las personas de tu empresa", "Sí"],
              ["Asistencia, vacaciones, planilla y documentos", "Sí"],
              ["Configurar tu empresa y parámetros de planilla", "Sí"],
              ["Crear empresas o cambiar suscripciones", "No"],
              ["Ver datos de otras empresas", "No"],
            ],
            ["Acción", "RR.HH."],
          ),
          p("Tu menú lateral incluye: Inicio, Personas, Organización, Vacaciones, Asistencia, Planilla, Consolidado Masivo, Documentos, Empresa y Manual."),
        ].join(""),
      },
      {
        id: "inicio",
        title: "Inicio (panel)",
        html: [
          p("Es tu resumen del día: personas activas, neto a pagar, marcaciones de hoy, solicitudes por revisar y CTS del semestre."),
        ].join(""),
      },
      {
        id: "personas",
        title: "Personas",
        html: [
          p("El directorio de tu personal. Desde aquí das de alta, editas y consultas cada ficha."),
          h3("Agregar una persona"),
          ol([
            "Pulsa <strong>Nueva persona</strong>.",
            "Completa los datos personales (nombres, apellidos, DNI, correo, teléfono, nacimiento, dirección).",
            "Completa lo laboral (área, cargo, jefe, contrato, régimen, sueldo, pensión, seguro y modalidad de trabajo).",
            "Guarda: se genera su contrato en Word y su cuenta de acceso.",
          ]),
          h3("Importar en masa"),
          p("Usa la plantilla CSV para cargar a todo el personal de una sola vez."),
          h3("PIN de acceso"),
          p("Cada persona entra con su DNI y un PIN. Si alguien lo olvida, abre su ficha y usa <strong>Generar PIN</strong> para entregarle uno nuevo en privado."),
          tip("La vista de jefatura no muestra remuneraciones; la tuya sí."),
        ].join(""),
      },
      {
        id: "organizacion",
        title: "Organización",
        html: [p("Muestra la jerarquía por jefatura y las áreas. No muestra sueldos.")].join(""),
      },
      {
        id: "vacaciones",
        title: "Vacaciones",
        html: [
          p("Revisa y aprueba el descanso vacacional del personal."),
          ul([
            "El saldo se calcula por régimen: 30 días al año en régimen general y 15 en pequeña empresa, microempresa y prácticas.",
            "Registra solicitudes con fechas y tipo.",
            "Aprueba o rechaza cada solicitud.",
          ]),
        ].join(""),
      },
      {
        id: "asistencia",
        title: "Asistencia",
        html: [
          p("Registra y revisa entradas, salidas, tardanzas, faltas y horas extra."),
          ul([
            "Presencial e híbrido exigen estar dentro de la geocerca de la oficina.",
            "Campo, virtual e itinerante registran sin geocerca estricta.",
            "Sin internet, las marcas se guardan y se sincronizan al volver la red.",
            "Una falta descuenta un treintavo; las dos primeras horas extra van al 25% y el resto al 35%.",
          ]),
        ].join(""),
      },
      {
        id: "planilla",
        title: "Planilla",
        html: [
          p("Genera la boleta de pago de cada persona con sueldo, asignación familiar, AFP u ONP, quinta categoría y EsSalud."),
          ul(["Julio y diciembre: se suma la gratificación.", "Mayo y noviembre: se suma la CTS del semestre."]),
          tip("El cálculo es referencial; no reemplaza el PLAME."),
        ].join(""),
      },
      {
        id: "consolidado",
        title: "Consolidado Masivo",
        html: [p("Calcula CTS y gratificaciones de todo el personal de una sola vez, para preparar los depósitos.")].join(""),
      },
      {
        id: "documentos",
        title: "Documentos",
        html: [
          p("Reúne contratos, boletas y políticas. Puedes marcar un documento como firmado (registro interno)."),
          warn("Marcar como firmado no es la firma electrónica del Ministerio de Trabajo."),
        ].join(""),
      },
      {
        id: "empresa",
        title: "Empresa",
        html: [
          p("Ajusta la identidad de tu empresa y los parámetros de planilla: razón social, RUC, marca, RMV, UIT, tope AFP, EsSalud, ONP, aportes y comisiones AFP, aseguradoras y áreas."),
          tip("Los valores iniciales siguen la referencia 2026. Actualízalos cuando cambie la norma."),
        ].join(""),
      },
      {
        id: "seguridad",
        title: "Buenas prácticas",
        html: [
          ul([
            "Entrega cada PIN en privado y pide cambiarlo en el primer ingreso.",
            "No compartas tu propia contraseña.",
            "Cierra sesión al terminar en una computadora compartida.",
          ]),
        ].join(""),
      },
    ],
  },

  {
    file: "manual-jefatura",
    role: "Jefatura",
    tagline: "Gestión de tu equipo",
    color: "#7c3aed",
    intro:
      "Este manual está dirigido a las jefaturas. Explica las opciones disponibles para gestionar a tu equipo, sin acceso a las remuneraciones.",
    sections: [
      {
        id: "rol",
        title: "Tu rol y lo que puedes hacer",
        html: [
          p("Como jefatura gestionas únicamente a <strong>tu equipo</strong> (las personas que te reportan)."),
          table(
            [
              ["Ver a tu equipo y su organización", "Sí"],
              ["Aprobar vacaciones y solicitudes de tu equipo", "Sí"],
              ["Registrar asistencia de tu equipo", "Sí"],
              ["Ver remuneraciones o sueldos", "No"],
              ["Editar la empresa o su planilla", "No"],
            ],
            ["Acción", "Jefatura"],
          ),
          p("Tu menú incluye: Inicio, Equipo, Organización, Vacaciones, Asistencia, Documentos y Manual."),
        ].join(""),
      },
      {
        id: "equipo",
        title: "Equipo",
        html: [p("Es el directorio de tu equipo. Muestra los datos de la ficha laboral, pero <strong>no las remuneraciones</strong>.")].join(""),
      },
      {
        id: "vacaciones",
        title: "Vacaciones",
        html: [p("Revisa las solicitudes de tu equipo y <strong>aprueba o rechaza</strong> cada una. Solo puedes decidir sobre las personas que te reportan.")].join(""),
      },
      {
        id: "asistencia",
        title: "Asistencia",
        html: [p("Registra y revisa la asistencia de tu equipo: entradas, salidas, tardanzas y horas extra.")].join(""),
      },
      {
        id: "documentos",
        title: "Documentos",
        html: [p("Consulta los documentos que Recursos Humanos ponga a disposición.")].join(""),
      },
    ],
  },

  {
    file: "manual-colaborador",
    role: "Colaborador",
    tagline: "Tu asistencia, tus vacaciones y tu boleta",
    color: "#b45309",
    intro:
      "Este manual está dirigido a todo el personal. Explica cómo fichar tu asistencia, pedir vacaciones y ver tu boleta de pago.",
    sections: [
      {
        id: "rol",
        title: "Tu rol y lo que puedes hacer",
        html: [
          p("Como colaborador ves y gestionas <strong>tu propia información</strong>."),
          table(
            [
              ["Fichar tu asistencia", "Sí"],
              ["Solicitar vacaciones o permisos", "Sí"],
              ["Ver tu boleta de pago", "Sí"],
              ["Ver tus documentos", "Sí"],
              ["Ver información de otras personas", "No"],
            ],
            ["Acción", "Colaborador"],
          ),
          p("Tu menú incluye: Inicio, Vacaciones, Asistencia, Mi boleta, Documentos y Manual."),
        ].join(""),
      },
      {
        id: "entrar",
        title: "Cómo entrar",
        html: [
          ol([
            "Abre Moasist en el navegador.",
            "Elige la pestaña <strong>Colaborador</strong>.",
            "Escribe tu <strong>DNI</strong> (8 dígitos) y tu <strong>PIN</strong>.",
            "La primera vez, el sistema te pedirá cambiar el PIN.",
          ]),
          warn("Si olvidas tu PIN, pídele a Recursos Humanos que genere uno nuevo."),
        ].join(""),
      },
      {
        id: "asistencia",
        title: "Fichar asistencia",
        html: [
          p("Desde <strong>Asistencia</strong> registras tu entrada y salida del día."),
          ul([
            "Según tu modalidad, el sistema puede pedirte estar dentro de la ubicación de la oficina.",
            "Si no tienes internet, la marca se guarda en tu dispositivo y se sincroniza después.",
          ]),
          tip("Ficha a tu hora real. Las marcas alimentan tu boleta de pago."),
        ].join(""),
      },
      {
        id: "vacaciones",
        title: "Solicitar vacaciones",
        html: [
          ol(["Entra a <strong>Vacaciones</strong>.", "Pulsa <strong>Nueva solicitud</strong>.", "Indica el tipo, la fecha de inicio y la de fin.", "Envía la solicitud; tu jefatura o Recursos Humanos la revisará."]),
          p("Puedes ver tu saldo disponible y las solicitudes en trámite."),
        ].join(""),
      },
      {
        id: "boleta",
        title: "Mi boleta",
        html: [
          p("Muestra tu boleta del mes: sueldo, asignación familiar, AFP u ONP, descuentos y el neto a pagar. En julio y diciembre incluye gratificación; en mayo y noviembre, CTS."),
        ].join(""),
      },
      {
        id: "documentos",
        title: "Documentos",
        html: [p("Aquí encuentras tu contrato y otros documentos que Recursos Humanos ponga a tu disposición.")].join(""),
      },
      {
        id: "seguridad",
        title: "Tu seguridad",
        html: [
          ul(["No compartas tu PIN con nadie.", "Cambia tu PIN si crees que alguien lo vio.", "Cierra sesión al terminar."]),
        ].join(""),
      },
    ],
  },
];

// ── Plantilla HTML ───────────────────────────────────────────────────────────

function renderHtml(m) {
  const introBlocks = Object.values(COMMON_INTRO).join("");
  const index = m.sections.map((s, i) => `<li><span class="num">${i + 1}</span> ${s.title}</li>`).join("");
  const body = m.sections
    .map(
      (s, i) =>
        `<section class="chapter">` +
        `<div class="chap-head"><span class="chap-num">${i + 1}</span><h2 class="chap-title">${s.title}</h2></div>` +
        s.html +
        `</section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Manual de uso — ${m.role} — Moasist</title>
<style>
  :root { --brand: ${m.color}; --brand-dark: ${BRAND_DARK}; --ink:#0f172a; --muted:#475569; --line:#e2e8f0; }
  * { box-sizing: border-box; }
  @page { size: A4; margin: 16mm 15mm 18mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: var(--ink); font-size: 11.5pt; line-height: 1.55; margin:0; }
  h1,h2,h3 { font-weight: 700; line-height: 1.2; }
  h2 { font-size: 15pt; margin: 0 0 6px; }
  h3 { font-size: 12.5pt; margin: 16px 0 4px; color: var(--brand-dark); }
  p { margin: 6px 0; }
  ul, ol { margin: 6px 0 6px 4px; padding-left: 20px; }
  li { margin: 3px 0; }
  strong { color: var(--ink); }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10.5pt; }
  th { background: color-mix(in srgb, var(--brand) 14%, white); text-align: left; }
  th, td { border: 1px solid var(--line); padding: 6px 9px; vertical-align: top; }
  .box { border-radius: 8px; padding: 10px 12px 10px 12px; margin: 12px 0; font-size: 10.5pt; border: 1px solid var(--line); background:#f8fafc; }
  .box .tag { display:block; font-size: 8.5pt; font-weight:700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; color: var(--brand-dark); }
  .box.tip { background: color-mix(in srgb, var(--brand) 7%, white); border-color: color-mix(in srgb, var(--brand) 30%, white); }
  .box.warn { background: #fff7ed; border-color:#fdba74; }
  .box.warn .tag { color:#b45309; }
  .box.info { background:#eff6ff; border-color:#bfdbfe; }
  .box.info .tag { color:#1d4ed8; }
  .cover { display:flex; flex-direction:column; justify-content:space-between; height: 250mm; }
  .cover .brandline { display:flex; align-items:center; gap:10px; }
  .logo { width: 40px; height: 40px; border-radius: 10px; background: var(--brand); color:#fff; display:grid; place-items:center; font-weight:800; font-size:18px; }
  .brandname { font-size: 20pt; font-weight: 800; letter-spacing:-.02em; }
  .cover .role { margin-top: 40mm; }
  .cover .kicker { text-transform: uppercase; letter-spacing:.14em; font-size: 10pt; color: var(--brand); font-weight:700; }
  .cover h1 { font-size: 30pt; margin: 8px 0 6px; letter-spacing:-.02em; }
  .cover .tagline { font-size: 14pt; color: var(--muted); }
  .cover .foot { font-size: 9.5pt; color: var(--muted); border-top:1px solid var(--line); padding-top:8px; }
  .toc { page-break-before: always; }
  .toc h2 { border-bottom: 3px solid var(--brand); display:inline-block; padding-bottom:4px; }
  .toc ol { list-style:none; padding:0; margin-top:12px; counter-reset: n; }
  .toc li { display:flex; gap:10px; align-items:baseline; padding:6px 0; border-bottom:1px dashed var(--line); font-size: 12pt; }
  .toc .num { display:inline-grid; place-items:center; min-width:22px; height:22px; border-radius:6px; background: var(--brand); color:#fff; font-size:10pt; font-weight:700; }
  .chapter { page-break-before: always; }
  .chap-head { display:flex; align-items:center; gap:10px; border-bottom: 2px solid var(--brand); padding-bottom:6px; margin-bottom:10px; }
  .chap-num { display:inline-grid; place-items:center; min-width:26px; height:26px; border-radius:7px; background: var(--brand); color:#fff; font-weight:800; font-size:12pt; }
  .chap-title { border:0; margin:0; }
  .docfoot { text-align:center; font-size:9pt; color:var(--muted); margin-top:10px; }
</style>
</head>
<body>
  <section class="cover">
    <div class="brandline"><div class="logo">M</div><div class="brandname">Moasist</div></div>
    <div class="role">
      <div class="kicker">Manual de uso</div>
      <h1>${m.role}</h1>
      <div class="tagline">${m.tagline}</div>
    </div>
    <div class="foot">
      Moasist · Control de Asistencia y Planillas<br/>
      Documento para ${m.role}. Versión 1.0 · Referencia normativa 2026 (RMV, UIT, AFP).
    </div>
  </section>

  <section class="toc">
    <h2>Contenido</h2>
    <ol>${index}</ol>
    <div class="box info" style="margin-top:18px">${m.intro}</div>
  </section>

  <section class="chapter">
    ${introBlocks}
  </section>

  ${body}

  <section class="chapter">
    <div class="chap-head"><span class="chap-num">✓</span><h2 class="chap-title">Contacto y soporte</h2></div>
    <p>Ante cualquier duda sobre el uso de Moasist, comunícate con el administrador del sistema de tu empresa.</p>
    <p class="docfoot">Moasist v1.0 · Sistema Integral de Gestión de Asistencia y Planillas · Documento generado automáticamente.</p>
  </section>
</body>
</html>`;
}

// ── Conversión a PDF ─────────────────────────────────────────────────────────

function findChrome() {
  const candidates = [process.env.CHROME_PATH, "chromium", "chromium-browser", "google-chrome", "google-chrome-stable"].filter(Boolean);
  for (const c of candidates) {
    try {
      execFileSync(c, ["--version"], { stdio: "ignore" });
      return c;
    } catch {
      /* sigue con el próximo */
    }
  }
  throw new Error("No se encontró Chromium/Chrome. Define CHROME_PATH.");
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const chrome = findChrome();
  console.log(`[manual] Chromium: ${chrome}`);

  for (const m of MANUALS) {
    const htmlPath = resolve(OUT, `${m.file}.html`);
    const pdfPath = resolve(OUT, `${m.file}.pdf`);
    writeFileSync(htmlPath, renderHtml(m), "utf8");
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        "--print-to-pdf-no-header",
        `--print-to-pdf=${pdfPath}`,
        `file://${htmlPath}`,
      ],
      { stdio: "ignore" },
    );
    console.log(`[manual] Generado: public/manuales/${m.file}.pdf`);
  }

  console.log("[manual] Listo.");
}

main();
