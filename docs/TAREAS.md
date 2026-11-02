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
- **Estado**: En progreso (Asignada a subagente)
