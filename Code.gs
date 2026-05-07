// ============================================================
//  AUDITORIAS — Portal + Web App + Generador de Documentos  v5.0
//  Script standalone: no requiere hoja de cálculo previa.
//  La primera vez crea el Sheet automáticamente en la carpeta.
// ============================================================

// -----------------------------------------------------------
//  DATOS DEL PORTAL
// -----------------------------------------------------------
const EMPRESAS = [
  'ABC Industrial',
  'Abelardo de la Vega',
  'AJ Tendlarz',
  'Alianza Sotavento',
  'Astillero al Sur',
  'Biofoods Argentina',
  'Ce.Me.Es',
  'Cerámica Etchehon',
  'Clínica Veterinaria Integral',
  'CyESAS',
  'Cymseg',
  'Daniel Fanti',
  'Denis Musielack',
  'Dibac',
  'Dislac SRL',
  'EDASA',
  'Emprendimiento Rio Chubut',
  'Fapre',
  'Fuhrmann SA',
  'Gas Trelew',
  'Gimap',
  'Jorge Lino',
  'Jorge Martinez',
  'La Casa del Pan',
  'La Ermita',
  'MIDA',
  'Mistura',
  'Mundo Madera',
  'Puerto Rawson Patagonia',
  'Pyg Servicios Generales',
  'Rubén Centeno',
  'Servimar',
  'Sofimed',
  'Soltex',
  'Tacme SRL',
  'Transporte MZ',
  'Unilan Trelew SA',
  'Zanotti S.A',
];

const AUDITORES = ['Félix Raúl Vidal', 'Valeria'];

