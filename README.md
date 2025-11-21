# 📧 Email Template Builder - Learning Project

A production-feeling email template builder built step-by-step for learning.

## 🎯 What You'll Learn

- **Complex State Management** - Managing JSON model of email blocks
- **Drag & Drop** - Building interactive canvas with Sortable.js
- **Email HTML Expertise** - Table-based layouts, inline styles, email limitations
- **DOM Manipulation** - Dynamic component rendering and property binding
- **UX Patterns** - Familiar interface like Stripo/Klaviyo

## 📚 Project Structure

```
email-template-builder/
├── index.html              # Main HTML scaffold
├── styles/
│   └── main.css           # All styles
├── js/
│   ├── app.js            # Main application entry
│   ├── model.js          # Data model & state management
│   ├── components.js     # Component library definitions
│   ├── canvas.js         # Canvas rendering & manipulation
│   ├── properties.js     # Properties panel logic
│   ├── exporter.js       # Email HTML export
│   └── storage.js        # LocalStorage management
└── package.json
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:3000`

## 📖 Learning Path

### Step 1: Foundation ✅
- Project setup and structure
- UI layout (top bar, sidebars, canvas)

### Step 2: Data Model (Next)
- JSON structure for email blocks
- State management

### Step 3: Components
- Define email components
- Email-safe HTML templates

### Step 4: Drag & Drop
- Add blocks to canvas
- Reorder blocks

### Step 5: Properties Panel
- Edit block properties
- Live updates

### Step 6: Export
- Convert to email HTML
- Inline styles
- Responsive media queries

### Step 7: Advanced Features
- Preview modes
- Undo/redo
- Save/load templates
- Thumbnails

## 🛠️ Tech Stack

- **Vanilla JavaScript** (ES6 modules)
- **Sortable.js** - Drag and drop
- **html2canvas** - Thumbnail generation
- **Pure CSS** - No framework (for learning)

## 📝 Features

- ✅ Drag & drop email sections
- ✅ Edit text, images, colors
- ✅ Adjust spacing & alignment
- ✅ Export clean, responsive HTML
- ✅ Preview mobile vs desktop
- ✅ Save templates in localStorage
- ✅ Undo/redo system
- ✅ Keyboard shortcuts

## 🎓 Learning Notes

Each file has comments explaining the concepts. Take time to understand each step before moving forward!

