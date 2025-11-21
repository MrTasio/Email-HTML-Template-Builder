# 📧 Email HTML Cheat Sheet

Quick reference for building email-compatible HTML.

---

## ❌ What You CAN'T Use

```html
<!-- NO! Email clients don't support these -->
<div> for layout
<span> for layout
Flexbox
CSS Grid
Float for layout
Position: absolute/fixed
External CSS files
<style> tags (mostly stripped)
Most CSS properties (opacity, transform, etc.)
```

## ✅ What You MUST Use

```html
<!-- YES! Email clients support these -->
<table> for layout
<td> for columns
Inline styles (style="...")
Web-safe fonts
Basic CSS properties (color, font-size, padding, etc.)
Media queries (for responsive)
```

---

## 📐 Layout Structure

### Basic Email Container

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Only basic reset styles here */
        body { margin: 0; padding: 0; }
        table { border-collapse: collapse; }
    </style>
</head>
<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="padding: 20px;">
                <!-- Your email content here -->
                <table width="600" cellpadding="0" cellspacing="0" border="0">
                    <!-- Content goes here -->
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 🔤 Typography

### Web-Safe Fonts

```css
/* Always specify fallback fonts */
font-family: Arial, Helvetica, sans-serif;
font-family: Georgia, Times, serif;
font-family: 'Courier New', Courier, monospace;

/* Recommended */
font-family: Arial, sans-serif;
```

### Font Sizes

```html
<!-- Use px units, not em/rem -->
<p style="font-size: 16px;">16px is standard</p>
<h1 style="font-size: 32px;">32px for headings</h1>
```

---

## 🎨 Colors

```html
<!-- Always use hex codes -->
<p style="color: #000000;">Black text</p>
<td style="background-color: #ffffff;">White background</td>

<!-- Colors -->
#000000 - Black
#ffffff - White
#2563eb - Blue
#10b981 - Green
#ef4444 - Red
#f59e0b - Orange
```

---

## 📏 Spacing

```html
<!-- Padding (use inline styles) -->
<td style="padding: 20px;">20px all sides</td>
<td style="padding: 20px 10px;">20px top/bottom, 10px left/right</td>

<!-- Margin (doesn't work well, use padding instead) -->
<td style="padding: 20px 0;">Creates vertical margin effect</td>
```

---

## 🖼️ Images

```html
<!-- Always specify width and height -->
<img src="image.jpg" 
     alt="Description" 
     width="600" 
     style="max-width: 100%; height: auto; display: block;" />

<!-- For full-width responsive -->
<img src="image.jpg" 
     alt="Description" 
     width="600" 
     style="width: 100%; max-width: 600px; height: auto; display: block;" />
```

**Rules**:
- Always use `alt` attribute
- Set `width` attribute (actual pixel width)
- Use `style="max-width: 100%;"` for responsive
- Add `display: block;` to remove spacing

---

## 🔘 Buttons

```html
<!-- Use table for button structure -->
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td align="center" style="padding: 20px;">
            <a href="https://example.com" 
               style="display: inline-block; 
                      padding: 12px 24px; 
                      background-color: #2563eb; 
                      color: #ffffff; 
                      text-decoration: none; 
                      border-radius: 4px;">
                Click Here
            </a>
        </td>
    </tr>
</table>
```

**Rules**:
- Use `<a>` tag, not `<button>`
- `display: inline-block;` for padding to work
- Always specify `text-decoration: none;`
- Set background-color and color

---

## 📊 Columns / Two Columns

```html
<!-- Two equal columns -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td width="50%" valign="top" style="padding-right: 10px;">
            Left column content
        </td>
        <td width="50%" valign="top" style="padding-left: 10px;">
            Right column content
        </td>
    </tr>
</table>

<!-- 70/30 split -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td width="70%" valign="top" style="padding-right: 10px;">
            Left (70%)
        </td>
        <td width="30%" valign="top" style="padding-left: 10px;">
            Right (30%)
        </td>
    </tr>
</table>
```

