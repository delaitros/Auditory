// ============================================================
//  GENERADOR DE DOCUMENTOS DESDE GOOGLE FORMS  v2.0
//  Configuración 100% visual — sin editar código.
// ============================================================

// -----------------------------------------------------------
//  MENÚ
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
    .addToUi();
}

// -----------------------------------------------------------
//  CONFIGURACIÓN — guardada en propiedades del script
// -----------------------------------------------------------
function getConfig() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return {
    TEMPLATE_DOC_ID:   props.TEMPLATE_DOC_ID   || '',
    OUTPUT_FOLDER_ID:  props.OUTPUT_FOLDER_ID   || '',
    SHEET_NAME:        props.SHEET_NAME         || 'Respuestas de formulario 1',
    NOMBRE_COLUMNA:    props.NOMBRE_COLUMNA     || 'Empresa',
    PREFIJO_ARCHIVO:   props.PREFIJO_ARCHIVO    || 'Constancia de Visita',
    GENERAR_PDF:       props.GENERAR_PDF        !== 'false',
    MARCAR_PROCESADAS: props.MARCAR_PROCESADAS  !== 'false',
    COLUMNA_ESTADO:    props.COLUMNA_ESTADO     || 'Documento generado',
  };
}

/** Llamada desde el formulario HTML para guardar la configuración. */
function guardarConfiguracion(datos) {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
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

/** Devuelve la configuración actual para pre-llenar el formulario. */
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const ultima = sheet.getLastColumn();
  if (ultima === 0) return [];
  return sheet.getRange(1, 1, 1, ultima).getValues()[0].filter(v => v !== '');
}

function abrirConfiguracion() {
  const html = HtmlService.createHtmlOutputFromFile('Configuracion')
    .setTitle('Configuración — Auditorias')
    .setWidth(520)
    .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuración — Auditorias');
}

// -----------------------------------------------------------
//  DISPARADOR AUTOMÁTICO
//  Asignar a "Al enviar formulario" en Disparadores.
// -----------------------------------------------------------
function onFormSubmit(e) {
  procesarFila(e.range.getRowIndex());
}

// -----------------------------------------------------------
//  FUNCIONES PRINCIPALES
// -----------------------------------------------------------
function generarDocumentosNuevos() {
  validarConfiguracion();
  const cfg = getConfig();
  const sheet = obtenerHoja(cfg);
  const datos = sheet.getDataRange().getValues();
  const encabezados = datos[0];
  const idxEstado = encabezados.indexOf(cfg.COLUMNA_ESTADO);

  let generados = 0;
  for (let i = 1; i < datos.length; i++) {
    if (filaVacia(datos[i])) continue;
    if (idxEstado >= 0 && datos[i][idxEstado]) continue;
    procesarFila(i + 1);
    generados++;
  }
  mostrarMensaje(`Listo. Se generaron ${generados} documento(s).`);
}

function generarDocumentoFilaSeleccionada() {
  validarConfiguracion();
  const cfg = getConfig();
  const sheet = obtenerHoja(cfg);
  const filaActiva = sheet.getActiveCell().getRow();
  if (filaActiva <= 1) {
    mostrarMensaje('Seleccioná una celda en la fila de datos (no en el encabezado).');
    return;
  }
  procesarFila(filaActiva);
  mostrarMensaje('Documento generado correctamente.');
}

function generarTodosLosDocumentos() {
  validarConfiguracion();
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert('Confirmar',
    '¿Regenerar documentos para TODAS las filas?',
    ui.ButtonSet.OK_CANCEL);
  if (resp !== ui.Button.OK) return;

  const cfg = getConfig();
  const sheet = obtenerHoja(cfg);
  const datos = sheet.getDataRange().getValues();
  let generados = 0;
  for (let i = 1; i < datos.length; i++) {
    if (filaVacia(datos[i])) continue;
    procesarFila(i + 1);
    generados++;
  }
  mostrarMensaje(`Listo. Se regeneraron ${generados} documento(s).`);
}

// -----------------------------------------------------------
//  LÓGICA CENTRAL
// -----------------------------------------------------------
function procesarFila(numFila) {
  const cfg = getConfig();
  const sheet = obtenerHoja(cfg);
  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const valores    = sheet.getRange(numFila, 1, 1, sheet.getLastColumn()).getValues()[0];

  const datosDoc = {};
  encabezados.forEach((col, idx) => {
    if (col) datosDoc[normalizarClave(col)] = formatearValor(valores[idx]);
  });
  datosDoc['__fila__'] = String(numFila - 1);
  datosDoc['__fecha_generacion__'] = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');

  const nombreBase = construirNombreArchivo(cfg, datosDoc, numFila);
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
}

function reemplazarEnDocumento(doc, datos) {
  const cuerpo    = doc.getBody();
  const encabezado = doc.getHeader();
  const pie       = doc.getFooter();
  Object.entries(datos).forEach(([clave, valor]) => {
    const m = `{{${clave}}}`;
    cuerpo.replaceText(m, valor);
    if (encabezado) encabezado.replaceText(m, valor);
    if (pie)        pie.replaceText(m, valor);
  });
  cuerpo.replaceText('\\{\\{[^}]+\\}\\}', '');
}

// -----------------------------------------------------------
//  UTILIDADES
// -----------------------------------------------------------
function obtenerHoja(cfg) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(cfg.SHEET_NAME);
  if (!sheet) throw new Error(`No se encontró la pestaña "${cfg.SHEET_NAME}". Revisá la configuración.`);
  return sheet;
}

function validarConfiguracion() {
  const cfg = getConfig();
  if (!cfg.TEMPLATE_DOC_ID || !cfg.OUTPUT_FOLDER_ID) {
    throw new Error('Falta configurar la plantilla o la carpeta de destino. Andá a Auditorias → Configuración.');
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
  const empresa = datos[normalizarClave(cfg.NOMBRE_COLUMNA)] || `Fila_${numFila - 1}`;
  const fecha   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  return `${cfg.PREFIJO_ARCHIVO} — ${empresa} — ${fecha}`;
}

function marcarFilaProcesada(sheet, numFila, encabezados, columnaEstado, urlDoc) {
  let col = encabezados.indexOf(columnaEstado) + 1;
  if (col <= 0) {
    col = sheet.getLastColumn() + 1;
    sheet.getRange(1, col).setValue(columnaEstado);
  }
  const fechaHora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  sheet.getRange(numFila, col)
    .setFormula(`=HYPERLINK("${urlDoc}","Generado ${fechaHora}")`);
}

function mostrarMensaje(msg) {
  SpreadsheetApp.getUi().alert(msg);
}

/** Extrae el ID de una URL de Google Drive/Docs, o devuelve el texto si ya es un ID. */
function extraerId(url) {
  if (!url) return '';
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : url.trim();
}
