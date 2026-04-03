# Art Label Generator V6.1

Professional tool for generating museum-grade artwork labels with real-time preview and PDF export.

## 🚀 Key Features

- **Real-time Preview**: See how your label looks as you type.
- **Decoration Types**:
  - **Arabesque**: Classic top/bottom ornaments.
  - **Institutional Logo**: Upload and place your own logo.
- **Advanced Logo Control**:
  - **Drag & Resize**: Move and scale your logo with interactive handles.
  - **Precise Rotation**: Rotate using a specific degree input or rotating handle.
  - **Layering**: Move logos behind or in front of the text (z-index control).
  - **Magnetic Snapping**: Automatically aligns to vertical and horizontal center guides.
- **Professional PDF Generation**:
  - **Registration Marks (T-Marks)**: Professional "T" style crop marks for easy cutting.
  - **CM/MM Precision**: Labels are generated with absolute millimeter precision for printing.
  - **Auto-shrink Text**: Text size automatically adjusts to fit the available space without overflow.
  - **Image Optimization**: High-res logo handling using `createImageBitmap` for fast, memory-safe PDF creation.
- **Room/Collection Management**: Organize labels into distinct folders or "rooms".
- **Real-time Print Status**: Mini-map widget tracks label distribution on 2x4 grid pages.
- **Persistence**: Work is saved automatically to local storage and can be exported/imported as `.artlabel` files.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Libraries**: 
  - [jsPDF](https://github.com/parallax/jsPDF) (PDF generation)
  - [FontAwesome](https://fontawesome.com/) (Icons)
- **Local Database**: `data.json` for fixed artwork records and `localStorage` for session/state.

## 📦 Project Structure

- `index.html`: Main UI template.
- `script.js`: Core logic, state management, event handling, and rendering.
- `style.css`: Modern design system with responsive layouts.
- `data.json`: Artwork repository (Source of Truth).

## 📄 License
This project is for internal professional use.
