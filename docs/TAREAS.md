# Cola de Tareas (Backlog & Roadmap)

Este archivo gestiona las tareas atómicas a ejecutar mediante subagentes en ramas aisladas (`workspace branch`), siguiendo el flujo de revisión, validación y merge a `main`.

---

## Tareas

### [TASK-001] Añadir suite de comprobación de sintaxis e integridad estática
- **ID**: `TASK-001`
- **Objetivo**: Crear un script ligero de verificación para validar que `script.js`, `index.html` y `data.json` no tengan errores de sintaxis o JSON malformado antes de cada merge.
- **Archivos que toca**: `test-syntax.js`
- **Criterios de Aceptación**:
  - Comando ejecutable de verificación local (`node test-syntax.js`).
  - Validación de parsing de `data.json`.
  - Validación de sintaxis de archivos `.js`.
- **Estado**: Completada (Merged a main)

---

### [TASK-005] Desvincular data.json privado y crear plantilla pública
- **ID**: `TASK-005`
- **Objetivo**: Eliminar del seguimiento `data.json` privado, crear `ejemplo-catalogo.json` como plantilla de ejemplo y adaptar `test-syntax.js` para que la comprobación no falle si `data.json` no existe.
- **Archivos que toca**: `data.json` (eliminado), `ejemplo-catalogo.json` (nuevo), `test-syntax.js`
- **Criterios de Aceptación**:
  - `data.json` ya no existe en el repositorio.
  - `ejemplo-catalogo.json` contiene la estructura canónica esperada (`author`, `title`, `date`, `technique`, `measurements`, `asset_number`).
  - `node test-syntax.js` pasa con código 0.
- **Estado**: Completada (Merged a main)

---

### [TASK-006] Catálogo Local en Navegador e Importación Masiva
- **ID**: `TASK-006`
- **Objetivo**: Permitir al usuario cargar su catálogo de obras en formato JSON directamente desde la UI, almacenarlo en `localStorage` (o memoria) y conectar el buscador `searchAssetBtn` a ese almacén local en lugar de `fetch('data.json')`.
- **Archivos que toca**: `index.html`, `script.js`, `style.css`
- **Criterios de Aceptación**:
  - Botón en UI para "Cargar Catálogo de Obras (.json)" con feedback visual.
  - Si el catálogo está cargado, buscar por Nro. de Bien autocompleta el formulario.
  - Si no hay catálogo cargado, modal o mensaje claro explicando cómo importar uno o usar la plantilla.
- **Estado**: Completada (Merged a main)

---

### [TASK-002] Modularizar helpers matemáticos y cálculo de grilla de PDF
- **ID**: `TASK-002`
- **Objetivo**: Extraer la lógica pura de cálculo de distribución de etiquetas en hoja Letter/A4 y conversión de CM/PX/MM a un módulo de utilidad comprobable (`js/grid-calculator.js`).
- **Archivos que toca**: `js/grid-calculator.js` (nuevo), `index.html`, `script.js`
- **Criterios de Aceptación**:
  - Funciones puras independientes del DOM (`calculatePageGrid`, `cmToMm`, `cmToPx`).
  - No altera el comportamiento existente de renderizado ni generación de PDF.
  - Verificado con `test-syntax.js` y test unitario en el propio módulo o suite de comprobación.
- **Estado**: Completada (Merged a main)

---

### [TASK-003] Diseñar estructura de datos y configuración para el Modo Pro (Style Engine v7.0)
- **ID**: `TASK-003`
- **Objetivo**: Definir en `state` el objeto de configuración de estilo (`styleConfig`) para soportar orden de campos, alineación y peso tipográfico (negrita/cursiva), asegurando persistencia en exportación/importación `.artlabel`.
- **Archivos que toca**: `script.js`
- **Criterios de Aceptación**:
  - `state.styleConfig` con valores por defecto que mantengan exactamente la apariencia actual si no se modifica.
  - Compatibilidad total hacia atrás con proyectos `.artlabel` existentes.
- **Estado**: Completada (Merged a main)

---