const FORMULARIOS = [
  { id: 'constancia', nombre: 'Constancia de Visita', url: null },
  { id: 'audi1',  nombre: 'AUDI 1 — Higiene y Seguridad en el Trabajo',     url: 'https://docs.google.com/forms/d/e/1FAIpQLSeN-z--FjiMAy4gaL9bNES9C-Kw_sRa8s3__l7WtXGUCHLmcg/viewform' },
  { id: 'audi2',  nombre: 'AUDI 2 — Medicina del Trabajo',                  url: 'https://docs.google.com/forms/d/e/1FAIpQLSczdTzm6shCLEJ9cznvlPYU9hhnWQcXLWPx0Cbsq8ilVIGwKw/viewform' },
  { id: 'audi3',  nombre: 'AUDI 3 — Herramientas',                          url: 'https://docs.google.com/forms/d/e/1FAIpQLScxC-brTDdeGr7cUX6fmTN0PmwhknhMRXotdrIMyOfctkJWog/viewform' },
  { id: 'audi4',  nombre: 'AUDI 4 — Máquinas',                              url: 'https://docs.google.com/forms/d/e/1FAIpQLScGC_jZNskAAg73uKszbq2QpYCVzgODSsf67FdgtoKS4q8MqQ/viewform' },
  { id: 'audi5',  nombre: 'AUDI 5 — Espacios de Trabajo',                   url: 'https://docs.google.com/forms/d/e/1FAIpQLSccPjL6BSxwRiFVglz45yzokM4Y16g5hinadiZ0np0feqRtsA/viewform' },
  { id: 'audi6',  nombre: 'AUDI 6 — Ergonomía',                             url: 'https://docs.google.com/forms/d/e/1FAIpQLScVf7ozawyWElgOyRB18zeYrVS230vFUb92m1jJK1DDouJgOQ/viewform' },
  { id: 'audi7',  nombre: 'AUDI 7 — Protección contra Incendios',           url: 'https://docs.google.com/forms/d/e/1FAIpQLScTw9hLiGGJK6EHMvuII8TItJi5-klEFhsmWcdxVvZxnpq2Nw/viewform' },
  { id: 'audi8',  nombre: 'AUDI 8 — Almacenaje',                            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfiWeDnB0bUXWr--cMAKIAn6qMrPa2pLgb5nIaGKCp8_hF7Rw/viewform' },
  { id: 'audi9',  nombre: 'AUDI 9 — Almacenaje de Sustancias Peligrosas',   url: 'https://docs.google.com/forms/d/e/1FAIpQLSfXrmflJioGuvuEV401WZBZ4ceNSZG6jpTBcyiAyuqtypfSow/viewform' },
  { id: 'audi10', nombre: 'AUDI 10 — Sustancias Peligrosas',                url: 'https://docs.google.com/forms/d/e/1FAIpQLSdzgUIQdE-Hi2DY8UIbSbTXQLJWdCEZqHPbz6tbgEWF1pgyVA/viewform' },
  { id: 'audi11', nombre: 'AUDI 11 — Riesgo Eléctrico',                     url: 'https://docs.google.com/forms/d/e/1FAIpQLSeUf-cheGF3T4t5MtN01wmUWYUgkWsCzbP6cGumOAVcgDKrwg/viewform' },
  { id: 'audi12', nombre: 'AUDI 12 — Aparatos Sometidos a Presión',         url: 'https://docs.google.com/forms/d/e/1FAIpQLSfKL05WaarWEKlUvDc7x7lDN8DMdD0GXnIKMY4n-XRRgr14oA/viewform' },
  { id: 'audi13', nombre: 'AUDI 13 — EPP',                                  url: 'https://docs.google.com/forms/d/e/1FAIpQLSfjq2ZKDq5_-8OZdO1Bs60iA9aQUffUfnTuiC8JppNqFEdCTw/viewform' },
  { id: 'audi14', nombre: 'AUDI 14 — Iluminación y Color',                  url: 'https://docs.google.com/forms/d/e/1FAIpQLScJbRD_eMa883zhf4ukjKT66fWYI7xku6-toAOL7vBKXnDDTA/viewform' },
  { id: 'audi15', nombre: 'AUDI 15 — Condiciones Higrotérmicas',            url: 'https://docs.google.com/forms/d/e/1FAIpQLSeopIr5vD4pxa3MojfvdrwpkIKPytleeXOJ8JDDldwhHC1Y4w/viewform' },
  { id: 'audi16', nombre: 'AUDI 16 — Radiaciones Ionizantes',               url: 'https://docs.google.com/forms/d/e/1FAIpQLSe5H8FlXzHZypMutHOsWQpjzwdqdMRkyaCIS35M4SDbYn-VLQ/viewform' },
  { id: 'audi17', nombre: 'AUDI 17 — Láseres',                              url: 'https://docs.google.com/forms/d/e/1FAIpQLSfVYz6HAjG6Brp8copckAG61TPiZ-FUlyu15iVnUxK19xITrQ/viewform' },
  { id: 'audi18', nombre: 'AUDI 18 — Radiaciones No Ionizantes',            url: 'https://docs.google.com/forms/d/e/1FAIpQLScR0MmHsvSOWp-VV5f3SaIvSZMZYvCSdrASzT3CldasUr2vnQ/viewform' },
  { id: 'audi19', nombre: 'AUDI 19 — Provisión de Agua',                    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfHy3zmZLx8cJXlNGEyZlC9m8sWLW-dWKbxsWtvX5kn2ZRgtA/viewform' },
  { id: 'audi20', nombre: 'AUDI 20 — Desagües Industriales',                url: 'https://docs.google.com/forms/d/e/1FAIpQLSfOMkKM76vWemvJda8k9nZAi_0wrL0TCCXNJwDLGUMwiDIvqg/viewform' },
  { id: 'audi21', nombre: 'AUDI 21 — Baños, Vestuarios y Comedor',          url: 'https://docs.google.com/forms/d/e/1FAIpQLSeOvJtzyD6xRM7DYFnIIpEnCxpGfAgVmUEpXjDaFBQFU1SmYA/viewform' },
  { id: 'audi22', nombre: 'AUDI 22 — Aparatos para Izar, Montacargas y Ascensores', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfSrXWtDWBhlkBl9uKfd7zH1P086YvoIP71rGBrwSeL1bbZpw/viewform' },
  { id: 'audi23', nombre: 'AUDI 23 — Capacitación',                         url: 'https://docs.google.com/forms/d/e/1FAIpQLSfcrE3llDN9OQ1R-xhFE_WZJ9SfBXqgL8oHTA2gjVj1xYXWWg/viewform' },
  { id: 'audi24', nombre: 'AUDI 24 — Primeros Auxilios',                    url: 'https://docs.google.com/forms/d/e/1FAIpQLSckTdzcHVl9ds5jK56lvzGxW_iuLEK_snrWdvgiuJ0OOhOBSA/viewform' },
  { id: 'audi25', nombre: 'AUDI 25 — Vehículos',                            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfnbfy4B7pRIN98bTpuiVgxqAA1ZG6g9gax_crGIv2px_f97A/viewform' },
  { id: 'audi26', nombre: 'AUDI 26 — Contaminación Ambiental',              url: 'https://docs.google.com/forms/d/e/1FAIpQLSf2t850UmIBTwjuKEHk0Bzn5D_9k0_FOEBLWWlRWZMTdrVmpg/viewform' },
  { id: 'audi27', nombre: 'AUDI 27 — Ruidos',                               url: 'https://docs.google.com/forms/d/e/1FAIpQLSdUvnMSme8xhWfLHiO5-TBpcrZEsqxgBE8Lz-j1XKToAiX2lQ/viewform' },
  { id: 'audi28', nombre: 'AUDI 28 — Ultrasonido e Infrasonido',            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfmoLfB4fM_A9fnDbHcHHKAX-iNfjhFD1nBuIwEbkeMpwLp8w/viewform' },
  { id: 'audi29', nombre: 'AUDI 29 — Vibraciones',                          url: 'https://docs.google.com/forms/d/e/1FAIpQLSdxH3hfNcy5mBufmspcntkqWzr6POG3VSUFOTDBQR3eIvxBBg/viewform' },
  { id: 'audi30', nombre: 'AUDI 30 — Utilización de Gases',                 url: 'https://docs.google.com/forms/d/e/1FAIpQLSfseAfiMxAsTfvZ5jpZz5l1kBVkPkD0rd2vQPzVhSsrc2rRgg/viewform' },
  { id: 'audi31', nombre: 'AUDI 31 — Soldadura',                            url: 'https://docs.google.com/forms/d/e/1FAIpQLSdDp1VsItur8KmgzxbWgKdK_VFzMVLBBMxhHcjVTB48cBkXCA/viewform' },
  { id: 'audi32', nombre: 'AUDI 32 — Escaleras',                            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfMzzuSlNBahLfDGU2pR65y3WXktfVwgXe2vaKu_-9iyzqVjQ/viewform' },
  { id: 'audi33', nombre: 'AUDI 33 — Mantenimiento Preventivo',             url: 'https://docs.google.com/forms/d/e/1FAIpQLScuTzHCULRUuYOlk4UYdfMoe2VyoXpDcl1mZMSquUFzGLesWw/viewform' },
  { id: 'audi34', nombre: 'AUDI 34 — Otras Resoluciones Legales',           url: 'https://docs.google.com/forms/d/e/1FAIpQLSfRvUBP-NgGSxCC_xt8bXaSNBQ1HE9U7gV4zfkklXrumnioew/viewform' },
];

// -----------------------------------------------------------
//  WEB APP
// -----------------------------------------------------------
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Portal')
    .setTitle('Portal de Auditorías — Higiene y Seguridad')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// -----------------------------------------------------------
//  PORTAL — funciones del servidor
// -----------------------------------------------------------
function obtenerDatosPortal() {
  return {
    empresas:    EMPRESAS,
    auditores:   AUDITORES,
    formularios: FORMULARIOS,
  };
}

/**
 * Verifica si ya se realizó el mismo formulario para la misma empresa
 * en los últimos 6 meses.
 */
function verificar6Meses(empresa, idFormulario) {
  const cfg = getConfig();
  if (!cfg.SPREADSHEET_ID) return { encontrado: false };

  const ss    = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Registro');
  if (!sheet || sheet.getLastRow() <= 1) return { encontrado: false };

  const datos = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);

  const empresaNorm = empresa.toString().toLowerCase().trim();

  for (const fila of datos) {
    const [fechaVal, empresaReg, formularioReg, auditorReg] = fila;
    if (!fechaVal) continue;
    const fecha = new Date(fechaVal);
    if (
      fecha >= hace6Meses &&
      empresaReg.toString().toLowerCase().trim() === empresaNorm &&
      formularioReg.toString() === idFormulario
    ) {
      return {
        encontrado: true,
        fecha:   Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
        auditor: auditorReg.toString(),
      };
    }
  }
  return { encontrado: false };
}

/**
 * Registra una visita/auditoría en la hoja "Registro" (crea la hoja si no existe).
 */
function registrarEnMaestro(empresa, idFormulario, nombreFormulario, auditor) {
  const cfg = getConfig();
  const ss  = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);

  let sheet = ss.getSheetByName('Registro');
  if (!sheet) {
    sheet = ss.insertSheet('Registro');
    sheet.appendRow(['Fecha', 'Empresa', 'ID Formulario', 'Nombre Formulario', 'Auditor']);
    sheet.getRange(1, 1, 1, 5)
      .setBackground('#4a148c').setFontColor('#ffffff').setFontWeight('bold');
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'Empresa', 'ID Formulario', 'Nombre Formulario', 'Auditor']);
    sheet.getRange(1, 1, 1, 5)
      .setBackground('#4a148c').setFontColor('#ffffff').setFontWeight('bold');
  }

  sheet.appendRow([new Date(), empresa, idFormulario, nombreFormulario, auditor]);
  return { ok: true };
}

// -----------------------------------------------------------
//  CONSTANCIA DE VISITA — procesar formulario completo
// -----------------------------------------------------------
/**
 * Recibe los datos del formulario web, guarda en el Sheet,
 * registra en el maestro y genera el documento.
 * Devuelve la URL del doc generado.
 */
function procesarFormulario(datos) {
  const cfg   = getConfig();
  const sheet = obtenerHoja(cfg);

  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(construirFila(encabezados, datos));
  const numFila = sheet.getLastRow();

  const urlDoc = generarDocumento(numFila, cfg, sheet);

  // Registrar en el maestro de visitas
  registrarEnMaestro(datos.empresa, 'constancia', 'Constancia de Visita', datos.auditor);

  return {
    ok: true,
    urlDoc:     urlDoc,
    urlCarpeta: 'https://drive.google.com/drive/folders/' + cfg.OUTPUT_FOLDER_ID,
  };
}

// -----------------------------------------------------------
//  CONFIGURACIÓN
// -----------------------------------------------------------
function getConfig() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return {
    TEMPLATE_DOC_ID:   props.TEMPLATE_DOC_ID  || '1BhVRm-XSz8a3koPOA9QnQLAL2E2cqATIvqXnwShA3yU',
    OUTPUT_FOLDER_ID:  props.OUTPUT_FOLDER_ID  || '1_r1u39-DyCuqg3fhYGARKISQ0hsiaAC4',
    SPREADSHEET_ID:    props.SPREADSHEET_ID    || '1xHVDVMcgaSD8h56poDS01KXopMy6Fq9IehOYJRCICXs',
    SHEET_NAME:        props.SHEET_NAME        || 'Constancias',
    NOMBRE_COLUMNA:    props.NOMBRE_COLUMNA    || 'Empresa',
    PREFIJO_ARCHIVO:   props.PREFIJO_ARCHIVO   || 'Constancia de Visita',
    GENERAR_PDF:       props.GENERAR_PDF       !== 'false',
    MARCAR_PROCESADAS: props.MARCAR_PROCESADAS !== 'false',
    COLUMNA_ESTADO:    props.COLUMNA_ESTADO    || 'Documento generado',
  };
}

function guardarConfiguracion(datos) {
  PropertiesService.getScriptProperties().setProperties({
    TEMPLATE_DOC_ID:   extraerId(datos.templateUrl),
    OUTPUT_FOLDER_ID:  extraerId(datos.folderUrl),
    SPREADSHEET_ID:    extraerId(datos.spreadsheetUrl),
    SHEET_NAME:        datos.sheetName,
    NOMBRE_COLUMNA:    datos.nombreColumna,
    PREFIJO_ARCHIVO:   datos.prefijoArchivo,
    GENERAR_PDF:       String(datos.generarPdf),
    MARCAR_PROCESADAS: String(datos.marcarProcesadas),
    COLUMNA_ESTADO:    datos.columnaEstado,
  });
  return { ok: true };
}

function obtenerConfiguracionActual() {
  const cfg = getConfig();
  const ss  = cfg.SPREADSHEET_ID ? SpreadsheetApp.openById(cfg.SPREADSHEET_ID) : null;
  const hojas    = ss ? ss.getSheets().map(s => s.getName()) : [cfg.SHEET_NAME];
  const columnas = ss ? listarColumnas(ss, cfg.SHEET_NAME) : [];
  return {
    templateUrl:      `https://docs.google.com/document/d/${cfg.TEMPLATE_DOC_ID}/edit`,
    folderUrl:        `https://drive.google.com/drive/folders/${cfg.OUTPUT_FOLDER_ID}`,
    spreadsheetUrl:   cfg.SPREADSHEET_ID ? `https://docs.google.com/spreadsheets/d/${cfg.SPREADSHEET_ID}/edit` : '',
    sheetName:        cfg.SHEET_NAME,
    nombreColumna:    cfg.NOMBRE_COLUMNA,
    prefijoArchivo:   cfg.PREFIJO_ARCHIVO,
    generarPdf:       cfg.GENERAR_PDF,
    marcarProcesadas: cfg.MARCAR_PROCESADAS,
    columnaEstado:    cfg.COLUMNA_ESTADO,
    hojas:            hojas,
    columnas:         columnas,
  };
}

function listarColumnas(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(v => v !== '');
}

function abrirConfiguracion() {
  const html = HtmlService.createHtmlOutputFromFile('Configuracion')
    .setWidth(520).setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuración — Auditorias');
}

// -----------------------------------------------------------
//  HOJA DE CÁLCULO
// -----------------------------------------------------------
function obtenerHoja(cfg) {
  let ss;

  if (cfg.SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.create('Auditorias — Constancias de Visita');
    const archivo = DriveApp.getFileById(ss.getId());
    DriveApp.getFolderById(cfg.OUTPUT_FOLDER_ID).addFile(archivo);
    DriveApp.getRootFolder().removeFile(archivo);
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  }

  let sheet = ss.getSheetByName(cfg.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.SHEET_NAME);
    inicializarEncabezados(sheet);
  } else if (sheet.getLastRow() === 0) {
    inicializarEncabezados(sheet);
  }
  return sheet;
}

