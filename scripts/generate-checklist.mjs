/**
 * Genera el "Checklist de puesta en marcha" de Moasist en PDF (una hoja A4).
 *
 *   node scripts/generate-checklist.mjs
 *
 * Escribe el HTML y el PDF en public/manuales/. Requiere Chromium/Chrome en el PATH
 * (o la variable CHROME_PATH). No necesita red ni dependencias nuevas.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/manuales");
const BRAND = "#0284c7";

const box = (t) => `<span class="cb">&#9744;</span> ${t}`;
const steps = (items) => `<ol class="steps">${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;

const VARIABLES = [
  ["DATABASE_URL", "Sí", "Cadena <b>Pooled</b> de Neon (empieza con postgresql:// y contiene -pooler)"],
  ["MOASIST_ADMIN_PASSWORD", "Recomendada", "Contraseña inicial del administrador (mín. 10, con mayúscula, minúscula y número)"],
  ["MOASIST_ADMIN_LOGIN", "Opcional", "Correo del administrador (si se deja vacío usa el de INMOA)"],
  ["MOASIST_LOG_CREDENTIALS", "Opcional", "Poner <b>false</b> en producción: no imprime PIN ni contraseñas en los registros"],
  ["RUC_API_ENDPOINT", "Opcional", "Servicio para consultar el RUC en SUNAT al crear una empresa"],
  ["RUC_API_TOKEN", "Opcional", "Token de ese servicio de consulta de RUC"],
];

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Checklist de puesta en marcha — Moasist</title>
<style>
  :root { --brand:${BRAND}; --ink:#0f172a; --muted:#475569; --line:#cbd5e1; }
  * { box-sizing:border-box; }
  @page { size:A4; margin:12mm 12mm 12mm; }
  html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { font-family:"Segoe UI",Roboto,Arial,sans-serif; color:var(--ink); font-size:9.3pt; line-height:1.3; margin:0; }
  header { display:flex; align-items:center; gap:10px; border-bottom:3px solid var(--brand); padding-bottom:8px; margin-bottom:10px; }
  .logo { width:34px; height:34px; border-radius:9px; background:var(--brand); color:#fff; display:grid; place-items:center; font-weight:800; font-size:16px; }
  h1 { font-size:15pt; margin:0; letter-spacing:-.01em; }
  .sub { color:var(--muted); font-size:9.5pt; }
  h2 { font-size:10.5pt; margin:8px 0 3px; color:#075985; display:flex; align-items:center; gap:7px; }
  h2 .n { display:inline-grid; place-items:center; min-width:19px; height:19px; border-radius:5px; background:var(--brand); color:#fff; font-size:9pt; font-weight:700; }
  .steps { margin:4px 0 4px 4px; padding-left:18px; }
  .steps li { margin:1.5px 0; }
  .cb { font-size:12pt; line-height:1; }
  table { width:100%; border-collapse:collapse; margin:3px 0; font-size:8.8pt; }
  th { background:#e0f2fe; text-align:left; }
  th,td { border:1px solid var(--line); padding:2.5px 6px; vertical-align:top; }
  .box { border-radius:7px; padding:5px 9px; margin:6px 0; font-size:8.8pt; border:1px solid var(--line); }
  .warn { background:#fff7ed; border-color:#fdba74; }
  .safe { background:#eff6ff; border-color:#bfdbfe; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:0 18px; }
  .foot { margin-top:10px; border-top:1px solid var(--line); padding-top:6px; font-size:8.5pt; color:var(--muted); display:flex; justify-content:space-between; }
  .chk { display:block; margin:2.5px 0; }
</style>
</head>
<body>
  <header>
    <div class="logo">M</div>
    <div>
      <h1>Checklist de puesta en marcha — Moasist</h1>
      <div class="sub">Deja la base de datos conectada y la app lista para usar · 10–15 minutos</div>
    </div>
  </header>

  <h2><span class="n">1</span> Antes de empezar (ten a mano)</h2>
  <div class="grid">
    <div>
      <span class="chk">${box("Cuenta en <b>Neon</b> (neon.tech) — gratis")}</span>
      <span class="chk">${box("Cuenta en <b>Vercel</b> con el proyecto <b>MOASISIT</b>")}</span>
    </div>
    <div>
      <span class="chk">${box("Correo del administrador")}</span>
      <span class="chk">${box("Contraseña de administrador (mín. 10 caracteres)")}</span>
    </div>
  </div>

  <h2><span class="n">2</span> Crear la base de datos en Neon</h2>
  ${steps([
    box("Entrar a <b>neon.tech</b> y crear el proyecto (nombre sugerido: <i>moasist-prod</i>)."),
    box("Región cercana a Perú: <b>AWS US East (N. Virginia)</b> o <b>US West (Oregon)</b>."),
    box("Abrir <b>Connect</b> y elegir <b>Pooled connection</b> (la cadena debe contener <b>-pooler</b>)."),
    box("Pulsar <b>Copy</b> y guardar la cadena en un bloc de notas temporal. <b>No</b> la compartas."),
  ])}

  <h2><span class="n">3</span> Pegar las variables en Vercel</h2>
  ${steps([
    box("Vercel → proyecto <b>MOASISIT</b> → <b>Settings → Environment Variables</b>."),
    box("Agregar cada variable de la tabla, marcando <b>Production</b>, <b>Preview</b> y <b>Development</b>."),
  ])}
  <table>
    <thead><tr><th style="width:34%">Variable</th><th style="width:14%">¿Obligatoria?</th><th>Valor / para qué</th></tr></thead>
    <tbody>
      ${VARIABLES.map((v) => `<tr><td>${box(`<b>${v[0]}</b>`)}</td><td>${v[1]}</td><td>${v[2]}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2><span class="n">4</span> Redesplegar</h2>
  ${steps([
    box("Vercel → <b>Deployments</b> → en el último despliegue, menú <b>⋯</b> → <b>Redeploy</b>."),
    box("Desmarcar <i>Use existing build cache</i> si aparece, y confirmar."),
    box("Esperar hasta que el estado sea <b>Ready</b> (verde). Si queda <b>Error</b>, copiar el mensaje y avisar."),
  ])}

  <h2><span class="n">5</span> Prueba final de persistencia</h2>
  ${steps([
    box("Abrir <b>https://moasisit.vercel.app</b> e ingresar como <b>Administración</b>."),
    box("Cambiar la contraseña cuando el sistema lo pida (primer ingreso)."),
    box("Crear una empresa o una persona de prueba."),
    box("Esperar 1 minuto, recargar y volver a entrar."),
    box("Si los datos <b>siguen ahí</b>, la base quedó conectada correctamente. &#10003;"),
  ])}

  <div class="box warn">
    <b>Seguridad — recuerda:</b> la cadena de conexión y la contraseña son <b>secretos</b>.
    Solo van en Vercel (Environment Variables). Nunca en el chat, en capturas, ni en el repositorio.
    Recomendado en producción: <b>MOASIST_LOG_CREDENTIALS = false</b>.
  </div>

  <div class="box safe">
    <b>Si algo falla:</b> <i>password authentication failed</i> → copiar de nuevo la cadena completa ·
    <i>ENOTFOUND / timeout</i> → usar la cadena con <b>-pooler</b> y borrar espacios al inicio/final ·
    <i>channel binding</i> → borrar <b>&amp;channel_binding=require</b> del final de la cadena ·
    <i>el build no encuentra DATABASE_URL</i> → marcar los 3 entornos y hacer Redeploy.
  </div>

  <div class="foot">
    <span>Moasist · Control de Asistencia y Planillas</span>
    <span>Versión 1.0 · Referencia 2026 (RMV, UIT, AFP)</span>
  </div>
</body>
</html>`;

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

mkdirSync(OUT, { recursive: true });
const htmlPath = resolve(OUT, "checklist-configuracion.html");
const pdfPath = resolve(OUT, "checklist-configuracion.pdf");
writeFileSync(htmlPath, html, "utf8");
const chrome = findChrome();
execFileSync(
  chrome,
  ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer", "--print-to-pdf-no-header", `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`],
  { stdio: "ignore" },
);
console.log(`[checklist] Generado: public/manuales/checklist-configuracion.pdf (Chromium: ${chrome})`);
