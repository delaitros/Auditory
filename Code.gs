// ============================================================
//  AUDITORIAS — Portal + Web App + Generador de Documentos  v5.1
// ============================================================

// -----------------------------------------------------------
//  DATOS DEL PORTAL
// -----------------------------------------------------------
const EMPRESAS = [
  'ABC Industrial', 'Abelardo de la Vega', 'AJ Tendlarz',
  'Alianza Sotavento', 'Astillero al Sur', 'Biofoods Argentina',
  'Ce.Me.Es', 'Cerámica Etchehon', 'Clínica Veterinaria Integral',
  'CyESAS', 'Cymseg', 'Daniel Fanti', 'Denis Musielack', 'Dibac',
  'Dislac SRL', 'EDASA', 'Emprendimiento Rio Chubut', 'Fapre',
  'Fuhrmann SA', 'Gas Trelew', 'Gimap', 'Jorge Lino', 'Jorge Martinez',
  'La Casa del Pan', 'La Ermita', 'MIDA', 'Mistura', 'Mundo Madera',
  'Puerto Rawson Patagonia', 'Pyg Servicios Generales', 'Rubén Centeno',
  'Servimar', 'Sofimed', 'Soltex', 'Tacme SRL', 'Transporte MZ',
  'Unilan Trelew SA', 'Zanotti S.A',
];

const AUDITORES = ['Félix Raúl Vidal', 'Valeria'];

const FORMULARIOS = [
  { id: 'constancia', nombre: 'Constancia de Visita' },
  { id: 'audi1',  nombre: 'AUDI 1 — Higiene y Seguridad en el Trabajo' },
  { id: 'audi2',  nombre: 'AUDI 2 — Medicina del Trabajo' },
  { id: 'audi3',  nombre: 'AUDI 3 — Herramientas' },
  { id: 'audi4',  nombre: 'AUDI 4 — Máquinas' },
  { id: 'audi5',  nombre: 'AUDI 5 — Espacios de Trabajo' },
  { id: 'audi6',  nombre: 'AUDI 6 — Ergonomía' },
  { id: 'audi7',  nombre: 'AUDI 7 — Protección contra Incendios' },
  { id: 'audi8',  nombre: 'AUDI 8 — Almacenaje' },
  { id: 'audi9',  nombre: 'AUDI 9 — Almacenaje de Sustancias Peligrosas' },
  { id: 'audi10', nombre: 'AUDI 10 — Sustancias Peligrosas' },
  { id: 'audi11', nombre: 'AUDI 11 — Riesgo Eléctrico' },
  { id: 'audi12', nombre: 'AUDI 12 — Aparatos Sometidos a Presión' },
  { id: 'audi13', nombre: 'AUDI 13 — EPP' },
  { id: 'audi14', nombre: 'AUDI 14 — Iluminación y Color' },
  { id: 'audi15', nombre: 'AUDI 15 — Condiciones Higrotérmicas' },
  { id: 'audi16', nombre: 'AUDI 16 — Radiaciones Ionizantes' },
  { id: 'audi17', nombre: 'AUDI 17 — Láseres' },
  { id: 'audi18', nombre: 'AUDI 18 — Radiaciones No Ionizantes' },
  { id: 'audi19', nombre: 'AUDI 19 — Provisión de Agua' },
  { id: 'audi20', nombre: 'AUDI 20 — Desagües Industriales' },
  { id: 'audi21', nombre: 'AUDI 21 — Baños, Vestuarios y Comedor' },
  { id: 'audi22', nombre: 'AUDI 22 — Aparatos para Izar, Montacargas y Ascensores' },
  { id: 'audi23', nombre: 'AUDI 23 — Capacitación' },
  { id: 'audi24', nombre: 'AUDI 24 — Primeros Auxilios' },
  { id: 'audi25', nombre: 'AUDI 25 — Vehículos' },
  { id: 'audi26', nombre: 'AUDI 26 — Contaminación Ambiental' },
  { id: 'audi27', nombre: 'AUDI 27 — Ruidos' },
  { id: 'audi28', nombre: 'AUDI 28 — Ultrasonido e Infrasonido' },
  { id: 'audi29', nombre: 'AUDI 29 — Vibraciones' },
  { id: 'audi30', nombre: 'AUDI 30 — Utilización de Gases' },
  { id: 'audi31', nombre: 'AUDI 31 — Soldadura' },
  { id: 'audi32', nombre: 'AUDI 32 — Escaleras' },
  { id: 'audi33', nombre: 'AUDI 33 — Mantenimiento Preventivo' },
  { id: 'audi34', nombre: 'AUDI 34 — Otras Resoluciones Legales' },
  { id: 'audi_obra', nombre: 'CONSTANCIA VISITA A OBRA' },
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

function verificar6Meses(empresa, idFormulario) {
  const cfg = getConfig();
  if (!cfg.SPREADSHEET_ID) return { encontrado: false };
  const ss    = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Registro');
  if (!sheet || sheet.getLastRow() <= 1) return { encontrado: false };
  const datos = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);
  const empresaNorm = empresa.toString().toLowerCase().trim();
  for (const fila of datos) {
    const [fechaVal, empresaReg, formularioReg,, auditorReg] = fila;
    if (!fechaVal) continue;
    const fecha = new Date(fechaVal);
    if (fecha >= hace6Meses &&
        empresaReg.toString().toLowerCase().trim() === empresaNorm &&
        formularioReg.toString() === idFormulario) {
      return {
        encontrado: true,
        fecha:   Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
        auditor: auditorReg.toString(),
      };
    }
  }
  return { encontrado: false };
}

