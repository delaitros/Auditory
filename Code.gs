// ============================================================
//  GENERADOR DE DOCUMENTOS DESDE GOOGLE FORMS
//  Genera un documento Word/PDF por cada fila del Sheet.
//  Autor: Claude Code  |  Versión: 1.0
// ============================================================

// -----------------------------------------------------------
//  CONFIGURACIÓN — completar antes de usar
// -----------------------------------------------------------
const CONFIG = {
  // ID del Google Doc que usarás como plantilla.
  // Ejemplo: https://docs.google.com/document/d/ESTE_ES_EL_ID/edit
  TEMPLATE_DOC_ID: 'REEMPLAZAR_CON_ID_DE_PLANTILLA',

  // ID de la carpeta de Drive donde se guardarán los documentos generados.
  // Ejemplo: https://drive.google.com/drive/folders/ESTE_ES_EL_ID
  OUTPUT_FOLDER_ID: 'REEMPLAZAR_CON_ID_DE_CARPETA',

  // Nombre de la pestaña del Sheet con las respuestas.
  // Google Forms normalmente la llama "Respuestas de formulario 1".
  SHEET_NAME: 'Respuestas de formulario 1',

  // Columna que se usará para nombrar el archivo generado.
  // Por ejemplo: 'Empresa', 'Nombre', 'Razón Social'.
  // Si está vacío, se usa la fecha y número de fila.
  NOMBRE_COLUMNA: 'Empresa',

  // Prefijo para el nombre del archivo generado.
  PREFIJO_ARCHIVO: 'Constancia de Visita',

  // Si es true, también genera un PDF además del Google Doc.
  GENERAR_PDF: true,

  // Si es true, marca en el Sheet las filas ya procesadas.
  MARCAR_PROCESADAS: true,

  // Nombre de la columna que indica si la fila ya fue procesada.
  COLUMNA_ESTADO: 'Documento generado',
};

// -----------------------------------------------------------
//  MENÚ PERSONALIZADO EN EL SHEET
// -----------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Auditorias')
    .addItem('Generar documentos (filas nuevas)', 'generarDocumentosNuevos')
    .addItem('Generar documento — fila seleccionada', 'generarDocumentoFilaSeleccionada')
    .addSeparator()
    .addItem('Generar TODOS los documentos (reprocesar)', 'generarTodosLosDocumentos')
    .addSeparator()
    .addItem('Ver instrucciones', 'mostrarInstrucciones')
    .addToUi();
}

// -----------------------------------------------------------
//  DISPARADOR AUTOMÁTICO (opcional)
//  Asignar a "Al enviar formulario" en Disparadores del proyecto.
// -----------------------------------------------------------
function onFormSubmit(e) {
  const fila = e.range.getRowIndex();
  procesarFila(fila);
}

// -----------------------------------------------------------
//  FUNCIONES PRINCIPALES
// -----------------------------------------------------------

/** Genera documentos solo para las filas que aún no fueron procesadas. */
function generarDocumentosNuevos() {
  const sheet = obtenerHoja();
  const datos = sheet.getDataRange().getValues();
  const encabezados = datos[0];
  const idxEstado = encabezados.indexOf(CONFIG.COLUMNA_ESTADO);

  let generados = 0;
  for (let i = 1; i < datos.length; i++) {
    const fila = datos[i];
    if (filaVacia(fila)) continue;
    if (idxEstado >= 0 && fila[idxEstado]) continue; // ya procesada
    procesarFila(i + 1); // +1 porque getDataRange es base-0 pero Sheets es base-1
    generados++;
  }

  mostrarMensaje(`Listo. Se generaron ${generados} documento(s).`);
}

/** Genera documento para la fila donde está el cursor. */
function generarDocumentoFilaSeleccionada() {
  const sheet = obtenerHoja();
  const filaActiva = sheet.getActiveCell().getRow();
  if (filaActiva <= 1) {
    mostrarMensaje('Seleccioná una celda en la fila de datos (no en el encabezado).');
    return;
  }
  procesarFila(filaActiva);
  mostrarMensaje('Documento generado correctamente.');
}

/** Reprocesa todas las filas, incluyendo las ya procesadas. */
function generarTodosLosDocumentos() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    'Confirmar',
    '¿Regenerar documentos para TODAS las filas? Esto puede sobreescribir documentos existentes.',
    ui.ButtonSet.OK_CANCEL
  );
  if (resp !== ui.Button.OK) return;

  const sheet = obtenerHoja();
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

/**
 * Genera el documento para una fila específica del Sheet.
 * @param {number} numFila - Número de fila en Sheets (base-1, incluye encabezado).
 */
function procesarFila(numFila) {
  const sheet = obtenerHoja();
  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const valores = sheet.getRange(numFila, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Construir mapa { placeholder: valor }
  const datos = {};
  encabezados.forEach((col, idx) => {
    if (col) {
      const clave = normalizarClave(col);
      datos[clave] = formatearValor(valores[idx]);
    }
  });
  datos['__fila__'] = String(numFila - 1); // número de registro
  datos['__fecha_generacion__'] = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'
  );

  // Nombre del archivo
  const nombreBase = construirNombreArchivo(datos, numFila);

  // Copiar plantilla y reemplazar placeholders
  const carpeta = DriveApp.getFolderById(CONFIG.OUTPUT_FOLDER_ID);
  const copia = DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID).makeCopy(nombreBase, carpeta);
  const doc = DocumentApp.openById(copia.getId());
  reemplazarEnDocumento(doc, datos);
  doc.saveAndClose();

  // Generar PDF si está configurado
  if (CONFIG.GENERAR_PDF) {
    const pdf = copia.getAs('application/pdf');
    carpeta.createFile(pdf).setName(nombreBase + '.pdf');
  }

  // Marcar fila como procesada
  if (CONFIG.MARCAR_PROCESADAS) {
    marcarFilaProcesada(sheet, numFila, encabezados, copia.getUrl());
  }
}

