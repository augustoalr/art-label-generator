# Art Label Generator V7.0 - Manual de Traspaso (Handover Prompt)

## 📌 ESTADO ACTUAL: V7.0 ("Gallery Style Edition") CONSOLIDADO

El hito **v7.0** ha sido alcanzado con éxito y se encuentra integrado y consolidado en la rama principal (`main`):
- **Gallery Style Engine (Modo Pro)**:
  - Sistema de alineación tipográfica dinámico (Izquierda, Centro, Derecha).
  - Toggles por campo para Negrita (Bold) y Cursiva (Italic) independientes (Autor, Título, Fecha, Técnica, Medidas).
  - Control granular de interlineado (Line Height de 0.8x a 2.0x).
- **Fidelidad WYSIWYG 1:1 en PDF**:
  - Coordenadas y transformaciones tipográficas sincronizadas de forma exacta entre el canvas/preview de UI y el motor de renderizado vectorial `jsPDF`.
- **Arquitectura Limpia & Modularización**:
  - Módulo matemático desacoplado `js/grid-calculator.js` (cálculo de grilla, márgenes y métricas en mm/px) exportable bajo patrón UMD.
  - Catálogo de obras desacoplado del código fuente: soporte para subida masiva de `.json` en el cliente, persistencia en `localStorage` y plantilla pública `ejemplo-catalogo.json`.
- **Integridad y QA**:
  - Suite de verificación sintáctica `test-syntax.js` con ejecución en CI / pre-commit.

---

## 🎯 PRÓXIMOS PASOS Y ROADMAP (v7.1 / v8.0)

Con el núcleo tipográfico y la arquitectura desacoplada estables, las siguientes iniciativas prioritarias se orientan a optimizaciones de usabilidad y fidelidad visual:

1. **Reordenamiento Drag & Drop de Campos Tipográficos**:
   - Permitir a los usuarios reordenar visualmente el orden de renderizado de los campos en la etiqueta (ej. Título primero, seguido del Autor, o colocar fecha junto al título) mediante drag-and-drop en el panel de Modo Pro.
   - Reflejar la secuencia de campos de manera reactiva en el preview y en la generación de `jsPDF`.

2. **Exportación a Formatos Vectoriales SVG**:
   - Extender la exportación para permitir descarga individual o por hoja en formato SVG nativo para su uso en cortadoras láser, trazadores y suites de diseño vectorial (Illustrator, Inkscape).

3. **Perfiles de Galería Predefinidos (Presets)**:
   - Crear una biblioteca de presets de galería (ej. "Estilo Museo Clásico", "Eden Gallery Modern", "Minimalista Contemporáneo") aplicables con un solo clic.

---

## ⚠️ DIRECTIVAS ARQUITECTÓNICAS DE MANTENIMIENTO

- **Separación de Responsabilidades (SoC)**: Mantener la entrada de datos en texto plano. Las configuraciones de estilo residen en el estado visual (`state.styleConfig` o equivalentes) y se aplican en la capa de renderizado.
- **Regla del "Chesterton's Fence"**: Respetar los cálculos matemáticos de `js/grid-calculator.js` y las optimizaciones de memoria en `jsPDF` (`createImageBitmap`).
- **Validación Continua**: Ejecutar `node test-syntax.js` y `node -c script.js` antes de cualquier consolidación.
