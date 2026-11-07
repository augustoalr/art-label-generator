# Art Label Generator V7.1 ("Gallery Style Edition")

Aplicación web profesional para curadores, galeristas, museólogos y montajistas para diseñar, gestionar e imprimir rótulos de obras de arte con calidad de museo. Ofrece vista previa en tiempo real con fidelidad milimétrica (WYSIWYG 1:1), manipulación libre de sellos o imágenes con límites seguros de impresión, asistente de importación sin fricción (copiar y pegar de Excel/Sheets o CSV) y exportación a PDF optimizada para imprenta.

🌐 **Demo en vivo**: [https://augustoalr.github.io/art-label-generator-v6/](https://augustoalr.github.io/art-label-generator-v6/)

---

## 🚀 Características Principales

### 1. Nuevo Layout de 3 Columnas con Live Preview Sticky
- **Arquitectura Visual de 3 Columnas**:
  - **Columna 1 (Izquierda)**: Formulario de catalogación de obras, búsqueda por número de bien, bandeja de rótulos sin asignar y gestión de salas/exposiciones.
  - **Columna 2 (Centro)**: Panel de diseño, selección tipográfica, ajustes de interlineado y motor interactivo de imágenes/ornamentos.
  - **Columna 3 (Derecha)**: Tarjeta de **Vista Previa en Vivo Sticky** (`top: 1.5rem`), anclada permanentemente en pantalla para ver cambios instantáneos sin desplazarse verticalmente.
- **Diseño Totalmente Responsivo**:
  - Escritorio (> 1280px): Grid de 3 columnas fluidas.
  - Tablet / Pantallas medianas (850px – 1280px): 2 columnas con vista previa adaptada al ancho completo.
  - Móviles (< 850px): Apilado vertical optimizado.

### 2. Motor de Estilo de Galería (Gallery Style Engine - Modo Pro)
- **Selección Tipográfica**: Selector entre familias tipográficas estándar de museo (`Arial / Sans-serif`, `Times New Roman / Serif`, `Courier / Monospace`).
- **Escala de Texto Flexible**: Slider interactivo de tamaño base de fuente (desde 8pt hasta 24pt).
- **Control de Interlineado Continuo**: Ajuste granular de espaciado vertical (`Line Spacing` de 0.8x a 2.0x).
- **Formato Tipográfico por Campo**: Interruptores individuales de Negrita (**Bold**) y Cursiva (*Italic*) para Autor, Título, Fecha, Técnica y Medidas.
- **Alineación de Texto**: Alineación izquierda, centrada o derecha con sincronización instantánea en PDF.
- **Botón de Restauración**: Restablecimiento en un clic a los valores tipográficos estándar de galería.

### 3. Motor Unificado de Imágenes y Ornamentos Libres (Boundary Clamping)
- **Manipulación Libre e Interactiva**:
  - Soporte universal de formatos: PNG, JPG, SVG, WebP.
  - Arrastre (`drag`), redimensionamiento proporcional continuo y rotación continua (360° con *snapping* magnético cada 45°).
  - Control de capas (*Z-Index*): Ubicación en frente o detrás del bloque de texto.
  - Controles numéricos y directos de coordenadas (X, Y, Ancho, Alto, Ángulo).
- **Límites de Impresión Seguros (Bounding-Box Clamping)**:
  - Algoritmo que restringe la posición y escala de la imagen para garantizar que nunca sobrepase el margen físico de corte del rótulo.
- **Modo Clásico de Arabescos**: Mantiene compatibilidad con ornamentos simétricos fijos superior e inferior.

### 4. Asistente de Importación Masiva Amigable (Cero JSON)
Diseñado especialmente para usuarios sin conocimientos técnicos:
- **Pestaña "Pegar desde Excel"**:
  - Permite copiar celdas directamente en Excel o Google Sheets (`Ctrl + C`) y pegarlas en la app (`Ctrl + V`).
  - Detección automática de delimitadores (`TSV`, tabuladores, coma o punto y coma).
- **Pestaña "Subir Archivo"**:
  - Carga mediante arrastrar y soltar de archivos `.csv` o `.json`.
  - Enlace directo para descargar [`plantilla-obras.csv`](plantilla-obras.csv) preconfigurada.
- **Detección Inteligente de Columnas (Diccionario de Sinónimos)**:
  - Mapeo automático de columnas comunes en español e inglés:
    - *Autor*: `autor`, `author`, `artista`, `creador`, `pintor`, `escultor`.
    - *Título*: `titulo`, `título`, `title`, `nombre_obra`, `obra`.
    - *Fecha*: `fecha`, `date`, `ano`, `año`, `periodo`, `year`.
    - *Técnica*: `tecnica`, `técnica`, `technique`, `medio`, `material`.
    - *Medidas*: `medidas`, `measurements`, `dimensiones`, `tamaño`, `size`.
    - *Nro. de Bien*: `id`, `asset_number`, `bien`, `nro_bien`, `inventario`.
- **Previsualización de Confirmación**: Tabla que muestra las primeras obras detectadas y etiquetas con el mapeo detectado antes de guardar.
- **Búsqueda Resiliente**: Autocompletado rápido desde el formulario buscando por número de bien o ID.

### 5. Exportación a PDF de Grado Profesional (`jsPDF`)
- **Precisión Métrica 1:1**: Coordenadas sincronizadas matemáticamente entre el DOM en pantalla y el canvas vectorial en milímetros.
- **Guías de Corte (T-Marks)**: Marcas de corte perimetrales estilo "T" para corte milimétrico en guillotina.
- **Cálculo Dinámico de Grilla ([`js/grid-calculator.js`](js/grid-calculator.js))**: Distribución algorítmica óptima de rótulos por pliego (Letter o A4) calculando márgenes e interespaciado automáticamente.
- **Ajuste Automático de Texto (Auto-shrink)**: Reduce gradualmente el puntaje tipográfico si el texto excede el área disponible para prevenir solapamientos.
- **Rendimiento de Memoria**: Procesamiento optimizado de imágenes mediante `createImageBitmap` con límites de resolución para evitar bloqueos del hilo principal.

### 6. Gestión de Salas y Proyectos
- Clasificación de rótulos en salas virtuales personalizadas (`Rooms`).
- Movimiento de rótulos entre salas mediante modal o arrastre.
- Persistencia integral del proyecto en formato descargable `.artlabel` (JSON portable) y almacenamiento local en `localStorage`.
- Acceso directo y sin fricción (sin bloqueos ni contraseñas).

---

## 🛠️ Stack Tecnológico

- **Frontend**: Vanilla JavaScript (ES6+ modular UMD), HTML5 semántico, CSS3 moderno con variables semánticas (Design Tokens).
- **Librerías Externas (CDN)**:
  - [jsPDF](https://github.com/parallax/jsPDF) v2.5.1 (Generación de documentos PDF vectoriales en cliente).
  - [FontAwesome](https://fontawesome.com/) v6.5.2 (Iconografía).
  - Google Fonts (`Roboto`).
- **Persistencia y Datos**:
  - `localStorage` del navegador para almacenamiento de rótulos, configuración de estilos y catálogo de colección.
  - Importación/Exportación de proyectos (`.artlabel`), catálogos (`.csv`, `.json`).

---

## 📦 Estructura del Repositorio

```text
├── index.html               # Estructura principal, columnas del layout y modales
├── script.js                # Lógica de la app, estado, manipulación interactiva y jsPDF
├── style.css                # Sistema de diseño, CSS Grid de 3 columnas, variables y temas
├── js/
│   ├── grid-calculator.js   # Módulo matemático UMD para grilla y distribución en hoja
│   └── catalog-importer.js  # Parser inteligente TSV/CSV con mapeo por sinónimos
├── plantilla-obras.csv      # Plantilla de ejemplo en CSV lista para abrir en Excel
├── ejemplo-catalogo.json    # Plantilla de ejemplo en formato JSON tradicional
├── docs/
│   ├── ESTADO.md            # Registro histórico de versiones y arquitectura
│   └── TAREAS.md            # Control de tareas y roadmap
├── test-syntax.js           # Suite de verificación estática de sintaxis y archivos JSON
└── README.md                # Documentación del proyecto
```

---

## 💻 Instalación y Uso Local

La aplicación es 100% estática y no requiere empaquetadores complejos (Webpack, Vite o Node build):

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/augustoalr/art-label-generator.git
   cd art-label-generator
   ```

2. **Ejecutar servidor local**:
   Puedes abrir directamente `index.html` en tu navegador, o levantarlo con cualquier servidor HTTP local:
   ```bash
   # Opción con Python:
   python -m http.server 8000

   # Opción con Node.js:
   npx serve .
   ```

3. **Abrir en el navegador**:
   Visita `http://localhost:8000`.

---

## 🧪 Pruebas y Validación de Calidad

El proyecto incluye un verificador estático que comprueba la sintaxis de todos los archivos JavaScript y la integridad de los datos de ejemplo:

```powershell
node test-syntax.js
```

---

## 📄 Licencia

Este proyecto está disponible para uso profesional e institucional en museos, exposiciones y galerías de arte.
