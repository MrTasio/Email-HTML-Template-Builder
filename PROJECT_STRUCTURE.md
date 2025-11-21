# 📁 Project Structure

Complete file structure and what each file does.

```
email-template-builder/
│
├── index.html                 # Main HTML scaffold (UI layout)
├── package.json               # Project dependencies (optional - using CDN)
├── README.md                  # Project overview
├── QUICK_START.md            # Quick start guide
├── LEARNING_GUIDE.md         # Detailed step-by-step learning guide
├── PROJECT_STRUCTURE.md      # This file
│
├── styles/
│   └── main.css              # All styles (no framework!)
│
└── js/
    ├── app.js                # 🎯 Main entry point - orchestrates everything
    ├── model.js              # 📊 Data model & state management
    ├── components.js         # 🧩 Component library (email HTML templates)
    ├── canvas.js             # 🖼️ Canvas rendering & drag/drop
    ├── properties.js         # ⚙️ Properties panel (dynamic forms)
    ├── exporter.js           # 📤 Email HTML export
    └── storage.js            # 💾 LocalStorage management
```

---

## 📄 File Descriptions

### `index.html`
**Purpose**: Main HTML structure

**Contains**:
- Top bar (logo, buttons, tools)
- Left sidebar (component library)
- Center canvas (where blocks are dropped)
- Right sidebar (properties panel)
- Modals (preview, templates)

**Why it's important**: This is the visual structure. Everything else is JavaScript that manipulates this.

---

### `styles/main.css`
**Purpose**: All visual styles

**Contains**:
- CSS variables (colors, sizes)
- Layout styles (flexbox for builder UI)
- Component styles (buttons, inputs, etc.)
- Modal styles
- Responsive utilities

**Why it's important**: Pure CSS, no framework. Shows CSS mastery.

---

### `js/app.js` ⭐
**Purpose**: Main orchestrator - ties everything together

**Key Responsibilities**:
- Initialize all managers
- Set up event handlers
- Handle keyboard shortcuts
- Coordinate between modules

**Key Functions**:
- `init()` - Starts the app
- `initCanvas()` - Sets up canvas manager
- `initProperties()` - Sets up properties panel
- `initComponentLibrary()` - Renders component list
- `initTopBar()` - Sets up toolbar buttons
- `initModals()` - Sets up preview/templates modals
- `initKeyboardShortcuts()` - Handles keyboard events

**Why start here**: This is where everything begins. Read this first to understand the flow.

---

### `js/model.js` 📊
**Purpose**: Data model and state management

**Key Concept**: Stores email structure as JSON, not DOM

**Key Classes/Functions**:
- `EmailModel` class - Manages blocks array
- `addBlock()` - Add new block
- `removeBlock()` - Delete block
- `updateBlock()` - Edit block properties
- `selectBlock()` - Select/deselect block
- `undo()` / `redo()` - Undo/redo system
- `toJSON()` / `fromJSON()` - Serialization

**Data Structure**:
```javascript
[
  {
    id: "block-123",
    type: "text",
    data: { content: "...", fontSize: 16, ... }
  }
]
```

**Why it's important**: This is the "single source of truth". All UI updates from this.

---

### `js/components.js` 🧩
**Purpose**: Email component definitions

**Key Concept**: Email-safe HTML templates (tables, inline styles)

**Contains**:
- Component definitions (text, button, image, etc.)
- `defaultData` - Initial properties for each component
- `htmlTemplate()` - Function that generates email HTML

**Component Structure**:
```javascript
text: {
    type: 'text',
    label: 'Text Block',
    icon: '📝',
    defaultData: { content: '...', fontSize: 16, ... },
    htmlTemplate: (data) => `<table>...</table>`
}
```

**Why it's important**: This is where email expertise shows. All HTML must be email-compatible.

---

### `js/canvas.js` 🖼️
**Purpose**: Canvas rendering and manipulation

**Key Responsibilities**:
- Render blocks on canvas
- Handle drag & drop from sidebar
- Reorder blocks (Sortable.js)
- Block selection
- Block controls (duplicate, delete)

**Key Functions**:
- `init()` - Initialize canvas
- `render()` - Render all blocks
- `createBlockElement()` - Create visual block representation
- `setupDragDrop()` - Handle drag & drop
- `setupSortable()` - Enable reordering

**Why it's important**: This is the visual layer. Users see blocks here.

---

### `js/properties.js` ⚙️
**Purpose**: Properties panel (right sidebar)

**Key Concept**: Dynamic form generation based on block type