### [TASK-004] Interfaz UI para Configuración de Estilo de Galería (Modo Pro)
- **ID**: `TASK-004`
- **Objetivo**: Añadir en `index.html` y estilizar en `style.css` un acordeón/panel colapsable de "Estilo de Galería (Modo Pro)" con controles para alineación (izq/centro/der), toggles de negrita y cursiva por campo, y sincronización bidireccional con `state.styleConfig`.
- **Archivos que toca**: `index.html`, `style.css`, `script.js`
- **Criterios de Aceptación**:
  - Controles visuales intuitivos sin saturar la vista.
  - Sincronización en vivo con `state.styleConfig`.
  - Al cambiar un ajuste se refleja inmediatamente en la previsualización (`renderLivePreview`).
  - No altera el formato de texto plano de los inputs ni de la base de datos de obras.
- **Estado**: Completada (Merged a main)

---

### [TASK-007] Integrar Motor de Estilos (Modo Pro) en la Generación de PDF (jsPDF)
- **ID**: `TASK-007`
- **Objetivo**: Conectar `state.styleConfig` en la rutina `generatePDF` para que la alineación (izquierda, centro, derecha), pesos de fuente (bold, italic) e interlineado configurados en la UI se reproduzcan idénticamente 1:1 en el documento PDF descargado.
- **Archivos que toca**: `script.js`
- **Criterios de Aceptación**:
  - jsPDF aplica fuentes en negrita (`setFont(undefined, 'bold')`) y cursiva (`setFont(undefined, 'italic')`) de acuerdo a `state.styleConfig.fields`.
  - El texto en PDF se alinea según `state.styleConfig.textAlign`.
  - Respeta el multiplicador de interlineado sin desbordar los límites de corte del rótulo.
  - Verificado con `test-syntax.js` código 0.
- **Estado**: Completada (Merged a main)

---

### [TASK-008] Actualización de Documentación v7.0 y Guía de Uso del Modo Pro
- **ID**: `TASK-008`
- **Objetivo**: Actualizar `README.md` y `HANDOVER_PROMPT.md` documentando las nuevas capacidades v7.0 (Catálogo Local Desacoplado, Importación Masiva, Galería Modo Pro con formatos tipográficos por campo e interlineado, y cálculo modular de grilla).
- **Archivos que toca**: `README.md`, `HANDOVER_PROMPT.md`
- **Criterios de Aceptación**:
  - Documentación clara y precisa del flujo de trabajo, compatibilidad y atajos.
- **Estado**: Completada (Merged a main)

---

### [TASK-009] Rediseño Moderno UI/UX y Sistema de Tokens de Galería
- **ID**: `TASK-009`
- **Objetivo**: Modernizar integralmente la experiencia visual y estética de la interfaz (header editorial, tarjetas con elevación sutil, inputs modernos con focus rings elegantes, botones de acción jerarquizados, badges limpios y transiciones suaves), respetando el flujo de trabajo existente.
- **Archivos que toca**: `style.css`, `index.html`
- **Criterios de Aceptación**:
  - Paleta y tokens semánticos renovados con estética de estudio de arte/museo moderno.
  - Header estilizado con acciones bien jerarquizadas (primaria, secundaria, peligro).
  - Formularios e inputs con micro-interacciones pulidas y mejor feedback táctil/visual.
  - Sin roturas en el canvas de previsualización 1:1, drag & drop de logo ni generación de PDF.
  - Verificación `node test-syntax.js` con código 0.
- **Estado**: Completada (Merged a main)

---

### [TASK-010] Selector de Tipografía y Escala de Tamaño de Fuente en Gallery Style (Modo Pro)
- **ID**: `TASK-010`
- **Objetivo**: Añadir en el panel "Gallery Style (Pro Mode)" controles para seleccionar la familia tipográfica (fuentes museo/galería: Sans-Serif moderna, Serif clásica editorial, Monospace técnica, etc.) y un control de tamaño base de fuente (ej. de 8pt a 16pt / multiplicador de escala), sincronizándolo reactivamente con la previsualización en vivo (CSS) y el renderizado en PDF (`jsPDF`).
- **Archivos que toca**: `index.html`, `style.css`, `script.js`
- **Criterios de Aceptación**:
  - Selector visual de fuentes compatibles tanto en navegador como en jsPDF estándar (Helvetica/Arial, Times New Roman, Courier) y webfonts editoriales (Roboto, Georgia / Serif).
  - Control de tamaño de fuente base / escala con indicador numérico.
  - Actualización en vivo en `#live-preview` (WYSIWYG 1:1).
  - Integración en `generatePDF()` mapeando la familia y tamaño de fuente exactos en `doc.setFont()` y `doc.setFontSize()`.
  - Persistencia en `localStorage` mediante `state.styleConfig.fontFamily` y `state.styleConfig.fontSize`.
  - Verificación estática con `node test-syntax.js` con código 0.
