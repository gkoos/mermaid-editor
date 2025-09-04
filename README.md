# Mermaid Editor

A fast, modern, browser-based editor for creating and exporting Mermaid diagrams. Built with Vite, Tailwind CSS, and Mermaid.js.

## Features
- Live Mermaid diagram preview
- Zoom and pan the diagram preview
- Zoom ratio display and reset
- Export diagram as SVG or PNG
- Error messages for invalid diagrams
- (Somewhat) responsive layout

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)

### Install
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

## Project Structure
```
index.html           # Main HTML file
package.json         # Project metadata and scripts
public/favicon.png   # Favicon
src/
  main.js            # Main application logic
  style.css          # Custom styles
  counter.js         # (optional demo)
```

## Usage
- Write/paste Mermaid code in the editor.
- See live preview and error messages.
- Zoom/pan the diagram preview.
- Click the zoom ratio to reset zoom.
- Export as SVG or PNG.

## License
MIT
