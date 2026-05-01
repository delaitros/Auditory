// ============================================================
//  AUDITORIAS — Web App + Generador de Documentos  v3.0
//  Web app propia reemplaza Google Forms.
//  Escribe en Google Sheets y genera Google Doc por envío.
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
  const cfg = getConfig();
  validarConfiguracion(cfg);

  // 1. Guardar en Google Sheets
  const sheet = obtenerHoja(cfg);
  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const fila = construirFila(encabezados, datos);
  sheet.appendRow(fila);
  const numFila = sheet.getLastRow();

  // 2. Generar documento
  const urlDoc = procesarFila(numFila, cfg, sheet);

  return { ok: true, urlDoc: urlDoc };
}

// -----------------------------------------------------------
//  MENÚ (para uso desde el Sheet)
// -----------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Auditorias')
    .addItem('⚙️  Configuración', 'abrirConfiguracion')
    .addSeparator()
    .addItem('▶  Generar documentos (filas nuevas)', 'generarDocumentosNuevos')
    .addItem('▶  Generar documento — fila seleccionada', 'generarDocumentoFilaSeleccionada')
    .addSeparator()
    .addItem('↺  Regenerar TODOS los documentos', 'generarTodosLosDocumentos')
    .addSeparator()
    .addItem('🌐  Ver URL de la web app', 'mostrarUrlWebApp')
    .addToUi();
}

function mostrarUrlWebApp() {
  const url = ScriptApp.getService().getUrl();
  SpreadsheetApp.getUi().alert(
    'URL de la web app',
    url || 'El script no está publicado como web app todavía.\n\nAndá a Implementar → Nueva implementación → Aplicación web.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// -----------------------------------------------------------
//  CONFIGURACIÓN
// -----------------------------------------------------------
function getConfig() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return {
    TEMPLATE_DOC_ID:   props.TEMPLATE_DOC_ID   || '',
    OUTPUT_FOLDER_ID:  props.OUTPUT_FOLDER_ID   || '',
    SHEET_NAME:        props.SHEET_NAME         || 'Constancias',
    NOMBRE_COLUMNA:    props.NOMBRE_COLUMNA     || 'Empresa',
    PREFIJO_ARCHIVO:   props.PREFIJO_ARCHIVO    || 'Constancia de Visita',
    GENERAR_PDF:       props.GENERAR_PDF        !== 'false',
    MARCAR_PROCESADAS: props.MARCAR_PROCESADAS  !== 'false',
    COLUMNA_ESTADO:    props.COLUMNA_ESTADO     || 'Documento generado',
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
  return {
    templateUrl:      cfg.TEMPLATE_DOC_ID  ? `https://docs.google.com/document/d/${cfg.TEMPLATE_DOC_ID}/edit` : '',
    folderUrl:        cfg.OUTPUT_FOLDER_ID ? `https://drive.google.com/drive/folders/${cfg.OUTPUT_FOLDER_ID}` : '',
    sheetName:        cfg.SHEET_NAME,
    nombreColumna:    cfg.NOMBRE_COLUMNA,
    prefijoArchivo:   cfg.PREFIJO_ARCHIVO,
    generarPdf:       cfg.GENERAR_PDF,
    marcarProcesadas: cfg.MARCAR_PROCESADAS,
    columnaEstado:    cfg.COLUMNA_ESTADO,
    hojas:            listarHojas(),
    columnas:         listarColumnas(cfg.SHEET_NAME),
  };
}

function listarHojas() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName());
}

function listarColumnas(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const ultima = sheet.getLastColumn();
  if (ultima === 0) return [];
  return sheet.getRange(1, 1, 1, ultima).getValues()[0].filter(v => v !== '');
}

function abrirConfiguracion() {
  const html = HtmlService.createHtmlOutputFromFile('Configuracion')
    .setWidth(520).setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuración — Auditorias');
}

// -----------------------------------------------------------
//  GENERACIÓN MANUAL DESDE EL SHEET
// -----------------------------------------------------------
function generarDocumentosNuevos() {
  const cfg = getConfig();
  validarConfiguracion(cfg);
  const sheet = obtenerHoja(cfg);
  const datos = sheet.getDataRange().getValues();
  const idxEstado = datos[0].indexOf(cfg.COLUMNA_ESTADO);
  let generados = 0;
  for (let i = 1; i < datos.length; i++) {
    if (filaVacia(datos[i])) continue;
    if (idxEstado >= 0 && datos[i][idxEstado]) continue;
    procesarFila(i + 1, cfg, sheet);
    generados++;
  }
  mostrarMensaje(`Listo. Se generaron ${generados} documento(s).`);
}

function generarDocumentoFilaSeleccionada() {
  const cfg = getConfig();
  validarConfiguracion(cfg);
  const sheet = obtenerHoja(cfg);
  const fila = sheet.getActiveCell().getRow();
  if (fila <= 1) { mostrarMensaje('Seleccioná una celda de datos (no el encabezado).'); return; }
  procesarFila(fila, cfg, sheet);
  mostrarMensaje('Documento generado correctamente.');
}