/**
 * Reemplaza todos los {{placeholders}} en el documento.
 * Funciona en el cuerpo, encabezado y pie de página.
 */
function reemplazarEnDocumento(doc, datos) {
  const cuerpo = doc.getBody();
  const encabezado = doc.getHeader();
  const pie = doc.getFooter();

  Object.entries(datos).forEach(([clave, valor]) => {
    const marcador = `{{${clave}}}`;
    cuerpo.replaceText(marcador, valor);
    if (encabezado) encabezado.replaceText(marcador, valor);
    if (pie) pie.replaceText(marcador, valor);
  });

  // Eliminar marcadores sin reemplazar que hayan quedado
  cuerpo.replaceText('\\{\\{[^}]+\\}\\}', '');
}

// -----------------------------------------------------------
//  UTILIDADES
// -----------------------------------------------------------

function obtenerHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error(`No se encontró la pestaña "${CONFIG.SHEET_NAME}". Verificá el nombre en CONFIG.SHEET_NAME.`);
  return sheet;
}

function filaVacia(fila) {
  return fila.every(celda => celda === '' || celda === null || celda === undefined);
}

/** Convierte el nombre de columna a clave para el placeholder: "Razón Social" → "razon_social" */
function normalizarClave(texto) {
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar tildes
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Formatea fechas y otros tipos para mostrar como texto legible. */
function formatearValor(valor) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  }
  if (valor === null || valor === undefined) return '';
  return String(valor);
}

function construirNombreArchivo(datos, numFila) {
  const claveNombre = normalizarClave(CONFIG.NOMBRE_COLUMNA);
  const empresa = datos[claveNombre] || `Fila_${numFila - 1}`;
  const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  return `${CONFIG.PREFIJO_ARCHIVO} — ${empresa} — ${fecha}`;
}

function marcarFilaProcesada(sheet, numFila, encabezados, urlDoc) {
  let colEstado = encabezados.indexOf(CONFIG.COLUMNA_ESTADO) + 1;

  // Si la columna no existe, crearla al final
  if (colEstado <= 0) {
    colEstado = sheet.getLastColumn() + 1;
    sheet.getRange(1, colEstado).setValue(CONFIG.COLUMNA_ESTADO);
  }

  const fechaHora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  const celda = sheet.getRange(numFila, colEstado);
  celda.setValue(`Generado ${fechaHora}`);
  if (urlDoc) {
    celda.setFormula(`=HYPERLINK("${urlDoc}","Generado ${fechaHora}")`);
  }
}

function mostrarMensaje(mensaje) {
  SpreadsheetApp.getUi().alert(mensaje);
}

// -----------------------------------------------------------
//  INSTRUCCIONES INTEGRADAS
// -----------------------------------------------------------
function mostrarInstrucciones() {
  const html = HtmlService.createHtmlOutput(`
    <style>body{font-family:Arial,sans-serif;font-size:13px;padding:10px;} h3{color:#1a73e8;} code{background:#f1f3f4;padding:2px 4px;border-radius:3px;} li{margin:6px 0;}</style>
    <h3>Instrucciones de configuración</h3>
    <ol>
      <li>Abrí el script (Extensiones → Apps Script) y completá la sección <code>CONFIG</code>:
        <ul>
          <li><b>TEMPLATE_DOC_ID</b>: ID del Google Doc plantilla</li>
          <li><b>OUTPUT_FOLDER_ID</b>: ID de la carpeta de Drive de destino</li>
          <li><b>SHEET_NAME</b>: nombre exacto de la pestaña con las respuestas</li>
          <li><b>NOMBRE_COLUMNA</b>: columna cuyo valor se usará para nombrar el archivo</li>
        </ul>
      </li>
      <li>En la plantilla, usá <code>{{nombre_columna}}</code> para insertar datos.<br>
        Ejemplo: si la columna se llama <i>Razón Social</i>, escribí <code>{{razon_social}}</code>.</li>
      <li>Para generar automáticamente al recibir un formulario, andá a <b>Disparadores</b> (reloj) y creá uno:
        Función <code>onFormSubmit</code> → Al enviar formulario.</li>
      <li>Guardá y ejecutá <b>Auditorias → Generar documentos (filas nuevas)</b>.</li>
    </ol>
    <p><b>Marcadores especiales disponibles en la plantilla:</b></p>
    <ul>
      <li><code>{{__fila__}}</code> → número de registro</li>
      <li><code>{{__fecha_generacion__}}</code> → fecha y hora de generación</li>
    </ul>
  `)
  .setTitle('Instrucciones')
  .setWidth(480)
  .setHeight(420);
  SpreadsheetApp.getUi().showModalDialog(html, 'Instrucciones');
}
