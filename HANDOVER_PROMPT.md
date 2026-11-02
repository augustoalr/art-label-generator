# Art Label Generator V6.1 - Manual de Traspaso (v7.0)

## 🛡️ DIRECTIVA CRÍTICA: AISLAR LA ESTABILIDAD
**La versión 6.1 es una versión de producción estable y funcional.** 
Cualquier cambio para la v7.0 DEBE realizarse siguiendo este workflow de Git:
1. **Crear Rama Separada**: `git checkout -b feat/style-engine-v7`.
2. **Protección de Main**: No realizar merges a `main` hasta que el usuario haya validado el nuevo "Modo Pro".

## 📍 ESTADO ACTUAL (v6.1 "WYSIWYG Edition")
El proyecto ha alcanzado un hito de estabilidad con las siguientes funciones core:
- **Previsualización 1:1**: El diseño en pantalla es idéntico al PDF (coordenadas alineadas).
- **Dimensiones Dinámicas**: El usuario puede cambiar el ancho/alto del rótulo en CM en tiempo real.
- **Grilla de PDF Inteligente**: El algoritmo calcula automáticamente cuántas etiquetas caben por página Letter según el tamaño elegido.
- **T-Marks (Guías de Corte)**: Automáticas y dinámicas tanto en UI como en PDF.
- **Escalado de Logo**: Manipulación libre de rotación y escalado proporcional (vía UI o entrada de PX).

## 🚀 ROADMAP: MODO PRO (v7.0)
El próximo objetivo es transformar el motor de etiquetas en un sistema configurable para galerías con estilos propios.

### Requerimientos Clave:
1. **Panel de Estilo de Galería**: Un módulo (con lógica para acceso premium) que permita:
   - **Orden de Campos**: Cambiar el orden (ej. Título arriba del Autor).
   - **Formato por Campo**: Toggles para Negrita (Bold), Cursiva (Italic) y Alineación.
   - **Control de Interlineado**: Ajuste fino del espacio entre líneas para permitir logos o separadores entre ellas (ej. Eden Gallery style).
2. **Interferencia Cero**: El usuario debe seguir escribiendo texto plano. El formato se aplica en la capa de renderizado (UI y PDF), no en la base de datos.
3. **Persistencia**: La configuración de estilo debe guardarse globalmente en el proyecto.

## ⚠️ LIMITACIONES TÉCNICAS
- **Motor**: Mantener Vanilla JS/HTML/CSS (sin frameworks pesados).
- **PDF**: Usar `jsPDF`. No romper el cálculo de grilla al añadir el motor de estilos.

---
*Fin del Handover - Listo para iniciar fase v7.0*