**Key Responsibilities**:
- Generate form fields dynamically
- Two-way data binding (form ↔ model)
- Live updates (changes reflect immediately)

**Key Functions**:
- `init()` - Initialize properties panel
- `updatePanel()` - Show properties for selected block
- `getFieldsForType()` - Get field definitions for block type
- `createField()` - Create form input dynamically
- `handleFieldChange()` - Update model when field changes

**Why it's important**: This is how users edit blocks. Dynamic forms show flexibility.

---

### `js/exporter.js` 📤
**Purpose**: Convert model to production email HTML

**Key Concept**: Generate table-based, inline-styled email HTML

**Key Functions**:
- `exportHTML()` - Generate complete email HTML
- `wrapEmailHTML()` - Wrap content in email structure
- `copyToClipboard()` - Copy HTML to clipboard
- `downloadHTML()` - Download HTML as file
- `getPreviewHTML()` - Get HTML for preview

**Email Requirements**:
- Tables for layout
- Inline styles
- Media queries for mobile
- Web-safe fonts
- DOCTYPE and meta tags

**Why it's important**: This is the output. Final email HTML that works in all clients.

---

### `js/storage.js` 💾
**Purpose**: LocalStorage management

**Key Concept**: Save/load templates from browser storage

**Key Functions**:
- `getAllTemplates()` - Get all saved templates
- `saveTemplate()` - Save current template
- `loadTemplate()` - Load template by ID
- `deleteTemplate()` - Delete template
- `duplicateTemplate()` - Clone template
- `generateThumbnail()` - Create preview image

**Storage Structure**:
```javascript
[
  {
    id: "template-123",
    name: "Newsletter",
    date: "2024-01-15T10:00:00Z",
    data: { blocks: [...] },
    thumbnail: "data:image/png;base64,..."
  }
]
```

**Why it's important**: Persistence. Templates survive page refresh.

---

## 🔄 Data Flow

```
User Action (drag block)
    ↓
Canvas Manager (addBlockFromSidebar)
    ↓
Model (addBlock)
    ↓
Model fires 'blocksChanged' event
    ↓
Canvas Manager (render)
    ↓
DOM Updates
```

```
User edits property
    ↓
Properties Manager (handleFieldChange)
    ↓
Model (updateBlock)
    ↓
Model fires 'blocksChanged' event
    ↓
Canvas Manager (render)
    ↓
DOM Updates
```

---

## 🎯 Key Design Patterns

### 1. **Singleton Pattern**
Each manager is a single instance:
```javascript
export const emailModel = new EmailModel();
```

### 2. **Event-Driven Architecture**
Modules communicate via events:
```javascript
emailModel.on('blocksChanged', () => canvasManager.render());
```

### 3. **Separation of Concerns**
- Model: Data only
- Canvas: Rendering only
- Properties: UI only
- Exporter: Output only

### 4. **JSON Model Pattern**
Store structure as JSON, not DOM:
```javascript
blocks = [{ id: "...", type: "...", data: {...} }]
```

---

## 📊 Module Dependencies

```
app.js
  ├── model.js
  ├── canvas.js
  │   ├── model.js
  │   └── components.js
  ├── properties.js
  │   └── model.js
  ├── exporter.js
  │   └── model.js
  └── storage.js
      ├── model.js
      └── exporter.js
```

---

## 🎓 Learning Order

1. **`app.js`** - Understand the big picture
2. **`model.js`** - Learn data structure
3. **`components.js`** - See email HTML templates
4. **`canvas.js`** - Understand rendering
5. **`properties.js`** - Learn dynamic forms
6. **`exporter.js`** - See output generation
7. **`storage.js`** - Understand persistence

---

## 💡 File Size Guide

- **Small** (< 200 lines): `exporter.js`, `storage.js`
- **Medium** (200-400 lines): `model.js`, `properties.js`
- **Large** (400+ lines): `app.js`, `canvas.js`, `components.js`

**Tip**: Start with smaller files, then tackle larger ones.

---

## 🚀 Adding New Features

### Add a New Component Type:

1. **`components.js`**: Add component definition
2. **`properties.js`**: Add field definitions in `getFieldsForType()`
3. **Done!** Component automatically appears in sidebar

### Add a New Feature:

1. **Add to appropriate module** (model, canvas, properties, etc.)
2. **Wire up in `app.js`** (event handlers, initialization)
3. **Update UI in `index.html`** (if needed)

---

**Ready to dive in? Start with `LEARNING_GUIDE.md`!**

