# Handover Prompt for Next AI Agent

Welcome, AI Agent! You are taking over the **Art Label Generator V6.1** project. This is a high-performance, professional tool for creating museum labels.

## Current State & Context

The project is currently stable after a series of critical fixes in V6.1. The core focus is on **visual excellence**, **printing precision (CM/MM)**, and **memory-safe PDF generation**.

### Key Technical Aspects

- **Architecture**:
  - `state`: Central object in `script.js` containing `labels`, `rooms`, and `editingLabelId`.
  - `renderLivePreview()`: Core function that updates the visual label mockup in real-time. It separates rendering logic for **Arabesque** and **Neutral Logo (Institutional)**.
  - `generatePDF()`: Uses `jsPDF` to build A4/Letter pages with 2x4 label grids.

- **Critical Fixes (V6.1) - Read carefully!**:
  - **PDF Performance & Hanging**: Previously, high-res images and Base64 strings crashed the `jsPDF` rendering loop. We replaced the `new Image()` + `onload` promise with `createImageBitmap()` (Web API) for reliable, non-blocking image processing. It also limits max dimensions to 800px for stability.
  - **Scaling Jumps**: Handled distance vectors correctly in `isResizing` logic to ensure smooth, diagonal-based scaling.
  - **Layout Shifts**: Fixed a floating `</div>` in `index.html` that broke the CSS grid alignment.

- **UI Components**:
  - `Mini-Map widget`: Displays how many pages the labels fill (2x4 grid).
  - `Magnetic Snapping`: Automatically snaps logos to the center of the label using `guide-line` classes.
  - `Layer Management`: Switches `z-index` of the logo between `0` (back) and `10` (front).

## Your Mission

When you continue, maintain the "Zero-Cost, High-Portability" principle. The code is pure JS, HTML, and CSS (no frameworks like React/Tailwind). 

### Immediate To-Do's (Recommended):

1. **Verify PDF Generation**: Always ensure that labels with and without logos appear correctly in the downloaded PDF.
2. **Layering Persistence**: Check if the `z-index` (Back/Front) is correctly saved and loaded when editing a label previously saved.
3. **Responsive UI**: Ensure the sidebar and design panel maintain their 2-column structure in different resolution screens.

### Code Style:
- Use clean, modular CSS.
- Keep `script.js` as the single source of truth for logic to ensure simplicity.
- When adding features, always update `renderLivePreview()` first to reflect changes visually.

Good luck!
