# ⚡ Quick Start Guide

Get up and running in 2 minutes!

## 🚀 Setup

1. **Install dependencies** (if using npm):
```bash
npm install
```

Actually, we're using CDN for dependencies, so this step is optional!

2. **Start a local server**:

Using Python (recommended):
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:
```bash
npm install -g serve
serve .
```

Using PHP:
```bash
php -S localhost:8000
```

3. **Open in browser**:
```
http://localhost:8000
```

That's it! The app should load.

---

## 🎨 First Steps

### 1. Add Your First Block

1. Look at the **left sidebar** - you'll see components
2. **Drag** a "Text Block" to the canvas
3. See it appear!

### 2. Edit the Block

1. **Click** on the block you just added
2. Look at the **right sidebar** - properties panel appears
3. Change the text, font size, color, etc.
4. See changes appear instantly!

### 3. Add More Blocks

1. Drag a **Button** block
2. Drag an **Image** block
3. Drag a **Heading** block
4. Build your email!

### 4. Reorder Blocks

1. **Click and drag** any block up or down
2. Release to drop in new position
3. Blocks reorder automatically!

### 5. Duplicate/Delete

1. **Hover** over a block
2. See the control buttons appear (top right)
3. Click 📋 to duplicate
4. Click 🗑️ to delete

### 6. Preview Your Email

1. Click **Preview** button (top bar)
2. See your email rendered!
3. Toggle **Desktop** / **Mobile** views
4. See how it looks on different devices

### 7. Export Your Email

1. Click **Export** button
2. Choose **Copy** or **Download**
3. Get your email HTML!

### 8. Save Your Template

1. Click **Save** button
2. Enter a name
3. Click **Templates** to see saved templates
4. **Load** any template anytime!

---

## ⌨️ Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Save template
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Ctrl+D` / `Cmd+D` - Duplicate selected block
- `Delete` / `Backspace` - Delete selected block
- `Esc` - Deselect block

---

## 🎓 Learning Path

1. **Start with `LEARNING_GUIDE.md`** - Understand the architecture
2. **Read `js/model.js`** - Learn how data is managed
3. **Read `js/components.js`** - See email HTML templates
4. **Read `js/canvas.js`** - Understand rendering
5. **Read `js/properties.js`** - Learn two-way binding
6. **Read `js/exporter.js`** - See how email HTML is generated
7. **Experiment!** - Change code, see what happens

---

## 🐛 Troubleshooting

### App won't load?
- Make sure you're using a local server (not file://)
- Check browser console for errors
- Try a different browser

### Components not draggable?
- Refresh the page
- Check browser console for errors
- Make sure Sortable.js loaded (check Network tab)

### Preview not working?
- Check that blocks are added to canvas
- Look at browser console for errors
- Try exporting HTML instead

### Styles look broken?
- Clear browser cache
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Check that `styles/main.css` loaded

---

## 📚 Next Steps

1. **Read the code**: Start with `js/app.js` - it's the entry point
2. **Understand the flow**: Follow how a block is added → rendered → edited
3. **Add a feature**: Try adding a new component type
4. **Modify existing**: Change how buttons look
5. **Experiment**: Break things, then fix them!

---

## 💡 Tips

- **Use DevTools**: Right-click → Inspect to see how blocks are structured
- **Console is your friend**: Type `emailModel.getAllBlocks()` to see the data
- **Read comments**: Code has detailed explanations
- **Start small**: Understand one file at a time

---

**Ready to build? Open `LEARNING_GUIDE.md` for detailed explanations!**

Happy coding! 🎉