function registrarEnMaestro(empresa, idFormulario, nombreFormulario, auditor) {
  const cfg = getConfig();
  const ss  = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Registro');
  if (!sheet || sheet.getLastRow() === 0) {
    sheet = sheet || ss.insertSheet('Registro');
    sheet.appendRow(['Fecha', 'Empresa', 'ID Formulario', 'Nombre Formulario', 'Auditor']);
    sheet.getRange(1, 1, 1, 5)
      .setBackground('#4a148c').setFontColor('#ffffff').setFontWeight('bold');
  }
  sheet.appendRow([new Date(), empresa, idFormulario, nombreFormulario, auditor]);
  return { ok: true };
}

// -----------------------------------------------------------
//  CONSTANCIA DE VISITA
// -----------------------------------------------------------
function procesarFormulario(datos) {
  const cfg   = getConfig();
  const sheet = obtenerHoja(cfg);
  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(construirFila(encabezados, datos));
  const numFila = sheet.getLastRow();
  const urlDoc  = generarDocumento(numFila, cfg, sheet);
  registrarEnMaestro(datos.empresa, 'constancia', 'Constancia de Visita', datos.auditor);
  return {
    ok: true,
    urlDoc:     urlDoc,
    urlCarpeta: 'https://drive.google.com/drive/folders/' + cfg.OUTPUT_FOLDER_ID,
  };
}

// -----------------------------------------------------------
//  FORMULARIOS AUDI
// -----------------------------------------------------------
// Paso 1: solo planilla — retorna en < 5 s, siempre dispara withSuccessHandler
function guardarAudiEnPlanilla(datos) {
  const cfg = getConfig();
  const ss  = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);

  let sheetName = datos.formNombre.replace(/[\/\\?*\[\]:]/g, '-');
  if (sheetName.length > 100) sheetName = sheetName.substring(0, 100);

  let sheet = ss.getSheetByName(sheetName);
  const isNew = !sheet || sheet.getLastRow() === 0;
  if (!sheet) sheet = ss.insertSheet(sheetName);

  const baseHeaders = ['Marca temporal', 'Empresa', 'Establecimiento', 'Sector', 'Auditor', 'Fecha'];
  const extraHeaders = datos.extras.map(function(e) { return e.label; });
  const pregHeaders  = datos.respuestas.map(function(r) { return r.pregunta; });
  const allHeaders   = baseHeaders.concat(extraHeaders).concat(pregHeaders).concat(['Comentarios', 'Documento']);

  if (isNew) {
    sheet.appendRow(allHeaders);
    sheet.getRange(1, 1, 1, allHeaders.length)
      .setBackground('#4a148c').setFontColor('#ffffff').setFontWeight('bold');
  }

  const comentarios = datos.comentarios || datos.observaciones || '';
  const baseRow = [new Date(), datos.empresa, datos.establecimiento, datos.sector, datos.auditor, datos.fecha];
  const extraRow = datos.extras.map(function(e) { return e.valor; });
  const respRow  = datos.respuestas.map(function(r) { return r.valor; });
  sheet.appendRow(baseRow.concat(extraRow).concat(respRow).concat([comentarios, '']));
  const fila = sheet.getLastRow();

  try { registrarEnMaestro(datos.empresa, datos.formId, datos.formNombre, datos.auditor); } catch(e) {}

  return { ok: true, sheetName: sheetName, fila: fila, colDoc: allHeaders.length };
}

