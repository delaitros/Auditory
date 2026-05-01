# Auditory — Constancia de Visita

Web app que reemplaza Google Forms: el auditor llena el formulario en el navegador,
el sistema guarda el registro en Google Sheets y genera un Google Doc listo para imprimir.

---

## Instalación (5 pasos)

### 1. Crear el proyecto en Apps Script

1. Ir a **[script.google.com](https://script.google.com)**
2. Clic en **Nuevo proyecto**
3. Ponerle un nombre: `Auditorias`

---

### 2. Copiar los archivos

En el editor de Apps Script hay un archivo `Código.gs` por defecto. Reemplazarlo con el contenido de cada archivo:

| Archivo del repo | Qué crear en Apps Script |
|---|---|
| `Code.gs` | Reemplazar el contenido de `Código.gs` |
| `Formulario.html` | **+** Archivo HTML nuevo → nombrar `Formulario` |
| `Configuracion.html` | **+** Archivo HTML nuevo → nombrar `Configuracion` |

Para agregar un archivo HTML: clic en el **+** junto a "Archivos" → seleccionar **HTML**.

> El archivo `appsscript.json` se actualiza yendo a
> **Configuración del proyecto** (ícono ⚙️) → activar "Mostrar archivo de manifiesto"
> y reemplazar el contenido con el de `appsscript.json`.

---

### 3. Guardar

`Ctrl + S` o el ícono de guardar. Google puede pedir que le pongas nombre al proyecto.

---

### 4. Publicar como web app

1. Clic en **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Configurar:
   - **Ejecutar como:** Yo (`tu-correo@gmail.com`)
   - **Quién tiene acceso:** Cualquier persona
4. Clic en **Implementar**
5. Aceptar los permisos que pide Google
6. **Copiar la URL** que aparece — esa es la dirección del formulario

---

### 5. Listo

Compartir la URL con los auditores. La primera vez que alguien envía una constancia,
el sistema crea automáticamente la hoja de cálculo dentro de la carpeta de Drive configurada.

---

## Lo que hace el sistema automáticamente

```
Auditor abre la URL → llena el formulario → Enviar
         ↓
  Guarda fila en Google Sheets  (se crea solo la primera vez)
         ↓
  Genera Google Doc desde la plantilla
         ↓
  "Abrir documento" → imprimir / archivar
```

---

## IDs configurados

| Recurso | ID |
|---|---|
| Google Doc plantilla | `1BhVRm-XSz8a3koPOA9QnQLAL2E2cqATIvqXnwShA3yU` |
| Carpeta de destino | `1_r1u39-DyCuqg3fhYGARKISQ0hsiaAC4` |
| Google Sheet | `1xHVDVMcgaSD8h56poDS01KXopMy6Fq9IehOYJRCICXs` |

Estos valores están pre-cargados en el script. Si en el futuro necesitás cambiarlos,
ir a **Auditorias → ⚙️ Configuración** dentro del Sheet generado.

---

## Marcadores para la plantilla Google Doc

| Campo | Marcador |
|---|---|
| Empresa | `{{empresa}}` |
| Establecimiento | `{{establecimiento}}` |
| Sector | `{{sector}}` |
| Actividades desarrolladas | `{{actividades_desarrolladas}}` |
| Desvíos observados | `{{desvios_observados}}` |
| Comentarios | `{{comentarios}}` |
| Auditor | `{{auditor}}` |
| Fecha de la visita | `{{fecha_de_la_visita}}` |
| Hora de la visita | `{{hora_de_la_visita}}` |
| Nro. de registro | `{{__fila__}}` |
| Fecha de generación | `{{__fecha_generacion__}}` |

---

## Problemas frecuentes

| Problema | Solución |
|---|---|
| Error al publicar | Asegurarse de aceptar todos los permisos que pide Google |
| El marcador no se reemplaza | Verificar que esté escrito exactamente igual (minúsculas, sin tildes, espacios → guiones bajos) |
| No genera PDF | Verificar que `GENERAR_PDF` esté en `true` en la configuración |
