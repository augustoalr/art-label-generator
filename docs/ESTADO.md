# Estado del Proyecto - Art Label Generator

## Versión Actual: 6.1 ("WYSIWYG Edition")
- **Estado General**: Producción Estable + Verificación Estática Automatizada.
- **Rama Principal**: `main`.
- **Última Revisión de Arquitectura**: 02/11/2026.

---

## Capacidades Funcionales Activas

1. **Suite de Verificación Estática (`test-syntax.js`)**:
   - Inspección automática de sintaxis JS en todo el proyecto (`node -c`).
   - Validación obligatoria de plantilla pública (`ejemplo-catalogo.json`).
   - Comprobación opcional de datasets locales (`data.json`) sin bloquear el entorno de desarrollo público.
2. **Plantilla de Catálogo Pública (`ejemplo-catalogo.json`)**:
   - Estructura desacoplada de la colección privada para permitir despliegue y uso abierto.
3. **Gestión e Importación Local de Catálogo de Obras**:
   - Soporte para importación de catálogos masivos en formato JSON en el navegador.
   - Persistencia local en `localStorage` (`artlabel_catalog`).
   - Indicador de estado en tiempo real en la UI (obras disponibles).
   - Descarga directa de la plantilla JSON de ejemplo desde el panel de creación.
   - Búsqueda por número de inventario/Id con autocompletado y fallback amigable.
4. **Pantalla de Bloqueo por PIN**:
   - Modal de seguridad inicial (PIN por defecto: `1234`).
2. **Generación y Gestión de Rótulos**:
   - Búsqueda por número de inventario / Id number sobre `data.json`.
   - Campos: Autor, Título, Fecha, Técnica, Medidas.
   - Creación, edición, eliminación y asignación a cuartos/salas ("Rooms").
3. **Previsualización en Tiempo Real (WYSIWYG 1:1)**:
   - Sincronización visual milimétrica entre la previsualización HTML y las coordenadas calculadas para el PDF.
   - Dimensiones personalizables en cm (Ancho `W` y Alto `H`).
   - T-Marks (guías de corte profesionales) dinámicas.
4. **Motor de Decoración**:
   - Tipo Arabescos (superior e inferior).
   - Tipo Logotipo Institucional libre:
     - Drag & Resize en tiempo real con handles interactivos.
     - Rotación en grados e inputs numéricos finos.
     - Control de capas (Send to Back / Bring to Front).
     - Magnetic snapping a ejes centrales.
5. **Generador de PDF Seguro (`jsPDF`) y Módulo de Grilla (`js/grid-calculator.js`)**:
   - Módulo de utilidades matemáticas desacoplado (`calculatePageGrid`, `cmToMm`, `cmToPx`) con soporte UMD.
   - Cálculo automático de grilla por página según dimensiones del rótulo.
   - Manejo optimizado de imágenes con `createImageBitmap` y escala máxima (800px) para evitar bloqueos del navegador.
   - Exportación de todas las etiquetas o filtradas por sala ("Room").
6. **Style Engine v7.0 (Modo Pro UI & Previsualización Reactiva)**:
   - Panel colapsable accesible "Gallery Style (Pro Mode)".
   - Controles de alineación de texto (izquierda, centro, derecha).
   - Toggles independientes de Negrita (**B**) y Cursiva (*I*) por cada campo del rótulo.
   - Control de interlineado (slider 0.8x a 2.0x).
   - Botón de restauración rápida "Reset to Default Style".
   - Sincronización instantánea con la previsualización en vivo (WYSIWYG 1:1).
7. **Persistencia**:
   - Almacenamiento local mediante `localStorage`.
   - Importación y exportación de archivos `.artlabel` (JSON).

---

## Deuda Técnica y Oportunidades Identificadas

1. **Monolito en `script.js`**:
   - El archivo supera las 1200 líneas acumulando DOM handlers, cálculo de render, generación de PDF y drag & drop.
2. **Roadmap v7.0 (Modo Pro / Style Engine)**:
   - Requerimiento de personalizar orden de campos, estilos (negrita/cursiva/alineación) e interlineado por campo sin alterar la base de datos de texto plano.
3. **Validación Automatizada**:
   - Ausencia de tests unitarios o e2e automatizados para asegurar no-regresión en la exportación de PDF y cálculos de grilla.