// Paso 2: solo generación del doc — se llama en background, el éxito ya fue mostrado
function generarDocAudi(datos, sheetName, fila, colDoc) {
  const cfg = getConfig();
  const urlDoc = generarDocumentoAudi(datos, cfg);
  if (urlDoc) {
    const ss = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
    ss.getSheetByName(sheetName).getRange(fila, colDoc).setValue(urlDoc);
  }
  return { ok: true, urlDoc: urlDoc };
}

// Mantener para compatibilidad
function procesarAudi(datos) {
  const r = guardarAudiEnPlanilla(datos);
  return generarDocAudi(datos, r.sheetName, r.fila, r.colDoc);
}

function generarDocVisitaObra_DEPRECATED(datos, cfg) {
  const fecha    = datos.fecha || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const fechaStr = fecha.replace(/-/g, '');
  const fechaLeg = fecha.split('-').reverse().join('/');
  const carpeta  = DriveApp.getFolderById(cfg.OUTPUT_FOLDER_ID);
  const nombreBase = 'CONSTANCIA VISITA A OBRA — ' + datos.empresa + ' — ' + fechaStr;

  const ss     = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
  let shName   = datos.formNombre.replace(/[\/\\?*\[\]:]/g, '-');
  if (shName.length > 100) shName = shName.substring(0, 100);
  const sheet  = ss.getSheetByName(shName);
  const numReg = sheet ? String(Math.max(sheet.getLastRow() - 1, 1)) : '1';

  function getExtra(label) {
    const e = datos.extras.filter(function(x){ return x.label === label; })[0];
    return e ? e.valor : '';
  }
  const obraVal        = getExtra('Obra') || datos.establecimiento || '';
  const trabajadoresVal = getExtra('Trabajadores en altura habilitados');

  const ETIQUETAS = { 'cumple': 'CUMPLE', 'no cumple': 'NO CUMPLE', 'no aplica': 'NO APLICA' };
  const COLORES   = { 'cumple': '#137333', 'no cumple': '#c5221f', 'no aplica': '#3949ab' };
  const TEAL      = '#00838f';
  const CENTER    = DocumentApp.HorizontalAlignment.CENTER;
  const LEFT      = DocumentApp.HorizontalAlignment.LEFT;
  const A         = DocumentApp.Attribute;

  const doc  = DocumentApp.create(nombreBase);
  const body = doc.getBody();
  body.setMarginTop(28).setMarginBottom(36).setMarginLeft(50).setMarginRight(50);

  // ── Cabecera compacta ──
  var attrs8 = {}; attrs8[A.FONT_SIZE] = 8; attrs8[A.SPACING_AFTER] = 1; attrs8[A.SPACING_BEFORE] = 0;
  var attrsTeal = {}; attrsTeal[A.FONT_SIZE] = 11; attrsTeal[A.BOLD] = true;
    attrsTeal[A.FOREGROUND_COLOR] = TEAL; attrsTeal[A.SPACING_AFTER] = 1; attrsTeal[A.SPACING_BEFORE] = 0;

  body.appendParagraph('Félix Raúl Vidal').setAttributes(attrsTeal);
  body.appendParagraph('Ingeniero Químico mat. CPIT 1461 / CPIQ 2848 | Especialista en Higiene y Seguridad Laboral RUGU 1853 COHSECH P007').setAttributes(attrs8);
  body.appendParagraph('Consultor Ambiental Reg. SAyCDS 358 | Especialista en Desgasificación de Buques (PNA) | Especialista en instalaciones de gases medicinales').setAttributes(attrs8);
  body.appendParagraph('Especialista en aparatos sometidos a presión | Especialista en equipos de izaje | Tel: 2804581369 | felixraul@gmail.com').setAttributes(attrs8);

  var attrsShs = {}; attrsShs[A.FONT_SIZE] = 12; attrsShs[A.BOLD] = true;
    attrsShs[A.FOREGROUND_COLOR] = TEAL; attrsShs[A.SPACING_AFTER] = 2; attrsShs[A.SPACING_BEFORE] = 6;
  body.appendParagraph('SERVICIO DE HIGIENE Y SEGURIDAD').setAttributes(attrsShs).setAlignment(CENTER);

  var attrsEmp = {}; attrsEmp[A.FONT_SIZE] = 10; attrsEmp[A.SPACING_AFTER] = 4; attrsEmp[A.SPACING_BEFORE] = 0;
  body.appendParagraph(datos.empresa).setAttributes(attrsEmp).setAlignment(CENTER);

  // ── Título ──
  var attrsTit = {}; attrsTit[A.FONT_SIZE] = 14; attrsTit[A.BOLD] = true;
    attrsTit[A.SPACING_AFTER] = 2; attrsTit[A.SPACING_BEFORE] = 4;
  body.appendParagraph('CONSTANCIA DE VISITA').setAttributes(attrsTit).setAlignment(CENTER);

  var attrsSubTit = {}; attrsSubTit[A.FONT_SIZE] = 10; attrsSubTit[A.SPACING_AFTER] = 6; attrsSubTit[A.SPACING_BEFORE] = 0;
  body.appendParagraph('CONSTANCIA VISITA A OBRA').setAttributes(attrsSubTit).setAlignment(CENTER);

  // ── Datos de la visita ──
  function campo(label, value) {
    const p   = body.appendParagraph('');
    const txt = label + ': ' + (value || '—');
    p.editAsText().insertText(0, txt);
    p.editAsText().setBold(0, label.length, true);
    var a = {}; a[A.FONT_SIZE] = 10; a[A.SPACING_AFTER] = 2; a[A.SPACING_BEFORE] = 0;
    p.setAttributes(a);
  }
  campo('Empresa', datos.empresa);
  campo('Obra', obraVal);
  campo('Sector', datos.sector);
  campo('Auditor', datos.auditor);
  campo('Fecha de la visita', fechaLeg);
  if (trabajadoresVal) campo('Trabajadores en altura habilitados', trabajadoresVal);

  // ── Respuestas ──
  var attrsSec = {}; attrsSec[A.FONT_SIZE] = 10; attrsSec[A.BOLD] = true;
    attrsSec[A.FOREGROUND_COLOR] = TEAL; attrsSec[A.SPACING_BEFORE] = 6; attrsSec[A.SPACING_AFTER] = 4;
  body.appendParagraph('ACTIVIDADES DESARROLLADAS / RESPUESTAS').setAttributes(attrsSec);

  var attrsResp = {}; attrsResp[A.FONT_SIZE] = 10; attrsResp[A.SPACING_AFTER] = 2; attrsResp[A.SPACING_BEFORE] = 0;
  datos.respuestas.forEach(function(r, i) {
    const etq = ' → ' + (ETIQUETAS[r.valor] || r.valor.toUpperCase());
    const txt = (i + 1) + '. ' + r.pregunta + etq;
    const p   = body.appendParagraph(txt);
    const st  = txt.length - etq.length;
    p.editAsText().setForegroundColor(st, txt.length - 1, COLORES[r.valor] || '#000000');
    p.editAsText().setBold(st, txt.length - 1, true);
    p.setAttributes(attrsResp);
  });

  // ── Desvíos para corregir ──
  body.appendParagraph('DESVÍOS PARA CORREGIR').setAttributes(attrsSec);
  var attrsTxt = {}; attrsTxt[A.FONT_SIZE] = 10; attrsTxt[A.SPACING_AFTER] = 4; attrsTxt[A.SPACING_BEFORE] = 0;
  body.appendParagraph(datos.comentarios || datos.observaciones || '').setAttributes(attrsTxt);

  // ── Comentarios (en blanco para escribir) ──
  body.appendParagraph('COMENTARIOS').setAttributes(attrsSec);
  var attrsBlank = {}; attrsBlank[A.FONT_SIZE] = 10; attrsBlank[A.SPACING_AFTER] = 36; attrsBlank[A.SPACING_BEFORE] = 0;
  body.appendParagraph('').setAttributes(attrsBlank);

  // ── Firma ──
  body.appendParagraph('_________________________________').setAlignment(LEFT).setSpacingAfter(2).setSpacingBefore(0);
  var attrsFirma = {}; attrsFirma[A.FONT_SIZE] = 10; attrsFirma[A.BOLD] = true; attrsFirma[A.SPACING_AFTER] = 1; attrsFirma[A.SPACING_BEFORE] = 0;
  body.appendParagraph('Firma del auditor:').setAttributes(attrsFirma);
  body.appendParagraph(datos.auditor).setSpacingAfter(0).setSpacingBefore(0);

  // ── Pie ──
  const fechaGen = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  var attrsPie = {}; attrsPie[A.FONT_SIZE] = 8; attrsPie[A.FOREGROUND_COLOR] = '#888888';
    attrsPie[A.SPACING_BEFORE] = 6; attrsPie[A.SPACING_AFTER] = 0;
  body.appendParagraph('Nro. de registro: ' + numReg + '   Fecha: ' + fechaGen + '   ' + datos.auditor).setAttributes(attrsPie).setAlignment(CENTER);

  doc.saveAndClose();
  const archivo = DriveApp.getFileById(doc.getId());
  carpeta.addFile(archivo);
  DriveApp.getRootFolder().removeFile(archivo);
  if (cfg.GENERAR_PDF) {
    carpeta.createFile(archivo.getAs('application/pdf')).setName(nombreBase + '.pdf');
  }
  return archivo.getUrl();
}