function inicializarEncabezados(sheet) {
  sheet.appendRow([
    'Marca temporal', 'Empresa', 'Establecimiento', 'Sector',
    'actividades desarrolladas', 'desvios observados',
    'comentarios', 'auditor', 'fecha de la visita', 'hora de la visita',
  ]);
  sheet.getRange(1, 1, 1, 10)
    .setBackground('#4a148c').setFontColor('#ffffff').setFontWeight('bold');
}

// -----------------------------------------------------------
//  CONSTRUCCIÓN DE FILA
// -----------------------------------------------------------
function construirFila(encabezados, datos) {
  const mapa = {
    'marca temporal':            new Date(),
    'empresa':                   datos.empresa,
    'establecimiento':           datos.establecimiento,
    'sector':                    datos.sector,
    'actividades desarrolladas': datos.actividades,
    'desvios observados':        datos.desvios,
    'comentarios':               datos.comentarios,
    'auditor':                   datos.auditor,
    'fecha de la visita':        datos.fechaVisita,
    'hora de la visita':         datos.horaVisita,
  };

  if (filaVacia(encabezados)) {
    return Object.values(mapa);
  }
  return encabezados.map(col => mapa[col.toString().toLowerCase()] ?? '');
}

// -----------------------------------------------------------
//  GENERACIÓN DEL DOCUMENTO
// -----------------------------------------------------------
function generarDocumento(numFila, cfg, sheet) {
  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const valores     = sheet.getRange(numFila, 1, 1, sheet.getLastColumn()).getValues()[0];

  const datosDoc = {};
  encabezados.forEach((col, idx) => {
    if (col) datosDoc[normalizarClave(col)] = formatearValor(valores[idx]);
  });
  datosDoc['__fila__'] = String(numFila - 1);
  datosDoc['__fecha_generacion__'] = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');

  const empresa    = datosDoc[normalizarClave(cfg.NOMBRE_COLUMNA)] || `Registro_${numFila - 1}`;
  const fecha      = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  const nombreBase = `${cfg.PREFIJO_ARCHIVO} — ${empresa} — ${fecha}`;

  const carpeta = DriveApp.getFolderById(cfg.OUTPUT_FOLDER_ID);
  const copia   = DriveApp.getFileById(cfg.TEMPLATE_DOC_ID).makeCopy(nombreBase, carpeta);
  const doc     = DocumentApp.openById(copia.getId());

  reemplazarEnDocumento(doc, datosDoc);
  doc.saveAndClose();

  if (cfg.GENERAR_PDF) {
    carpeta.createFile(copia.getAs('application/pdf')).setName(nombreBase + '.pdf');
  }
  if (cfg.MARCAR_PROCESADAS) {
    marcarFilaProcesada(sheet, numFila, encabezados, cfg.COLUMNA_ESTADO, copia.getUrl());
  }

  return copia.getUrl();
}

