/**
 * Catálogo de los archivos de importación del Anexo 3 de SUNAT: T-Registro y
 * PLAME (Planilla Mensual). Reproduce el detalle de la versión JUL23 del
 * "Anexo 3: Estructuras de los archivos de importación de T-Registro y de la
 * Planilla Mensual" (SUNAT).
 *
 * Cada estructura describe un archivo de texto plano: los campos van en el
 * orden indicado y separados por el carácter "|" (el nombre y la extensión del
 * archivo son obligatorios para que SUNAT lo acepte). Los importes se escriben
 * sin comas y, si llevan decimales, con punto y hasta dos decimales.
 */

/** Dónde se sube cada archivo. */
export type ImportDestination = "T-Registro" | "PLAME" | "Derechohabientes";

/** Un campo del archivo, en el orden en que debe ir. */
export type ImportField = {
  /** Posición del campo (1, 2, 3…). */
  n: number;
  name: string;
  type: "Texto" | "Numérico" | "Fecha" | "Alfanumérico";
  /** Longitud máxima (p. ej. "4", "7,2" = 7 enteros y 2 decimales). */
  length?: string;
  /** Observación o tabla de códigos aplicable. */
  note?: string;
};

/** Un archivo dentro de una estructura (algunas traen más de uno). */
export type ImportFile = {
  /** Nombre exigido por SUNAT (con # donde va el RUC o el período). */
  fileName: string;
  purpose?: string;
  fields: ImportField[];
};

export type ImportStructure = {
  /** Código de la estructura, p. ej. "E18". */
  id: string;
  /** Número de estructura del Anexo 3, p. ej. "18.0". */
  code: string;
  title: string;
  destination: ImportDestination;
  purpose: string;
  files: ImportFile[];
  notes?: string[];
};

const PIPE = "Los campos van separados por el carácter “|”.";