function generarDocumentoAudi(datos, cfg) {
  const fecha      = datos.fecha || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const fechaStr   = fecha.replace(/-/g, '');
  const fechaLeg   = fecha.split('-').reverse().join('/');
  const carpeta    = DriveApp.getFolderById(cfg.OUTPUT_FOLDER_ID);
  const nombreBase = datos.formNombre + ' — ' + datos.empresa + ' — ' + fechaStr;

  // Número de registro: contar filas existentes en la pestaña del formulario
  const ss = SpreadsheetApp.openById(cfg.SPREADSHEET_ID);
  let sheetName = datos.formNombre.replace(/[\/\\?*\[\]:]/g, '-');
  if (sheetName.length > 100) sheetName = sheetName.substring(0, 100);
  const sheet = ss.getSheetByName(sheetName);
  const numRegistro = sheet ? String(Math.max(sheet.getLastRow() - 1, 1)) : '1';

  // Armar bloque de respuestas como texto plano
  const ETIQUETAS = { 'cumple': 'CUMPLE', 'no cumple': 'NO CUMPLE', 'no aplica': 'NO APLICA' };
  const respuestasTexto = datos.respuestas.map(function(r, i) {
    return (i + 1) + '. ' + r.pregunta + ' → ' + (ETIQUETAS[r.valor] || r.valor.toUpperCase());
  }).join('\n');

  // Campo extra (Herramienta, Máquina, etc.) como texto
  const campoExtra = datos.extras.map(function(e) { return e.label + ': ' + e.valor; }).join(' | ') || '';

  // Usar plantilla AUDI correspondiente
  const templateId = (datos.formId === 'audi_obra') ? cfg.AUDI_OBRA_TEMPLATE_DOC_ID : cfg.AUDI_TEMPLATE_DOC_ID;
  if (templateId) {
    // ── Modo plantilla: copiar y reemplazar marcadores ──
    const copia = DriveApp.getFileById(templateId).makeCopy(nombreBase, carpeta);
    const doc   = DocumentApp.openById(copia.getId());
    const partes = [doc.getBody(), doc.getHeader(), doc.getFooter()];

    const obraExtra         = datos.extras.filter(function(e){ return e.label === 'Obra'; })[0];
    const trabajadoresExtra = datos.extras.filter(function(e){ return e.label === 'Trabajadores en altura habilitados'; })[0];
    const marcadores = {
      'formulario':           datos.formNombre,
      'empresa':              datos.empresa,
      'establecimiento':      datos.establecimiento,
      'obra':                 obraExtra ? obraExtra.valor : (datos.establecimiento || ''),
      'sector':               datos.sector,
      'campo_extra':          campoExtra,
      'auditor':              datos.auditor,
      'fecha':                fechaLeg,
      'fecha_de_la_visita':   fechaLeg,
      'trabajadores':         trabajadoresExtra ? trabajadoresExtra.valor : '',
      'respuestas':           respuestasTexto,
      'observaciones':        datos.comentarios || datos.observaciones || '',
      'comentarios':          datos.comentarios || datos.observaciones || '',
      'numRegistro':          numRegistro,
      '__fila__':             numRegistro,
      '__fecha_generacion__': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
    };

    Object.entries(marcadores).forEach(function([k, v]) {
      partes.forEach(function(p) { if (p) p.replaceText('{{' + k + '}}', v); });
    });
    // Limpiar marcadores sin reemplazar
    doc.getBody().replaceText('\\{\\{[^}]+\\}\\}', '');
    doc.saveAndClose();

    if (cfg.GENERAR_PDF) {
      carpeta.createFile(copia.getAs('application/pdf')).setName(nombreBase + '.pdf');
    }
    return copia.getUrl();

  } else {
    // ── Modo sin plantilla: generar doc por código ──
    const doc  = DocumentApp.create(nombreBase);
    const body = doc.getBody();
    body.setMarginTop(40).setMarginBottom(40).setMarginLeft(50).setMarginRight(50);

    body.appendParagraph('Félix Raúl Vidal — Ing. Químico')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph('Mat. CPIT 1461 / CPIQ 2848 — Servicio de Higiene y Seguridad')
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph('');
    body.appendParagraph(datos.formNombre.toUpperCase())
      .setHeading(DocumentApp.ParagraphHeading.HEADING1)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph('');

    [['Empresa', datos.empresa], ['Establecimiento', datos.establecimiento],
     ['Sector', datos.sector], ['Auditor', datos.auditor], ['Fecha', fechaLeg],
     ['Nro. de registro', numRegistro]
    ].concat(datos.extras.map(function(e) { return [e.label, e.valor]; }))
     .forEach(function(par) {
       const p = body.appendParagraph('');
       p.editAsText().insertText(0, par[0] + ': ' + (par[1] || '—'));
       p.editAsText().setBold(0, par[0].length, true);
       p.setSpacingAfter(4);
     });

    body.appendParagraph('');
    body.appendParagraph('CUMPLIMIENTO').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('');

    const COLORES = { 'cumple': '#137333', 'no cumple': '#c5221f', 'no aplica': '#3949ab' };
    datos.respuestas.forEach(function(r, i) {
      const etq = ' [' + (ETIQUETAS[r.valor] || r.valor.toUpperCase()) + ']';
      const txt = (i + 1) + '. ' + r.pregunta + etq;
      const p   = body.appendParagraph('');
      const t   = p.editAsText().insertText(0, txt);
      const startEtq = txt.length - etq.length;
      p.editAsText().setForegroundColor(startEtq, txt.length - 1, COLORES[r.valor] || '#000000');
      p.editAsText().setBold(startEtq, txt.length - 1, true);
      p.setSpacingAfter(5);
    });

    const textoComent = datos.comentarios || datos.observaciones || '';
    if (textoComent.trim()) {
      body.appendParagraph('');
      body.appendParagraph('COMENTARIOS').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('');
      body.appendParagraph(textoComent);
    }

    body.appendParagraph('');
    body.appendParagraph('_________________________________').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph(datos.auditor).setAlignment(DocumentApp.HorizontalAlignment.CENTER).editAsText().setBold(true);

    doc.saveAndClose();
    const archivo = DriveApp.getFileById(doc.getId());
    carpeta.addFile(archivo);
    DriveApp.getRootFolder().removeFile(archivo);
    if (cfg.GENERAR_PDF) {
      carpeta.createFile(archivo.getAs('application/pdf')).setName(nombreBase + '.pdf');
    }
    return archivo.getUrl();
  }
}

