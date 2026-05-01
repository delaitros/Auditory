# Auditory — Generador de documentos desde Google Forms

Genera automáticamente un Google Doc (y opcionalmente un PDF) por cada respuesta de auditoría recibida en Google Forms, listo para imprimir y archivar físicamente.

---

## Cómo funciona

```
Google Form → Google Sheet (una fila por respuesta)
                    ↓  Apps Script
         Google Doc por fila (desde plantilla)
                    ↓
                  PDF  →  imprimir y archivar
```

---

## Instalación paso a paso

### 1. Crear la plantilla

1. Creá un **Google Doc** nuevo con el diseño del documento que querés imprimir (membrete, logotipo, campos, etc.).
2. Donde quieras insertar datos del formulario, escribí el nombre de la columna entre llaves dobles:
   - Si la columna se llama `Empresa` → escribí `{{empresa}}`
   - Si la columna se llama `Razón Social` → escribí `{{razon_social}}`
   - Si la columna se llama `Fecha de visita` → escribí `{{fecha_de_visita}}`
3. Anotá el **ID del documento** (está en la URL entre `/d/` y `/edit`).

**Marcadores especiales disponibles:**
| Marcador | Contenido |
|---|---|
| `{{__fila__}}` | Número de registro |
| `{{__fecha_generacion__}}` | Fecha y hora en que se generó el documento |

---

### 2. Preparar la carpeta de destino

1. Creá una carpeta en Google Drive donde se guardarán los documentos generados.
2. Anotá el **ID de la carpeta** (está al final de la URL de la carpeta).

---

### 3. Instalar el script en el Google Sheet

1. Abrí el Google Sheet con las respuestas del formulario.
2. Andá a **Extensiones → Apps Script**.
3. Borrá el contenido del archivo `Código.gs` y pegá el contenido de `Code.gs` de este repositorio.
4. Creá un archivo nuevo llamado `appsscript.json` (o editá el existente habilitando "Mostrar archivo de manifiesto" en la configuración del proyecto) y pegá el contenido de `appsscript.json`.

---

### 4. Configurar

Al inicio de `Code.gs` completá el bloque `CONFIG`:

```javascript
const CONFIG = {
  TEMPLATE_DOC_ID: 'ID_DE_TU_PLANTILLA',      // ← ID del Google Doc plantilla
  OUTPUT_FOLDER_ID: 'ID_DE_TU_CARPETA',        // ← ID de la carpeta de Drive
  SHEET_NAME: 'Respuestas de formulario 1',    // ← Nombre de la pestaña del Sheet
  NOMBRE_COLUMNA: 'Empresa',                   // ← Columna para nombrar el archivo
  PREFIJO_ARCHIVO: 'Auditoria',                // ← Prefijo del nombre del archivo
  GENERAR_PDF: true,                           // ← true: también genera PDF
  MARCAR_PROCESADAS: true,                     // ← true: marca filas ya procesadas
  COLUMNA_ESTADO: 'Documento generado',        // ← Nombre de la columna de estado
};
```

---

### 5. Autorizar el script

1. Guardá el script (Ctrl+S).
2. Ejecutá cualquier función (por ejemplo `onOpen`) y aceptá los permisos que pide Google.

---

### 6. Usar

Al volver al Sheet aparece el menú **Auditorias** con las opciones:

| Opción | Qué hace |
|---|---|
| Generar documentos (filas nuevas) | Solo procesa filas que todavía no tienen documento |
| Generar documento — fila seleccionada | Procesa solo la fila donde está el cursor |
| Generar TODOS los documentos | Reprocesa todas las filas |
| Ver instrucciones | Abre la ayuda dentro del Sheet |

---

### 7. Automatizar (opcional)

Para generar el documento automáticamente cada vez que alguien completa el formulario:

1. En Apps Script andá a **Disparadores** (ícono de reloj).
2. Creá un disparador nuevo:
   - Función: `onFormSubmit`
   - Origen del evento: **Desde hoja de cálculo**
   - Tipo de evento: **Al enviar formulario**
3. Guardá.

A partir de ahí, cada nueva respuesta genera su documento de forma automática.

---

## Plantilla para Constancia de Visita

El archivo `plantilla_constancia_de_visita.txt` contiene el texto exacto a copiar en el Google Doc plantilla.

Los marcadores corresponden a los campos del formulario así:

| Campo en el formulario | Marcador en la plantilla |
|---|---|
| Empresa | `{{empresa}}` |
| Establecimiento | `{{establecimiento}}` |
| Sector | `{{sector}}` |
| actividades desarrolladas | `{{actividades_desarrolladas}}` |
| desvios observados | `{{desvios_observados}}` |
| comentarios | `{{comentarios}}` |
| auditor | `{{auditor}}` |
| fecha de la visita | `{{fecha_de_la_visita}}` |
| hora de la visita | `{{hora_de_la_visita}}` |
| Nro. de registro | `{{__fila__}}` |
| Fecha/hora de generación | `{{__fecha_generacion__}}` |

> **Regla de conversión:** el nombre de la columna del Sheet se convierte a minúsculas,
> las tildes se eliminan y los espacios se reemplazan por guiones bajos.
> Ejemplo: `"fecha de la visita"` → `{{fecha_de_la_visita}}`

---

## Problemas frecuentes

| Problema | Solución |
|---|---|
| "No se encontró la pestaña..." | Verificar que `SHEET_NAME` coincida exactamente con el nombre de la pestaña |
| El marcador no se reemplaza | Verificar que el nombre de la columna, normalizado (minúsculas, sin tildes, espacios → guión bajo), coincida con el marcador en la plantilla |
| Error de permisos | Volver a ejecutar el script y aceptar los permisos de Google |