**Rules**:
- Use `width` attribute (percentage)
- Use `valign="top"` for alignment
- Use padding for gap between columns
- Percentages must add up to 100%

---

## 📱 Responsive Design

### Media Queries

```html
<style>
    /* Mobile styles */
    @media only screen and (max-width: 600px) {
        .email-container {
            width: 100% !important;
            max-width: 100% !important;
        }
        
        .column {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
        }
        
        img {
            max-width: 100% !important;
            height: auto !important;
        }
    }
</style>
```

**Rules**:
- Use `!important` in media queries
- Stack columns on mobile (display: block)
- Make images responsive
- Use 600px breakpoint (standard)

---

## ➖ Dividers / Horizontal Lines

```html
<!-- Simple line -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td align="center" style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="border-top: 1px solid #e2e8f0;"></td>
                </tr>
            </table>
        </td>
    </tr>
</table>
```

---

## 🔗 Links

```html
<!-- Text link -->
<a href="https://example.com" style="color: #2563eb; text-decoration: underline;">
    Click here
</a>

<!-- Image link -->
<a href="https://example.com">
    <img src="button.jpg" alt="Button" width="200" style="display: block;" />
</a>
```

**Rules**:
- Always use full URLs (https://...)
- Style links with inline styles
- Use `text-decoration: underline;` for text links

---

## ✅ Common Patterns

### Full-Width Background Color

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
        <td align="center" style="padding: 40px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
                <tr>
                    <td style="padding: 20px;">
                        Content here
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
```

### Centered Content

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td align="center" style="padding: 20px;">
            <!-- Centered content -->
        </td>
    </tr>
</table>
```

### Spacer

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="height: 40px; line-height: 40px; font-size: 1px;">&nbsp;</td>
    </tr>
</table>
```

---

## 🚫 Common Mistakes

### ❌ Don't Do This:

```html
<div style="display: flex;">
    <div>Content</div>
</div>

<div style="float: left;">Column 1</div>
<div style="float: right;">Column 2</div>

<img src="..." style="width: 100%;" />
<!-- Missing width attribute and max-width -->

<style>
    .my-class { color: red; }
</style>
<!-- External styles stripped by many clients -->
```

### ✅ Do This Instead:

```html
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td>Content</td>
    </tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td width="50%">Column 1</td>
        <td width="50%">Column 2</td>
    </tr>
</table>

<img src="..." width="600" style="max-width: 100%;" />

<td style="color: red;">Text</td>
<!-- Inline styles work everywhere -->
```

---

## 🧪 Testing Checklist

- [ ] Test in Gmail (web, mobile app)
- [ ] Test in Outlook (web, desktop)
- [ ] Test in Apple Mail
- [ ] Test on mobile devices
- [ ] Check all images load
- [ ] Verify all links work
- [ ] Test responsive design (mobile view)
- [ ] Check colors render correctly
- [ ] Verify fonts fallback properly

---

## 📚 Resources

- **[Can I Email](https://www.caniemail.com/)** - Check CSS support
- **[Litmus](https://www.litmus.com/)** - Email testing tool
- **[Email on Acid](https://www.emailonacid.com/)** - Email testing
- **[HTML Email Boilerplate](https://github.com/seanpowell/Email-Boilerplate)** - Starter template

---

## 💡 Quick Tips

1. **Always use tables** for layout
2. **Inline all styles** - no external CSS
3. **Test in multiple clients** - they're all different
4. **Use fallback fonts** - not everyone has your font
5. **Set image dimensions** - width attribute + max-width style
6. **Use full URLs** - no relative paths
7. **Keep it simple** - complex layouts break
8. **Test on mobile** - most emails are read on phones

---

**Remember: Email HTML is stuck in the 90s. Embrace tables and inline styles!**

