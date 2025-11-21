# 📧 Email Template Builder

A powerful, production-ready email template builder with drag-and-drop functionality. Build responsive, email-client-compatible HTML templates with ease.

## ✨ Features

### Core Functionality
- ✅ **Drag & Drop Interface** - Intuitive canvas-based editor
- ✅ **Component Library** - Pre-built email components (text, headings, images, buttons, etc.)
- ✅ **Live Editing** - Real-time property editing with instant preview
- ✅ **Responsive Preview** - Desktop and mobile preview modes
- ✅ **Email-Safe HTML** - Generates table-based, inline-styled HTML compatible with all email clients

### Advanced Features
- ✅ **Block Library** - Save individual blocks for reuse
- ✅ **Import/Export** - Share templates as JSON files
- ✅ **Template Management** - Save, load, duplicate, and manage templates
- ✅ **Undo/Redo** - Full history tracking with keyboard shortcuts
- ✅ **Auto-Save** - Automatic saving after 2 minutes of inactivity
- ✅ **Two-Column Layouts** - Support for HTML or image content in each column
- ✅ **Spacing Controls** - Padding and margin properties for all components
- ✅ **Color Picker** - Visual color picker with hex input support

### Component Types
- 📝 Text Block - Rich text content with formatting
- 📰 Heading - H1-H6 headings with styling
- 🔘 Button - Call-to-action buttons with links
- 🖼️ Image - Single images with alignment options
- ➖ Divider - Horizontal line separators
- ⬜ Spacer - Vertical spacing blocks
- 📊 Two Columns - Side-by-side content (HTML or images)
- 📄 Footer - Email footer blocks

## 🚀 Getting Started

### Quick Setup

1. **Clone or download the project**

2. **Start a local server** (required for ES6 modules):

Using Python:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx serve .
```

3. **Open in browser**:
```
http://localhost:8000
```

That's it! No build step required.

## 📁 Project Structure

```
email-builder/
├── index.html              # Main HTML scaffold
├── styles/
│   └── main.css           # All application styles
├── js/
│   ├── app.js             # Main application orchestrator
│   ├── model.js           # Data model & state management
│   ├── components.js      # Component library definitions
│   ├── canvas.js          # Canvas rendering & manipulation
│   ├── properties.js      # Properties panel logic
│   ├── exporter.js        # Email HTML export
│   └── storage.js         # LocalStorage management
├── README.md
├── QUICK_START.md         # Detailed getting started guide
├── LEARNING_GUIDE.md      # Learning resources
└── EMAIL_HTML_CHEATSHEET.md  # Email HTML reference
```

## 🎯 Usage Guide

### Building an Email Template

1. **Add Blocks**
   - Drag components from the left sidebar (General tab)
   - Drop them onto the canvas
   - Blocks appear instantly with preview

2. **Edit Properties**
   - Click any block on the canvas to select it
   - Properties panel (right sidebar) shows editable fields
   - Changes apply immediately

3. **Save Your Work**
   - Click "Save" (💾) in the top bar
   - Enter a template name
   - Access saved templates via "Templates" button

### Using the Block Library

1. **Save a Block**
   - Select a block on the canvas
   - Click the "Save" (💾) button in block controls
   - Enter a name for the block

2. **Use Saved Blocks**
   - Switch to "Library" tab in left sidebar
   - Drag saved blocks to canvas
   - Edit and customize as needed

### Importing and Exporting

**Export Options:**
- **Export HTML** - Download email-ready HTML file or copy to clipboard
- **Export JSON** - Save template as JSON for sharing/backup

**Import:**
- Click "Import" (📤) button
- Select a JSON template file
- Choose to replace or append to existing blocks

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + D` - Duplicate selected block
- `Delete` - Delete selected block

## 🛠️ Tech Stack

- **Vanilla JavaScript** (ES6 modules)
- **Sortable.js** - Drag and drop functionality
- **html2canvas** - Thumbnail generation for saved templates
- **Pure CSS** - No framework dependencies

## 📚 Learning Resources

- **[QUICK_START.md](QUICK_START.md)** - Step-by-step tutorial
- **[LEARNING_GUIDE.md](LEARNING_GUIDE.md)** - Deep dive into concepts
- **[EMAIL_HTML_CHEATSHEET.md](EMAIL_HTML_CHEATSHEET.md)** - Email HTML best practices

## 🎨 Component Properties

All components support:
- **Spacing** - Padding and margin controls
- **Background Color** - Custom background colors
- **Alignment** - Text and image alignment options
- **Content** - Rich text or image content

Component-specific properties:
- **Text/Heading** - Font family, size, color, line height
- **Button** - Background color, text color, link URL
- **Image** - Source URL, alt text, border radius, max width
- **Two Columns** - Column widths, content type (HTML/Image), gap spacing

## 🔧 Advanced Features

### Auto-Save
- Text fields auto-save after 2 minutes of inactivity
- Manual save on blur (clicking outside field)
- No need to manually save while typing

### Template Management
- Save unlimited templates in browser localStorage
- Generate thumbnails automatically
- Duplicate templates for variations
- Rename and delete templates

### Block Library
- Save frequently used blocks
- Reuse across templates
- Visual thumbnails for easy identification
- Delete unused blocks

## 📖 Key Concepts

### Email-Safe HTML
- Uses **tables** for layout (not divs)
- **Inline styles** only (no external CSS)
- Limited CSS support (no flexbox/grid)
- Responsive via media queries
- Web-safe fonts

### Component System
- Each component is a self-contained module
- Components have `type`, `defaultData`, and `htmlTemplate`
- Properties are bound two-way between model and UI

### State Management
- Centralized data model (`emailModel`)
- Event-driven updates
- Undo/redo stack for history

## 🌟 Tips & Best Practices

1. **Save Regularly** - Templates are stored locally, but export JSON for backups
2. **Use Block Library** - Save reusable blocks (headers, footers, CTAs)
3. **Preview Often** - Check mobile preview for responsive design
4. **Test in Email Clients** - Always test exported HTML in real email clients
5. **Optimize Images** - Use optimized images for better email performance

## 🐛 Troubleshooting

**Blocks not dragging?**
- Make sure you're dragging from the component item, not just clicking
- Check browser console for errors

**Import not working?**
- Ensure JSON file has correct structure (`{ blocks: [], version: "1.0" }`)
- Check browser console for validation errors

**Styles not applying?**
- Some email clients have limited CSS support
- Use inline styles (handled automatically by the builder)

## 📝 License

This is a learning project. Feel free to use, modify, and learn from it!

## 🤝 Contributing

This is primarily a learning project, but suggestions and improvements are welcome!

---

**Built with ❤️ for email developers**
