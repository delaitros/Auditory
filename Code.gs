// ============================================================
//  AUDITORIAS — Web App + Generador de Documentos  v4.0
//  Script standalone: no requiere hoja de cálculo previa.
//  La primera vez crea el Sheet automáticamente en la carpeta.
// ============================================================

// -----------------------------------------------------------
//  WEB APP
// -----------------------------------------------------------
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Formulario')
    .setTitle('Constancia de Visita — Higiene y Seguridad')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Recibe los datos del formulario web, guarda en el Sheet
 * y genera el documento. Devuelve la URL del doc generado.
 */
function procesarFormulario(datos) {
  const cfg   = getConfig();
  const sheet = obtenerHoja(cfg);

  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(construirFila(encabezados, datos));
  const numFila = sheet.getLastRow();

  const urlDoc = generarDocumento(numFila, cfg, sheet);
  return { ok: true, urlDoc: urlDoc };
}

// -----------------------------------------------------------
//  CONFIGURACIÓN — IDs pre-cargados, ajustables desde el
//  panel de Configuración o desde Archivo → Propiedades del
//  proyecto en Apps Script.
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
  const hojas   = ss ? ss.getSheets().map(s => s.getName()) : [cfg.SHEET_NAME];
  const columnas = ss ? listarColumnas(ss, cfg.SHEET_NAME) : [];
  return {
    templateUrl:      `https://docs.google.com/document/d/${cfg.TEMPLATE_DOC_ID}/edit`,
    folderUrl:        `https://drive.google.com/drive/folders/${cfg.OUTPUT_FOLDER_ID}`,
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

// Abre el panel de configuración (ejecutar manualmente desde el editor).
function abrirConfiguracion() {
  const html = HtmlService.createHtmlOutputFromFile('Configuracion')
    .setWidth(520).setHeight(580);
  // En un script standalone se muestra via UI del editor
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuración — Auditorias');
}

// -----------------------------------------------------------
//  HOJA DE CÁLCULO — se crea sola la primera vez
// -----------------------------------------------------------
function obtenerHoja(cfg) {
  let ss;

  if (cfg.SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
  } else {
    // Primera ejecución: crear el Sheet en la carpeta de destino
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
  if (valor instanceof Date)
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  return valor == null ? '' : String(valor);
}

function extraerId(url) {
  if (!url) return '';
  const m = url.match(/[-\w]{25,}/);
  return m ? m[0] : url.trim();
}