- **Estado**: Completada (Merged a main)

---

### [TASK-011] Motor Unificado de Decoraciones / Imágenes Libres con Límites de Impresión
- **ID**: `TASK-011`
- **Objetivo**: Unificar el sistema de decoraciones en un motor de "Imagen / Ornamento Libre" que permita subir cualquier imagen (logo, arabesco o adorno) con manipulación completa en tiempo real (mover, redimensionar, rotar, z-index), restringiendo los límites de movimiento (`clamping`) para que no desborde el área segura de corte del rótulo.
- **Archivos que toca**: `index.html`, `style.css`, `script.js`
- **Criterios de Aceptación**:
  - Unificación o modernización de la UI de subida: opción directa para cargar cualquier imagen ornamental / logo.
  - El arrastre (`drag`) y cambio de tamaño (`resize`) restringen las coordenadas para que la imagen permanezca dentro de los límites del rótulo (`0 <= x <= previewWidth - width`, `0 <= y <= previewHeight - height`).
  - Rotación libre continua por handle o input numérico, respetando el contenedor.
  - Sincronización en vivo 1:1 entre `#live-preview` y `generatePDF()` en `jsPDF`.
  - Compatibilidad total con proyectos existentes.
  - Verificación estática con `node test-syntax.js` con código 0.
- **Estado**: Completada (Merged a main)

---

### [TASK-012] Reorganización de Layout en 3 Columnas con Vista Previa Sticky Siempre Visible
- **ID**: `TASK-012`
- **Objetivo**: Reestructurar el layout de la app a una arquitectura de 3 columnas (Columna 1: Datos y Formulario; Columna 2: Estilos, Tipografía y Decoración; Columna 3: Vista Previa Flotante / Sticky fija) para que el usuario observe los cambios en vivo sin hacer scroll vertical hacia arriba y abajo.
- **Archivos que toca**: `index.html`, `style.css`
- **Criterios de Aceptación**:
  - Columna 1 izquierda: Formulario de creación/edición de datos de obra.
  - Columna 2 centro: Controles de estilo de galería (Modo Pro), selección de fuentes, sliders y decoraciones/imágenes.
  - Columna 3 derecha: `#live-preview-container` y controles de dimensión/guías con comportamiento `sticky` (`top: 1.5rem`), siempre visible en pantalla.
  - Responsividad: en pantallas medianas o móviles se apila ordenadamente con fluidez.
  - Preservación íntegra de IDs y selectores requeridos por `script.js`.
  - Verificación estática con `node test-syntax.js` con código 0.
- **Estado**: Completada (Merged a main)

---

### [TASK-013] Módulo de Importación Amigable sin JSON (Excel / CSV / Direct Paste)
- **ID**: `TASK-013`
- **Objetivo**: Implementar `js/catalog-importer.js` y el modal asistente para que el usuario pueda importar colecciones mediante copia y pega directo de Excel/Sheets (`Ctrl+V`) o subida de archivos `.csv` / `.xlsx`, con detección inteligente de columnas y plantilla descargable.
- **Archivos que toca**: `js/catalog-importer.js` (nuevo), `plantilla-obras.csv` (nuevo), `index.html`, `script.js`, `style.css`
- **Criterios de Aceptación**:
  - Pestaña de pegado directo de Excel que previsualiza las obras antes de confirmar.
  - Soporte de subida para archivos `.csv`.
  - Mapeo automático de sinónimos de columnas (Autor, Título, etc.).
  - Plantilla CSV descargable desde la UI.
  - Verificación estática con `node test-syntax.js` con código 0.
- **Estado**: Completada (Merged a main)