// -----------------------------------------------------------
//  CONFIGURACIÓN
// -----------------------------------------------------------
function getConfig() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return {
    TEMPLATE_DOC_ID:      props.TEMPLATE_DOC_ID      || '1BhVRm-XSz8a3koPOA9QnQLAL2E2cqATIvqXnwShA3yU',
    AUDI_TEMPLATE_DOC_ID:      props.AUDI_TEMPLATE_DOC_ID      || '1G4fKnijZafWGN4EMejAVlGAXcR3YJFsNyr93EyP4L58',
    AUDI_OBRA_TEMPLATE_DOC_ID: props.AUDI_OBRA_TEMPLATE_DOC_ID || '1-Njw9p9SvQw9Ve3I5SFi87x3UlrrzpxaMKsQVkgmXhc',
    OUTPUT_FOLDER_ID:  props.OUTPUT_FOLDER_ID  || '1pPxD8Viwpe3VRfXKkUJoaQxQwRsQQQ4D',
    SPREADSHEET_ID:    props.SPREADSHEET_ID    || '1iLuTS5s5xgQprIA9vwcEAUDvn25FjuKM660nuEf-zXU',
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
    TEMPLATE_DOC_ID:      extraerId(datos.templateUrl),
    AUDI_TEMPLATE_DOC_ID: extraerId(datos.auditTemplateUrl || ''),
    OUTPUT_FOLDER_ID:     extraerId(datos.folderUrl),
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
  const hojas    = ss ? ss.getSheets().map(function(s) { return s.getName(); }) : [cfg.SHEET_NAME];
  const columnas = ss ? listarColumnas(ss, cfg.SHEET_NAME) : [];
  return {
    templateUrl:      'https://docs.google.com/document/d/' + cfg.TEMPLATE_DOC_ID + '/edit',
    auditTemplateUrl: cfg.AUDI_TEMPLATE_DOC_ID ? 'https://docs.google.com/document/d/' + cfg.AUDI_TEMPLATE_DOC_ID + '/edit' : '',
    folderUrl:        'https://drive.google.com/drive/folders/' + cfg.OUTPUT_FOLDER_ID,
    spreadsheetUrl:   cfg.SPREADSHEET_ID ? 'https://docs.google.com/spreadsheets/d/' + cfg.SPREADSHEET_ID + '/edit' : '',
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
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(function(v) { return v !== ''; });
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
//  CONSTRUCCIÓN DE FILA (constancia)
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
  if (filaVacia(encabezados)) return Object.values(mapa);
  return encabezados.map(function(col) { return mapa[col.toString().toLowerCase()] !== undefined ? mapa[col.toString().toLowerCase()] : ''; });
}

// -----------------------------------------------------------
//  GENERACIÓN DEL DOCUMENTO (constancia)
// -----------------------------------------------------------
function generarDocumento(numFila, cfg, sheet) {
  const encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const valores     = sheet.getRange(numFila, 1, 1, sheet.getLastColumn()).getValues()[0];
  const datosDoc = {};
  encabezados.forEach(function(col, idx) {
    if (col) datosDoc[normalizarClave(col)] = formatearValor(valores[idx]);
  });
  datosDoc['__fila__'] = String(numFila - 1);
  datosDoc['__fecha_generacion__'] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  const empresa    = datosDoc[normalizarClave(cfg.NOMBRE_COLUMNA)] || ('Registro_' + (numFila - 1));
  const fecha      = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  const nombreBase = cfg.PREFIJO_ARCHIVO + ' — ' + empresa + ' — ' + fecha;
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
  Object.entries(datos).forEach(function([k, v]) {
    partes.forEach(function(p) { if (p) p.replaceText('{{' + k + '}}', v); });
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
  sheet.getRange(numFila, col).setFormula('=HYPERLINK("' + urlDoc + '","Generado ' + ts + '")');
}

// -----------------------------------------------------------
//  UTILIDADES
// -----------------------------------------------------------
function filaVacia(fila) {
  return fila.every(function(c) { return c === '' || c === null || c === undefined; });
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
