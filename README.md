# Art Label Generator V7.0 ("Gallery Style Edition")

Professional web application for museum curators, galleries, and exhibitors to design and generate museum-grade artwork labels with real-time preview, advanced typographical styling, dynamic grid calculations, and print-ready PDF export.

🌐 **Live Demo**: [https://augustoalr.github.io/art-label-generator-v6/](https://augustoalr.github.io/art-label-generator-v6/)  
*(PIN de acceso por defecto: 1234)*

## 🚀 Key Features

- **Real-time Preview (WYSIWYG 1:1)**: Instant visual feedback where layout, fonts, and styling exactly match the PDF output.
- **Gallery Style Engine (Pro Mode)**:
  - **Alineación Personalizable**: Left, Center o Right por etiqueta.
  - **Formato Tipográfico por Campo**: Controles independientes de Negrita (Bold) y Cursiva (Italic) para autor, título, fecha, técnica y medidas.
  - **Control Continuo de Interlineado**: Ajuste granular de interlineado (Line Height de 0.8x a 2.0x) para estilos editoriales densos o aireados.
  - **Fidelidad Matemática en PDF**: Todas las transformaciones tipográficas se trasladan con total precisión matemática al documento generado con `jsPDF`.
- **Catálogo de Obras Desacoplado**:
  - **Importación Masiva en el Navegador**: Carga dinámica de archivos `.json` directamente desde la interfaz.
  - **Persistencia en LocalStorage**: Mantiene la colección activa entre sesiones de forma local y privada.
  - **Plantilla de Ejemplo**: Incluye `ejemplo-catalogo.json` para facilitar la adopción pública y estandarizar la estructura de datos.
- **Módulo Matemático Desacoplado (`js/grid-calculator.js`)**:
  - Cálculo algorítmico independiente de distribución de páginas, márgenes dinámicos y grilla óptima por tamaño de rótulo.
  - Compatible tanto con el navegador como con entornos Node.js (UMD).
- **Decoration & Logo Handling**:
  - **Arabesque**: Adornos ornamentales clásicos superior e inferior.
  - **Institutional Logo**: Carga de logo institucional con controles interactivos de arrastre, escala, rotación precisa y orden de capas (frente/fondo).
  - **Magnetic Snapping**: Guías de alineación vertical y horizontal automática.
- **Professional PDF Generation**:
  - **Registration Marks (T-Marks)**: Marcas de corte estilo "T" milimétricas para guillotina.
  - **Precisión CM / MM**: Dimensiones configurables en tiempo real con conversión métrica exacta.
  - **Auto-shrink Text**: Ajuste automático del tamaño de fuente para evitar desbordamientos.
  - **Image Optimization**: Manejo de imágenes de alta resolución mediante `createImageBitmap` para exportaciones rápidas y seguras en memoria.
- **Room & Collection Management**: Organización de rótulos por salas o colecciones temáticas con exportación e importación en formato `.artlabel`.
- **CI & Verificación Estática**:
  - Suite de comprobación sintáctica ligera `test-syntax.js` para asegurar cero errores sintácticos en JavaScript y validar archivos JSON clave.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5 semántico, CSS3 moderno (Custom Properties / Design Tokens), JavaScript (ES6+ modular).
- **Libraries**:
  - [jsPDF](https://github.com/parallax/jsPDF) (Generación de PDF en cliente)
  - [FontAwesome](https://fontawesome.com/) (Iconografía de interfaz)
  - Google Fonts (`Roboto`, `Playfair Display`)
- **Data & Persistence**:
  - `localStorage` para almacenamiento de estado, configuraciones de estilo y catálogo activo.
  - Importación/Exportación de archivos de proyecto `.artlabel` y catálogos `.json`.

## 📦 Project Structure

- `index.html`: Estructura principal y componentes de interfaz (incluyendo panel de Modo Pro y modal de catálogo).
- `script.js`: Orquestación de UI, manejo de eventos, lógica de estado y motor de renderizado WYSIWYG/PDF.
- `js/grid-calculator.js`: Módulo de cálculo desacoplado para dimensionamiento métrico y grilla de impresión.
- `style.css`: Sistema de diseño atómico, tokens CSS, componentes responsivos y estilos del Style Engine.
- `ejemplo-catalogo.json`: Plantilla pública de obras de arte lista para importar.
- `test-syntax.js`: Script de verificación estática de sintaxis y consistencia de datos.

## 🧪 Pruebas y Validación

Para verificar la integridad sintáctica del código y la estructura de datos:
```powershell
node test-syntax.js
```

## 📄 License
This project is for internal professional use.