export const IMPORT_STRUCTURES: ImportStructure[] = [
  {
    id: "E1",
    code: "1.0",
    title: "Establecimientos propios del empleador",
    destination: "T-Registro",
    purpose:
      "Identifica los establecimientos donde se desarrollan actividades de riesgo SCTR. Se elabora solo si el empleador respondió que sí desarrolla actividades de riesgo.",
    files: [
      {
        fileName: "RP_###########.esp",
        fields: [
          { n: 1, name: "Código de establecimiento", type: "Texto", length: "4", note: "Según el RUC. SUNAT valida que exista." },
          { n: 2, name: "Centro de riesgo", type: "Texto", length: "1", note: "0 = No es centro de riesgo; 1 = Es centro de riesgo." },
        ],
      },
    ],
    notes: [PIPE, "Se importa desde la opción Registro del Empleador del T-Registro."],
  },
  {
    id: "E2",
    code: "2.0",
    title: "Empleadores a quienes destaco o desplazo personal",
    destination: "T-Registro",
    purpose:
      "Registra a los empleadores a quienes se destaca o desplaza personal y el servicio prestado.",
    files: [
      {
        fileName: "RP_###########.edd",
        purpose: "Empleador y servicio prestado.",
        fields: [
          { n: 1, name: "RUC del empleador a quien destaco o desplazo", type: "Texto", length: "11", note: "Solo si el empleador es domiciliado." },
          { n: 2, name: "Servicio prestado", type: "Texto", length: "6", note: "Ver tabla 1." },
          { n: 3, name: "Fecha de inicio de la prestación", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 4, name: "Fecha de fin de la prestación", type: "Fecha", note: "dd/mm/aaaa." },
        ],
      },
      {
        fileName: "RP_###########.ldd",
        purpose: "Establecimiento de destino e indicador de riesgo SCTR.",
        fields: [
          { n: 1, name: "RUC del empleador a quien destaco o desplazo", type: "Texto", length: "11", note: "Solo empleador domiciliado." },
          { n: 2, name: "Código del establecimiento de destino", type: "Texto", length: "4" },
          { n: 3, name: "Indicador de actividad de riesgo SCTR", type: "Texto", length: "1", note: "0 = No realizará actividad de riesgo; 1 = Sí." },
        ],
      },
    ],
    notes: [
      PIPE,
      "Primero se importa el archivo de empleadores (.edd) y luego el de establecimientos (.ldd).",
    ],
  },
  {
    id: "E3",
    code: "3.0",
    title: "Empleadores que me destacan o desplazan personal",
    destination: "T-Registro",
    purpose:
      "Registra a los empleadores que destacan o desplazan personal hacia la empresa, y el servicio recibido.",
    files: [
      {
        fileName: "RP_###########.med",
        fields: [
          { n: 1, name: "RUC del empleador que me destaca o desplaza", type: "Texto", length: "11", note: "Debe existir en el padrón RUC." },
          { n: 2, name: "Servicio recibido", type: "Texto", length: "6", note: "Ver tabla 1." },
          { n: 3, name: "Fecha de inicio de la prestación", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 4, name: "Fecha de fin de la prestación", type: "Fecha", note: "dd/mm/aaaa." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E4",
    code: "4.0",
    title: "Datos personales (trabajador, pensionista, personal en formación y de terceros)",
    destination: "T-Registro",
    purpose:
      "Datos personales de trabajadores, pensionistas, personal en formación y personal de terceros.",
    files: [
      {
        fileName: "RP_###########.ide",
        fields: [
          { n: 1, name: "Tipo de documento (TD)", type: "Texto", length: "2", note: "Ver tabla 3. Obligatorio." },
          { n: 2, name: "N° de documento", type: "Texto", length: "15", note: "Obligatorio." },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 (Pasaporte) y 24." },
          { n: 4, name: "Fecha de nacimiento", type: "Fecha", note: "dd/mm/aaaa. Obligatorio." },
          { n: 5, name: "Apellido paterno", type: "Texto", length: "40" },
          { n: 6, name: "Apellido materno", type: "Texto", length: "40" },
          { n: 7, name: "Nombres", type: "Texto", length: "40" },
          { n: 8, name: "Sexo", type: "Texto", length: "1", note: "1: masculino / 2: femenino. Obligatorio." },
          { n: 9, name: "Nacionalidad", type: "Texto", length: "4", note: "Ver tabla 4." },
          { n: 10, name: "Teléfono - código de larga distancia nacional", type: "Texto", length: "3", note: "No vigente desde 01/03/2018." },
          { n: 11, name: "Teléfono - número (celular)", type: "Texto", length: "9", note: "Obligatorio para altas desde el 01/03/2018." },
          { n: 12, name: "Correo electrónico", type: "Texto", length: "50", note: "Obligatorio para altas desde el 01/03/2018." },
          { n: 13, name: "Dirección 1 - Tipo de vía", type: "Texto", length: "2", note: "Ver tabla 5." },
          { n: 14, name: "Dirección 1 - Nombre de vía", type: "Texto", length: "20" },
          { n: 15, name: "Dirección 1 - Número de vía", type: "Texto", length: "4" },
          { n: 16, name: "Dirección 1 - Departamento", type: "Texto", length: "4" },
          { n: 17, name: "Dirección 1 - Interior", type: "Texto", length: "4" },
          { n: 18, name: "Dirección 1 - Manzana", type: "Texto", length: "4" },
          { n: 19, name: "Dirección 1 - Lote", type: "Texto", length: "4" },
          { n: 20, name: "Dirección 1 - Kilómetro", type: "Texto", length: "4" },
          { n: 21, name: "Dirección 1 - Block", type: "Texto", length: "4" },
          { n: 22, name: "Dirección 1 - Etapa", type: "Texto", length: "4" },
          { n: 23, name: "Dirección 1 - Tipo de zona", type: "Texto", length: "2", note: "Ver tabla 6." },
          { n: 24, name: "Dirección 1 - Nombre de zona", type: "Texto", length: "20" },
          { n: 25, name: "Dirección 1 - Referencia", type: "Texto", length: "40" },
          { n: 26, name: "Dirección 1 - UBIGEO", type: "Texto", length: "6", note: "Ver tabla 28." },
          { n: 27, name: "Dirección 2 - Tipo de vía", type: "Texto", length: "2", note: "Opcional." },
          { n: 28, name: "Dirección 2 - Nombre de vía", type: "Texto", length: "20" },
          { n: 29, name: "Dirección 2 - Número de vía", type: "Texto", length: "4" },
          { n: 30, name: "Dirección 2 - Departamento", type: "Texto", length: "4" },
          { n: 31, name: "Dirección 2 - Interior", type: "Texto", length: "4" },
          { n: 32, name: "Dirección 2 - Manzana", type: "Texto", length: "4" },
          { n: 33, name: "Dirección 2 - Lote", type: "Texto", length: "4" },
          { n: 34, name: "Dirección 2 - Kilómetro", type: "Texto", length: "4" },
          { n: 35, name: "Dirección 2 - Block", type: "Texto", length: "4" },
          { n: 36, name: "Dirección 2 - Etapa", type: "Texto", length: "4" },
          { n: 37, name: "Dirección 2 - Tipo de zona", type: "Texto", length: "2", note: "Ver tabla 6." },
          { n: 38, name: "Dirección 2 - Nombre de zona", type: "Texto", length: "20" },
          { n: 39, name: "Dirección 2 - Referencia", type: "Texto", length: "40" },
          { n: 40, name: "Dirección 2 - UBIGEO", type: "Texto", length: "6", note: "Ver tabla 28." },
          { n: 41, name: "Indicador Centro Asistencial EsSalud", type: "Texto", length: "1", note: "Solo asegurados a EsSalud con 2 direcciones: 1 o 2." },
        ],
      },
    ],
    notes: [
      PIPE,
      "Con DNI, los apellidos y nombres, sexo y primera dirección se contrastan con RENIEC.",
    ],
  },
  {
    id: "E5",
    code: "5.0",
    title: "Datos del trabajador",
    destination: "T-Registro",
    purpose: "Alta y datos del trabajador (incluye prestadores de servicios del D.S. 018-2007-TR).",
    files: [
      {
        fileName: "RP_###########.tra",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador (TD)", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "N° de documento del trabajador", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "Régimen laboral", type: "Texto", length: "2", note: "Ver tabla 33." },
          { n: 5, name: "Situación educativa", type: "Texto", length: "2", note: "Ver tabla 9. No aplica a TT 23, 66 y 71." },
          { n: 6, name: "Ocupación", type: "Texto", length: "6", note: "Ver tablas 10 / 30." },
          { n: 7, name: "Discapacidad", type: "Texto", length: "1", note: "1: Sí / 0: No. No aplica al TT 66." },
          { n: 8, name: "CUSPP", type: "Texto", length: "12", note: "Solo afiliados a AFP." },
          { n: 9, name: "SCTR Pensión", type: "Texto", length: "1", note: "0: Ninguno / 1: ONP / 2: Cía privada." },
          { n: 10, name: "Tipo de contrato / condición laboral", type: "Texto", length: "2", note: "Ver tabla 12." },
          { n: 11, name: "Régimen alternativo de jornada", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 12, name: "Sujeto a jornada máxima", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 13, name: "Sujeto a horario nocturno", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 14, name: "Es sindicalizado", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 15, name: "Periodicidad de la remuneración", type: "Texto", length: "1", note: "Ver tabla 13." },
          { n: 16, name: "Remuneración básica inicial (D.Leg. 728)", type: "Numérico", length: "7,2" },
          { n: 17, name: "Situación", type: "Texto", length: "2", note: "Ver tabla 15." },
          { n: 18, name: "Rentas de 5ta exoneradas (inciso e, Art. 19 LIR)", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 19, name: "Situación especial del trabajador", type: "Texto", length: "1", note: "Ver tabla 35." },
          { n: 20, name: "Tipo de pago", type: "Texto", length: "1", note: "Ver tabla 16." },
          { n: 21, name: "Categoría ocupacional", type: "Texto", length: "2", note: "Ver tabla 24." },
          { n: 22, name: "Convenio para evitar la doble tributación", type: "Texto", length: "1", note: "Ver tabla 25." },
          { n: 23, name: "N° de RUC", type: "Texto", length: "11", note: "Solo para CAS (TT 67)." },
        ],
      },
    ],
    notes: [PIPE, "Los datos numéricos van sin comas; con decimales, punto y hasta dos dígitos."],
  },
  {
    id: "E6",
    code: "6.0",
    title: "Datos del pensionista",
    destination: "T-Registro",
    purpose:
      "Alta del pensionista que recibe pensión y es asegurado regular al régimen contributivo de EsSalud.",
    files: [
      {
        fileName: "RP_###########.pen",
        fields: [
          { n: 1, name: "Tipo de documento del pensionista (TD)", type: "Texto", length: "2", note: "Solo 01 (DNI), 04 y 07." },
          { n: 2, name: "N° de documento del pensionista", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Solo para TD 07." },
          { n: 4, name: "Tipo de pensionista", type: "Texto", length: "2", note: "Ver tabla 8. Solo tipos 24 y 26." },
          { n: 5, name: "Régimen pensionario", type: "Texto", length: "2", note: "Ver tabla 11." },
          { n: 6, name: "CUSPP", type: "Texto", length: "12", note: "Solo AFP. Opcional." },
          { n: 7, name: "Tipo de pago", type: "Texto", length: "1", note: "Ver tabla 16." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E7",
    code: "7.0",
    title: "Prestador de servicios con rentas de 4ta categoría",
    destination: "PLAME",
    purpose: "Datos del prestador de servicios con rentas de cuarta categoría (D.S. 018-2007-TR).",
    files: [
      {
        fileName: "ffffaaaamm###########.ps4",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del prestador", type: "Texto", length: "2", note: "Ver tabla 3. Si es domiciliado, tipo 06 (RUC)." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15", note: "Para RUC, máximo 11 dígitos." },
          { n: 3, name: "Apellido paterno", type: "Texto", length: "40" },
          { n: 4, name: "Apellido materno", type: "Texto", length: "40" },
          { n: 5, name: "Nombres", type: "Texto", length: "40" },
          { n: 6, name: "Domiciliado", type: "Texto", length: "1", note: "1: Domiciliado / 2: No domiciliado." },
          { n: 7, name: "Convenio para evitar la doble tributación", type: "Texto", length: "1", note: "Ver tabla 25." },
        ],
      },
    ],
    notes: [PIPE, "No aplica el tipo de documento Partida de Nacimiento (11)."],
  },
  {
    id: "E9",
    code: "9.0",
    title: "Datos del personal en formación (modalidad formativa laboral y otros)",
    destination: "T-Registro",
    purpose: "Alta del personal en formación - modalidad formativa laboral y otros.",
    files: [
      {
        fileName: "RP_###########.pfl",
        fields: [
          { n: 1, name: "Tipo de documento", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "N° de documento", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "Tipo de modalidad formativa laboral", type: "Texto", length: "2", note: "Ver tabla 18." },
          { n: 5, name: "Seguro médico", type: "Texto", length: "1", note: "1: EsSalud / 2: Seguro privado." },
          { n: 6, name: "Situación educativa", type: "Texto", length: "2", note: "Ver tabla 9." },
          { n: 7, name: "Ocupación", type: "Texto", length: "6", note: "Ver tabla 10." },
          { n: 8, name: "Madre con responsabilidad familiar", type: "Texto", length: "1", note: "Solo sexo femenino. 1: Sí / 0: No." },
          { n: 9, name: "Discapacidad", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 10, name: "Tipo de centro de formación", type: "Texto", length: "1", note: "1: Centro educativo / 2: Universidad / 3: Instituto / 4: Otros." },
          { n: 11, name: "Sujeto a horario nocturno", type: "Texto", length: "1", note: "1: Sí / 0: No." },
        ],
      },
    ],
    notes: [PIPE, "Los campos 5, 7, 8, 9, 10 y 11 no aplican a la modalidad SECIGRA."],
  },
  {
    id: "E10",
    code: "10.0",
    title: "Datos del personal de terceros",
    destination: "T-Registro",
    purpose:
      "Alta del personal destacado o desplazado de terceros, cuando el declarante asume el pago del SCTR.",
    files: [
      {
        fileName: "RP_###########.ter",
        fields: [
          { n: 1, name: "Tipo de documento", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "N° de documento", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "RUC del empleador que me destaca/desplaza", type: "Texto", length: "11", note: "Debe estar habilitado en la estructura 3." },
          { n: 5, name: "SCTR Pensión", type: "Texto", length: "1", note: "1: ONP / 2: Seguro privado." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E11",
    code: "11.0",
    title: "Datos de períodos",
    destination: "T-Registro",
    purpose: "Periodicidad: vínculo, tipo de trabajador, régimen de salud, régimen pensionario y SCTR salud.",
    files: [
      {
        fileName: "RP_###########.per",
        fields: [
          { n: 1, name: "Tipo de documento", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "N° de documento", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "Categoría", type: "Texto", length: "1", note: "1: Trabajador; 2: Pensionista; 4: Personal de terceros; 5: Personal en formación." },
          { n: 5, name: "Tipo de registro", type: "Texto", length: "1", note: "1: Período; 2: Tipo de trabajador; 3: Régimen de salud; 4: Régimen pensionario; 5: SCTR salud." },
          { n: 6, name: "Fecha de inicio o reinicio", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 7, name: "Fecha de fin", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 8, name: "Indicador de alta o baja", type: "Texto", length: "2", note: "Ver tablas 17, 8, 32, 11. SCTR salud: 1 EsSalud / 2 EPS." },
          { n: 9, name: "EPS / Servicios propios", type: "Texto", length: "1", note: "Se registra la EPS para régimen de salud tipo 01 y 03. Ver tabla 14." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E12",
    code: "12.0",
    title: "Trabajador - Otras rentas de 5ta categoría",
    destination: "PLAME",
    purpose:
      "Rentas de quinta categoría percibidas de otros empleadores (del período y de la regularización del ejercicio anterior).",
    files: [
      {
        fileName: "ffffaaaamm###########.or5",
        purpose: "Rentas del período percibidas de otros empleadores.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "RUC del otro empleador", type: "Texto", length: "11" },
          { n: 4, name: "Monto de la renta de 5ta percibida", type: "Numérico", length: "7,2" },
        ],
      },
      {
        fileName: "ffffaaaamm###########.REG",
        purpose: "Regularización de rentas de 5ta del ejercicio anterior (enero y febrero).",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Solo tipos 01, 04, 07 y 09." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "RUC del otro empleador", type: "Texto", length: "11" },
          { n: 4, name: "Monto de la renta de 5ta del ejercicio anterior", type: "Numérico", length: "7,2" },
        ],
      },
    ],
    notes: [
      PIPE,
      "De usarse el archivo .REG, debe informarse también la casilla 621 (puede ser cero).",
    ],
  },
  {
    id: "E13",
    code: "13.0",
    title: "Datos de derechohabientes - ALTAS",
    destination: "Derechohabientes",
    purpose: "Alta de derechohabientes de trabajadores y pensionistas.",
    files: [
      {
        fileName: "RD_RRRRRRRRRRR_DDMMAAAA_ALTA.TXT",
        purpose: "RRRRRRRRRRR = RUC del empleador · DDMMAAAA = fecha de remisión por SOL.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador/pensionista", type: "Texto", length: "2", note: "Solo 01, 04 y 07." },
          { n: 2, name: "Número de documento del trabajador/pensionista", type: "Texto", length: "15" },
          { n: 3, name: "Tipo de documento del derechohabiente", type: "Texto", length: "2", note: "Solo 01, 04 y 07." },
          { n: 4, name: "Número de documento del derechohabiente", type: "Texto", length: "15" },
          { n: 5, name: "País emisor del documento", type: "Texto", length: "3", note: "Ver tabla 26." },
          { n: 6, name: "Fecha de nacimiento", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 7, name: "Apellido paterno del derechohabiente", type: "Texto", length: "40" },
          { n: 8, name: "Apellido materno del derechohabiente", type: "Texto", length: "40" },
          { n: 9, name: "Nombres del derechohabiente", type: "Texto", length: "40" },
          { n: 10, name: "Sexo", type: "Texto", length: "1", note: "1: Masculino / 2: Femenino." },
          { n: 11, name: "Vínculo familiar", type: "Texto", length: "2", note: "Ver tabla 19." },
          { n: 12, name: "Tipo de documento que acredita el vínculo", type: "Texto", length: "2", note: "Ver tabla 27." },
          { n: 13, name: "N° de documento que acredita el vínculo", type: "Texto", length: "20", note: "Obligatorio para concubino(a) e hijo incapacitado." },
          { n: 14, name: "Mes de concepción", type: "Texto", length: "6", note: "Solo gestante. Formato mmaaaa." },
          { n: 15, name: "Dirección 1 - Tipo de vía", type: "Texto", length: "2", note: "Ver tabla 5." },
          { n: 16, name: "Dirección 1 - Nombre de vía", type: "Texto", length: "20" },
          { n: 17, name: "Dirección 1 - Número de vía", type: "Texto", length: "4" },
          { n: 18, name: "Dirección 1 - Departamento", type: "Texto", length: "4" },
          { n: 19, name: "Dirección 1 - Interior", type: "Texto", length: "4" },
          { n: 20, name: "Dirección 1 - Manzana", type: "Texto", length: "4" },
          { n: 21, name: "Dirección 1 - Lote", type: "Texto", length: "4" },
          { n: 22, name: "Dirección 1 - Kilómetro", type: "Texto", length: "4" },
          { n: 23, name: "Dirección 1 - Block", type: "Texto", length: "4" },
          { n: 24, name: "Dirección 1 - Etapa", type: "Texto", length: "4" },
          { n: 25, name: "Dirección 1 - Tipo de zona", type: "Texto", length: "2", note: "Ver tabla 6." },
          { n: 26, name: "Dirección 1 - Nombre de zona", type: "Texto", length: "20" },
          { n: 27, name: "Dirección 1 - Referencia", type: "Texto", length: "40" },
          { n: 28, name: "Dirección 1 - UBIGEO", type: "Texto", length: "6", note: "Ver tabla 28." },
          { n: 29, name: "Dirección 2 - Tipo de vía", type: "Texto", length: "2", note: "Ver tabla 5." },
          { n: 30, name: "Dirección 2 - Nombre de vía", type: "Texto", length: "20" },
          { n: 31, name: "Dirección 2 - Número de vía", type: "Texto", length: "4" },
          { n: 32, name: "Dirección 2 - Departamento", type: "Texto", length: "4" },
          { n: 33, name: "Dirección 2 - Interior", type: "Texto", length: "4" },
          { n: 34, name: "Dirección 2 - Manzana", type: "Texto", length: "4" },
          { n: 35, name: "Dirección 2 - Lote", type: "Texto", length: "4" },
          { n: 36, name: "Dirección 2 - Kilómetro", type: "Texto", length: "4" },
          { n: 37, name: "Dirección 2 - Block", type: "Texto", length: "4" },
          { n: 38, name: "Dirección 2 - Etapa", type: "Texto", length: "4" },
          { n: 39, name: "Dirección 2 - Tipo de zona", type: "Texto", length: "2", note: "Ver tabla 6." },
          { n: 40, name: "Dirección 2 - Nombre de zona", type: "Texto", length: "20" },
          { n: 41, name: "Dirección 2 - Referencia", type: "Texto", length: "40" },
          { n: 42, name: "Dirección 2 - UBIGEO", type: "Texto", length: "6", note: "Ver tabla 28." },
          { n: 43, name: "Indicador Centro Asistencial EsSalud", type: "Texto", length: "1", note: "Con 2 direcciones: 1 o 2." },
          { n: 44, name: "Teléfono - código de ciudad", type: "Texto", length: "2", note: "Ver tabla 29." },
          { n: 45, name: "Teléfono - número", type: "Texto", length: "10" },
          { n: 46, name: "Correo electrónico", type: "Texto", length: "50", note: "Debe contener “@”." },
        ],
      },
    ],
    notes: [
      PIPE,
      "Las direcciones 15–28 solo se registran con Pasaporte, Carné de extranjería o DNI de menor de edad.",
    ],
  },
  {
    id: "E14",
    code: "14.0",
    title: "Trabajador - Datos de la jornada laboral",
    destination: "PLAME",
    purpose: "Horas ordinarias y en sobretiempo trabajadas por el trabajador.",
    files: [
      {
        fileName: "ffffaaaamm###########.jor",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Horas ordinarias trabajadas", type: "Numérico", length: "3", note: "Máximo 360." },
          { n: 4, name: "Minutos ordinarios trabajados", type: "Numérico", length: "2", note: "Máximo 59." },
          { n: 5, name: "Horas en sobretiempo trabajadas", type: "Numérico", length: "3", note: "Máximo 360." },
          { n: 6, name: "Minutos en sobretiempo trabajados", type: "Numérico", length: "2", note: "Máximo 59." },
        ],
      },
    ],
    notes: [PIPE, "No aplica a los tipos 66, 71, 88 y 98 de la tabla 8."],
  },
  {
    id: "E15",
    code: "15.0",
    title: "Trabajador - Días subsidiados y otros no laborados",
    destination: "PLAME",
    purpose: "Días subsidiados y otros días no laborados por tipo de suspensión de labores.",
    files: [
      {
        fileName: "ffffaaaamm###########.snl",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Tipo de suspensión de la relación laboral", type: "Texto", length: "2", note: "Ver tabla 21. Días subsidiados por EsSalud: tipos 21 y 22." },
          { n: 4, name: "Número de días de suspensión", type: "Numérico", length: "2", note: "Mínimo 0, máximo 31 según el período." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E17",
    code: "17.0",
    title: "Establecimientos donde labora el trabajador",
    destination: "T-Registro",
    purpose: "Establecimientos (propios o de terceros) donde el trabajador presta servicios.",
    files: [
      {
        fileName: "RP_###########.est",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "RUC propio o del empleador a quien destaco/desplazo", type: "Texto", length: "11" },
          { n: 5, name: "Código de establecimiento", type: "Texto", length: "4", note: "Propio o de tercero (debe existir en el RUC)." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E18",
    code: "18.0",
    title: "Trabajador - Detalle de ingresos, tributos y descuentos",
    destination: "PLAME",
    purpose: "Conceptos remunerativos y no remunerativos, tributos y descuentos del trabajador.",
    files: [
      {
        fileName: "ffffaaaamm###########.rem",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Código de concepto remunerativo y/o no remunerativo", type: "Numérico", length: "4", note: "Ver tabla 22. Excluye 0100, 0200, 0300, 0400, 0500, 0600, 0603, 0604, 0607, 0610, 0612, 0616, 0800, 0802, 0804, 0806 y 0808." },
          { n: 4, name: "Monto devengado", type: "Numérico", length: "7,2", note: "Obligatorio si hay monto pagado/descontado." },
          { n: 5, name: "Monto pagado / descontado", type: "Numérico", length: "7,2", note: "Obligatorio si hay monto devengado." },
        ],
      },
    ],
    notes: [PIPE, "Para los códigos de descuento (700s) solo se considera el monto pagado/descontado."],
  },
  {
    id: "E19",
    code: "19.0",
    title: "Pensionista - Detalle de ingresos, tributos y descuentos",
    destination: "PLAME",
    purpose: "Ingresos y demás conceptos del pensionista.",
    files: [
      {
        fileName: "ffffaaaamm###########.pen",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del pensionista", type: "Texto", length: "2", note: "Solo 01, 04 y 07." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Código de concepto o ingreso", type: "Numérico", length: "4", note: "Ver tabla 22 (con las exclusiones indicadas)." },
          { n: 4, name: "Monto devengado", type: "Numérico", length: "7,2" },
          { n: 5, name: "Monto pagado / descontado", type: "Numérico", length: "7,2" },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E20",
    code: "20.0",
    title: "Prestador de servicios 4ta categoría - Detalle de comprobantes",
    destination: "PLAME",
    purpose: "Comprobantes emitidos por prestadores de servicios con rentas de cuarta categoría.",
    files: [
      {
        fileName: "ffffaaaamm###########.4ta",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del prestador", type: "Texto", length: "2", note: "Si es domiciliado, tipo 06 (RUC)." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15", note: "Para RUC, máximo 11 dígitos." },
          { n: 3, name: "Tipo del comprobante emitido", type: "Texto", length: "1", note: "Ver tabla 23." },
          { n: 4, name: "Serie del comprobante", type: "Alfanumérico", length: "4", note: "Recibo por honorarios o nota de crédito." },
          { n: 5, name: "Número del comprobante", type: "Texto", length: "8", note: "Recibo por honorarios o nota de crédito." },
          { n: 6, name: "Monto total del servicio", type: "Numérico", length: "12,2" },
          { n: 7, name: "Fecha de emisión", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 8, name: "Fecha de pago", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 9, name: "Indicador de retención de 4ta categoría", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 10, name: "Indicador de retención a régimen pensionario", type: "Texto", length: "1", note: "1: ONP / 2: SPP / 3: Sin retención." },
          { n: 11, name: "Importe del aporte al régimen pensionario", type: "Numérico", length: "7,2", note: "Obligatorio solo si el campo 10 es 1 o 2." },
        ],
      },
    ],
    notes: [PIPE, "La fecha de pago debe ser mayor o igual a la de emisión y caer en el período."],
  },
  {
    id: "E21",
    code: "21.0",
    title: "Personal en formación - Monto pagado",
    destination: "PLAME",
    purpose: "Montos pagados al personal en formación - modalidad formativa laboral y otros.",
    files: [
      {
        fileName: "ffffaaaamm###########.for",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del personal en formación", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Monto pagado", type: "Numérico", length: "7,2" },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E22",
    code: "22.0",
    title: "Personal de terceros - SCTR EsSalud",
    destination: "PLAME",
    purpose: "Detalle del personal de terceros con SCTR-EsSalud.",
    files: [
      {
        fileName: "ffffaaaamm###########.pte",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del personal de terceros", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Tasa SCTR-EsSalud", type: "Numérico", length: "3,2", note: "De 0.00 a 100.00, solo si SCTR salud es 1 (EsSalud)." },
          { n: 4, name: "Base de cálculo SCTR-EsSalud", type: "Numérico", length: "7,2" },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E23",
    code: "23.0",
    title: "Lugar de formación / destaque del personal de terceros",
    destination: "T-Registro",
    purpose:
      "Establecimientos donde se forma el personal en formación y lugar de destaque del personal de terceros.",
    files: [
      {
        fileName: "RP_###########.lug",
        fields: [
          { n: 1, name: "Tipo de documento", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "Categoría", type: "Texto", length: "1", note: "4: Personal de terceros / 5: Personal en formación." },
          { n: 5, name: "Código de establecimiento (solo propios)", type: "Texto", length: "4" },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E24",
    code: "24.0",
    title: "Derechohabientes - BAJAS",
    destination: "Derechohabientes",
    purpose: "Baja de derechohabientes.",
    files: [
      {
        fileName: "RD_RRRRRRRRRRR_DDMMAAAA_BAJA.TXT",
        purpose: "RRRRRRRRRRR = RUC del empleador · DDMMAAAA = fecha de remisión por SOL.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador/pensionista", type: "Texto", length: "2", note: "Solo 01, 04 y 07." },
          { n: 2, name: "Número de documento del trabajador/pensionista", type: "Texto", length: "15" },
          { n: 3, name: "Tipo de documento del derechohabiente", type: "Texto", length: "2", note: "Solo 01, 04 y 07." },
          { n: 4, name: "Número de documento del derechohabiente", type: "Texto", length: "15" },
          { n: 5, name: "País emisor del documento", type: "Texto", length: "3", note: "Ver tabla 26." },
          { n: 6, name: "Fecha de nacimiento", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 7, name: "Apellido paterno del derechohabiente", type: "Texto", length: "40" },
          { n: 8, name: "Apellido materno del derechohabiente", type: "Texto", length: "40" },
          { n: 9, name: "Nombres del derechohabiente", type: "Texto", length: "40" },
          { n: 10, name: "Vínculo familiar", type: "Texto", length: "2", note: "Ver tabla 19." },
          { n: 11, name: "Fecha de baja", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 12, name: "Motivo de baja", type: "Texto", length: "2", note: "Ver tabla 20." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E25",
    code: "25.0",
    title: "Trabajador - Tasas SCTR-EsSalud y/o convenio IES",
    destination: "PLAME",
    purpose: "Tasas aplicables para el IES y el SCTR de cada trabajador.",
    files: [
      {
        fileName: "ffffaaaamm###########.tas",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Indicador: SCTR-EsSalud o Convenio IES", type: "Texto", length: "1", note: "1: SCTR-EsSalud / 2: Convenio IES." },
          { n: 4, name: "Tasa", type: "Numérico", length: "3,2", note: "De 0.00 a 100.00." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E26",
    code: "26.0",
    title: "Trabajador - Otras condiciones",
    destination: "PLAME",
    purpose: "Indicadores de otras condiciones del trabajador.",
    files: [
      {
        fileName: "ffffaaaamm###########.toc",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Indicador de aporte a Asegura tu Pensión", type: "Texto", length: "1", note: "0: No aporta. Derogado por R.S. 223-2017/SUNAT." },
          { n: 4, name: "Indicador de aporte a +Vida Seguro de Accidentes", type: "Texto", length: "1", note: "0: No aporta; 1: a cargo del trabajador; 2: a cargo del empleador." },
          { n: 5, name: "Indicador FDSA o retención Ley 29903", type: "Texto", length: "1", note: "Obligatorio para TT 56 (Artista) y 98." },
          { n: 6, name: "Domiciliado", type: "Texto", length: "1", note: "1: Domiciliado / 2: No domiciliado." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E27",
    code: "27.0",
    title: "Pensionista - Otras condiciones",
    destination: "PLAME",
    purpose: "Información adicional de los pensionistas.",
    files: [
      {
        fileName: "ffffaaaamm###########.poc",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del pensionista", type: "Texto", length: "2", note: "Solo 01, 04 y 07." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Indicador de aporte a +Vida Seguro de Accidentes", type: "Texto", length: "1", note: "1: Aporta / 0: No aporta." },
        ],
      },
    ],
    notes: [PIPE],
  },
  {
    id: "E28",
    code: "28.0",
    title: "Trabajador - Semanas contributivas (pesqueros REP)",
    destination: "PLAME",
    purpose: "Semanas contributivas de afiliados al Régimen Especial de Pensiones para trabajadores pesqueros (Ley 30003).",
    files: [
      {
        fileName: "ffffaaaamm###########.sec",
        purpose: "ffff = 0601 · aaaa = año · mm = mes · ########### = RUC de la empresa.",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "Número de documento", type: "Texto", length: "15" },
          { n: 3, name: "Número de semana", type: "Texto", length: "2", note: "Semana a informar en el período." },
          { n: 4, name: "Con actividad pesquera o relacionada", type: "Texto", length: "1", note: "1: Sí / 0: No." },
          { n: 5, name: "Cargo desempeñado en la semana", type: "Texto", length: "1", note: "1 Patrón · 2 Segundo patrón · 3 Motorista · 4 Segundo motorista · 5 Cocinero · 6 Tripulante · 7 Otra." },
        ],
      },
    ],
    notes: [PIPE, "Solo aplica al régimen 15 de la tabla 11 (Ley 30003)."],
  },
  {
    id: "E29",
    code: "29.0",
    title: "Datos de estudios concluidos",
    destination: "T-Registro",
    purpose: "Estudios concluidos del trabajador.",
    files: [
      {
        fileName: "RP_###########.edu",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador (TD)", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "N° de documento del trabajador", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "Formación superior completa", type: "Texto", length: "2", note: "Solo situación educativa 11 o 13." },
          { n: 5, name: "Educación completa en institución del Perú", type: "Texto", length: "1", note: "1: Sí / 0: No. Si es 0, los siguientes campos van vacíos." },
          { n: 6, name: "Código de la institución educativa", type: "Texto", length: "9", note: "Ver tabla 34." },
          { n: 7, name: "Código de la carrera", type: "Texto", length: "6", note: "Ver tabla 34." },
          { n: 8, name: "Año de egreso", type: "Texto", length: "4", note: "A partir de 1950." },
        ],
      },
    ],
    notes: [PIPE, "No aplica a los tipos de trabajador 23, 66, 71, 73, 88 y 98."],
  },
  {
    id: "E30",
    code: "30.0",
    title: "Datos de cuenta de abono de remuneraciones",
    destination: "T-Registro",
    purpose: "Entidad financiera y cuenta donde el empleador abona la remuneración.",
    files: [
      {
        fileName: "RP_###########.cta",
        fields: [
          { n: 1, name: "Tipo de documento del trabajador (TD)", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "N° de documento del trabajador", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "Código de la entidad del sistema financiero", type: "Texto", length: "3", note: "Ver tabla 36." },
          { n: 5, name: "Número de cuenta de abono", type: "Texto", length: "20", note: "Solo dato numérico." },
        ],
      },
    ],
    notes: [PIPE, "Obligatorio cuando el tipo de pago es “Depósito en cuenta”."],
  },
  {
    id: "E31",
    code: "31.0",
    title: "Afiliación a organización sindical de servidores públicos",
    destination: "T-Registro",
    purpose:
      "Afiliación de los trabajadores de una entidad pública a una organización sindical de servidores públicos (R.M. 170-2023-TR).",
    files: [
      {
        fileName: "RP_###########.aos",
        fields: [
          { n: 1, name: "Tipo de documento de identidad", type: "Texto", length: "2", note: "Ver tabla 3." },
          { n: 2, name: "N° de documento de identidad", type: "Texto", length: "15" },
          { n: 3, name: "País emisor del documento", type: "Texto", length: "3", note: "Obligatorio para TD 07 y 24." },
          { n: 4, name: "Categoría", type: "Texto", length: "1", note: "Solo 1: Trabajador." },
          { n: 5, name: "Código de la organización sindical", type: "Texto", length: "8", note: "Ver tabla 37." },
          { n: 6, name: "Fecha de afiliación", type: "Fecha", note: "dd/mm/aaaa." },
          { n: 7, name: "Fecha de desafiliación", type: "Fecha", note: "dd/mm/aaaa." },
        ],
      },
    ],
    notes: [PIPE],
  },
];

export const IMPORT_DESTINATIONS: ImportDestination[] = [
  "T-Registro",
  "PLAME",
  "Derechohabientes",
];

export const DESTINATION_HINT: Record<ImportDestination, string> = {
  "T-Registro": "Altas y datos del registro laboral. Se sube en el módulo T-Registro de SUNAT.",
  PLAME: "Planilla Mensual. Se sube al declarar el período (formulario 0601).",
  Derechohabientes: "Altas y bajas de familiares. Se remite por SOL con el archivo RD_…TXT.",
};

/** Estructuras de una sección, en el orden del Anexo 3. */
export function importStructuresByDestination(destination: ImportDestination): ImportStructure[] {
  return IMPORT_STRUCTURES.filter((s) => s.destination === destination);
}

export type FileNameParts = {
  ruc: string;
  /** Período en formato "AAAA-MM". */
  period: string;
  /** Fecha de remisión en formato "AAAA-MM-DD" (para derechohabientes). */
  date?: string;
};

function formatDdMmYyyy(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Reemplaza los marcadores del nombre del archivo por el RUC, el período y la
 * fecha reales, para que el archivo descargado tenga el nombre que exige SUNAT.
 */
export function resolveFileName(fileName: string, parts: FileNameParts): string {
  const [year, month] = parts.period.split("-");
  let out = fileName;
  out = out.replace(/ffff/, "0601");
  out = out.replace(/aaaa/, year ?? "");
  out = out.replace(/mm/, month ?? "");
  out = out.replace(/RRRRRRRRRRR/g, parts.ruc);
  out = out.replace(/#{11}/g, parts.ruc);
  if (parts.date) out = out.replace(/DDMMAAAA/g, formatDdMmYyyy(parts.date).replace(/\//g, ""));
  return out;
}

/**
 * Arma una guía (una fila por campo) con N°, descripción, tipo y longitud, más
 * una fila de ejemplo vacía lista para llenar. Es una ayuda de digitación, no
 * un archivo para subir a SUNAT (ese debe llevar solo los datos, sin encabezado).
 */
export function buildFieldGuideCsv(structure: ImportStructure, file: ImportFile): string {
  const esc = (v: string) => `"${String(v).replaceAll('"', '""')}"`;
  const header = ["N°", "Descripción", "Tipo", "Longitud", "Observaciones", "Ejemplo"].map(esc);
  const rows = file.fields.map((f) =>
    [String(f.n), f.name, f.type, f.length ?? "", f.note ?? "", ""].map(esc),
  );
  return [header, ...rows].map((r) => r.join(",")).join("\r\n");
}

/** Línea de ejemplo con los campos separados por “|” (todos vacíos salvo el N°). */
export function buildExampleLine(file: ImportFile): string {
  return file.fields.map((f) => `<${f.n} ${f.name}>`).join(" | ");
}

/** Todos los nombres de archivo de una estructura, ya resueltos. */
export function resolveFileNames(structure: ImportStructure, parts: FileNameParts): string[] {
  return structure.files.map((f) => resolveFileName(f.fileName, parts));
}