function reemplazarEnDocumento(doc, datos) {
  const partes = [doc.getBody(), doc.getHeader(), doc.getFooter()];
  Object.entries(datos).forEach(([k, v]) => {
    partes.forEach(p => { if (p) p.replaceText(`{{${k}}}`, v); });
  });
  doc.getBody().replaceText('\\{\\{[^}]+\\}\\}', '');
}

function marcarFilaProcesada(sheet, numFila, encabezados, columnaEstado, urlDoc) {
  let col = encabezados.indexOf(columnaEstado) + 1;
  if (col <= 0) {
    col = sheet.getLastColumn() + 1;
    sheet.getRange(1, col).setValue(columnaEstado);
  }
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  sheet.getRange(numFila, col).setFormula(`=HYPERLINK("${urlDoc}","Generado ${ts}")`);
}

// -----------------------------------------------------------
//  UTILIDADES
// -----------------------------------------------------------
function filaVacia(fila) {
  return fila.every(c => c === '' || c === null || c === undefined);
}

function normalizarClave(texto) {
  return texto.toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function formatearValor(valor) {
  if (valor instanceof Date) {
    if (valor.getFullYear() <= 1899) {
      return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'HH:mm');
    }
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return valor == null ? '' : String(valor);
}

function extraerId(url) {
  if (!url) return '';
  const m = url.match(/[-\w]{25,}/);
  return m ? m[0] : url.trim();
}