function generarTodosLosDocumentos() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('Confirmar', '¿Regenerar documentos para TODAS las filas?', ui.ButtonSet.OK_CANCEL) !== ui.Button.OK) return;
  const cfg = getConfig();
  validarConfiguracion(cfg);
  const sheet = obtenerHoja(cfg);
  const datos = sheet.getDataRange().getValues();
  let generados = 0;
  for (let i = 1; i < datos.length; i++) {
    if (filaVacia(datos[i])) continue;
    procesarFila(i + 1, cfg, sheet);
    generados++;
  }
  mostrarMensaje(`Listo. Se regeneraron ${generados} documento(s).`);
}

// -----------------------------------------------------------
//  LÓGICA CENTRAL
// -----------------------------------------------------------

/**
 * Genera el documento para una fila del Sheet.
 * Devuelve la URL del Google Doc generado.
 */
function procesarFila(numFila, cfg, sheet) {
  if (!cfg)   cfg   = getConfig();
  if (!sheet) sheet = obtenerHoja(cfg);

  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const valores     = sheet.getRange(numFila, 1, 1, sheet.getLastColumn()).getValues()[0];

  const datosDoc = {};
  encabezados.forEach((col, idx) => {
    if (col) datosDoc[normalizarClave(col)] = formatearValor(valores[idx]);
  });
  datosDoc['__fila__'] = String(numFila - 1);
  datosDoc['__fecha_generacion__'] = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');

  const nombreBase = construirNombreArchivo(cfg, datosDoc, numFila);
  const carpeta    = DriveApp.getFolderById(cfg.OUTPUT_FOLDER_ID);
  const copia      = DriveApp.getFileById(cfg.TEMPLATE_DOC_ID).makeCopy(nombreBase, carpeta);
  const doc        = DocumentApp.openById(copia.getId());
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
  const cuerpo    = doc.getBody();
  const encabezado = doc.getHeader();
  const pie       = doc.getFooter();
  Object.entries(datos).forEach(([k, v]) => {
    const m = `{{${k}}}`;
    cuerpo.replaceText(m, v);
    if (encabezado) encabezado.replaceText(m, v);
    if (pie)        pie.replaceText(m, v);
  });
  cuerpo.replaceText('\\{\\{[^}]+\\}\\}', '');
}

// Construye la fila a insertar en el Sheet según los encabezados existentes.
function construirFila(encabezados, datos) {
  const COLUMNAS_FIJAS = [
    'Marca temporal', 'Empresa', 'Establecimiento', 'Sector',
    'actividades desarrolladas', 'desvios observados',
    'comentarios', 'auditor', 'fecha de la visita', 'hora de la visita',
  ];

  // Si el sheet está vacío, crear encabezados
  if (encabezados.every(v => !v)) {
    return [new Date(), datos.empresa, datos.establecimiento, datos.sector,
      datos.actividades, datos.desvios, datos.comentarios,
      datos.auditor, datos.fechaVisita, datos.horaVisita];
  }

  // Mapear datos a las columnas existentes
  const mapaValores = {
    'marca temporal':           new Date(),
    'empresa':                  datos.empresa,
    'establecimiento':          datos.establecimiento,
    'sector':                   datos.sector,
    'actividades desarrolladas': datos.actividades,
    'desvios observados':       datos.desvios,
    'comentarios':              datos.comentarios,
    'auditor':                  datos.auditor,
    'fecha de la visita':       datos.fechaVisita,
    'hora de la visita':        datos.horaVisita,
  };

  return encabezados.map(col => mapaValores[col.toLowerCase()] ?? '');
}

// Crea los encabezados si el sheet está vacío.
function inicializarEncabezados(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Marca temporal', 'Empresa', 'Establecimiento', 'Sector',
      'actividades desarrolladas', 'desvios observados',
      'comentarios', 'auditor', 'fecha de la visita', 'hora de la visita',
    ]);
  }
}

// -----------------------------------------------------------
//  UTILIDADES
// -----------------------------------------------------------
function obtenerHoja(cfg) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(cfg.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.SHEET_NAME);
    inicializarEncabezados(sheet);
  } else if (sheet.getLastRow() === 0) {
    inicializarEncabezados(sheet);
  }
  return sheet;
}

function validarConfiguracion(cfg) {
  if (!cfg) cfg = getConfig();
  if (!cfg.TEMPLATE_DOC_ID || !cfg.OUTPUT_FOLDER_ID) {
    throw new Error('Falta configurar la plantilla o carpeta. Andá a Auditorias → Configuración.');
  }
}

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
  if (valor === null || valor === undefined) return '';
  return String(valor);
}

function construirNombreArchivo(cfg, datos, numFila) {
  const empresa = datos[normalizarClave(cfg.NOMBRE_COLUMNA)] || `Registro_${numFila - 1}`;
  const fecha   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  return `${cfg.PREFIJO_ARCHIVO} — ${empresa} — ${fecha}`;
}

function marcarFilaProcesada(sheet, numFila, encabezados, columnaEstado, urlDoc) {
  let col = encabezados.indexOf(columnaEstado) + 1;
  if (col <= 0) { col = sheet.getLastColumn() + 1; sheet.getRange(1, col).setValue(columnaEstado); }
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  sheet.getRange(numFila, col).setFormula(`=HYPERLINK("${urlDoc}","Generado ${ts}")`);
}

function mostrarMensaje(msg) { SpreadsheetApp.getUi().alert(msg); }

function extraerId(url) {
  if (!url) return '';
  const m = url.match(/[-\w]{25,}/);
  return m ? m[0] : url.trim();
}
