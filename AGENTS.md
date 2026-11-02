# Protocolo y Guía de Agentes - Art Label Generator

Este documento establece las instrucciones operativas, entorno de ejecución, comandos y reglas de calidad para cualquier agente que trabaje en este repositorio.

---

## 1. Arquitectura y Stack Tecnológico

- **Frontend Core**: Vanilla JavaScript (ES6+), HTML5 semántico, CSS3 moderno (Custom Properties / Design Tokens).
- **Librerías Externas**:
  - `jsPDF` 2.5.1 (generación de documentos PDF en cliente).
  - `FontAwesome` 6.5.2 (iconografía).
  - Google Fonts (`Roboto`).
- **Persistencia**: `localStorage` del navegador y exportación/importación en formato JSON (`.artlabel`).
- **Base de Datos Estática**: `data.json` (archivo de obras de arte).

---

## 2. Instalación y Servidor Local

El proyecto no requiere dependencias pesadas de Node ni empaquetadores complejos (Webpack/Vite). Se ejecuta directamente en el navegador:

1. **Abrir en navegador**:
   - Abrir `index.html` directamente en el navegador, o preferiblemente servirlo con un servidor HTTP estático local:
   ```bash
   # Opción Python:
   python -m http.server 8000
   
   # Opción Node (si disponible):
   npx serve .
   ```
2. **PIN de Acceso Inicial**:
   - La aplicación cuenta con un bloqueo por PIN al inicio. El PIN por defecto es `1234`.

---

## 3. Pruebas y Validación de Calidad

Dado que es Vanilla JS/HTML/CSS sin suite de tests automatizada preinstalada:
1. **Validación Sintáctica JS**:
   ```powershell
   node -c script.js
   ```
2. **Validación Visual y Funcional (Manual o Headless)**:
   - Cargar `index.html` en el navegador.
   - Verificar ingreso con PIN `1234`.
   - Probar creación de rótulos con diferentes tamaños (W x H en cm).
   - Probar toggle de T-Marks (guías de corte).
   - Probar carga y transformación de logo (rotación, escala, posición, capa front/back).
   - Generar PDF y validar que no lance excepciones ni congele el hilo de renderizado (se usa `createImageBitmap`).
3. **No romper la estabilidad de v6.1**:
   - Respetar el flujo de cálculo milimétrico (coordenadas de preview sincronizadas 1:1 con `jsPDF`).

---

## 4. Reglas de Desarrollo y Arquitectura

1. **Separación de Responsabilidades (SoC)**:
   - Mantener la lógica de negocio desacoplada de la UI.
   - La entrada de datos debe mantenerse en texto plano limpio (no almacenar HTML ni tags en `state.labels`).
2. **Regla del "Chesterton's Fence"**:
   - No eliminar código existente (por ejemplo, el tratamiento con `createImageBitmap` o límites de 800px para evitar caídas en jsPDF) sin comprender su origen.
3. **Consistencia de Tokens de Diseño**:
   - Usar las variables definidas en `style.css` (`--primary-color`, `--card-background`, etc.) en lugar de valores hexadecimales arbitrarios.
4. **Git y Ramas**:
   - Trabajar siempre en ramas funcionales (`feature/...` o `feat/...`).
   - Mantener `main` como rama protegida y estable.
5. **Restricción de Herramientas**:
   - Prohibido el uso de `curl` o CLI de `gh` para consultar GitHub en este entorno.
