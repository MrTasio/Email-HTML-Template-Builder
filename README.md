# 📧 Email Template Builder with Authentication

A powerful, production-ready email template builder with drag-and-drop functionality and user authentication. Build responsive, email-client-compatible HTML templates with ease.

## ✨ Features

### Authentication
- ✅ **User Login/Signup** - Secure authentication using NextAuth.js
- ✅ **Protected Routes** - Builder is only accessible to authenticated users
- ✅ **Vercel Backend** - Deployed on Vercel with serverless functions

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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or download the project**

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret key:
```bash
openssl rand -base64 32
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open in browser:**
```
http://localhost:3000
```

You'll be redirected to the login page. Sign up or sign in to access the builder.

## 📁 Project Structure

```
email-builder/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/    # NextAuth.js authentication
│   ├── builder/                   # Protected builder route
│   ├── login/                      # Login/signup page
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page (redirects)
│   └── globals.css                 # Global styles
├── components/
│   └── EmailBuilder.tsx            # Main builder component
├── public/
│   ├── js/                         # Email builder JavaScript modules
│   └── styles/                     # CSS files
├── middleware.ts                   # Route protection middleware
├── next.config.js                  # Next.js configuration
├── package.json
└── vercel.json                     # Vercel deployment config
```

## 🔐 Authentication

The app uses NextAuth.js for authentication. Currently, it uses a simple credentials provider for demo purposes. In production, you should:

1. **Connect to a database** (MongoDB, PostgreSQL, etc.)
2. **Hash passwords** using bcrypt
3. **Add email verification** for signups
4. **Implement password reset** functionality

### Current Authentication

For demo purposes, any email/password combination with:
- Valid email format
- Password length >= 6 characters

will work. This is **NOT secure for production** - replace with proper database authentication.

## 🚢 Deployment to Vercel

1. **Push your code to GitHub**

2. **Import project in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add environment variables in Vercel:**
   - `NEXTAUTH_SECRET` - Your secret key (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

4. **Deploy!**

Vercel will automatically detect Next.js and deploy your app.

## 🎯 Usage Guide

### Building an Email Template

1. **Sign in** to access the builder
2. **Add Blocks**
   - Drag components from the left sidebar (General tab)
   - Drop them onto the canvas
   - Blocks appear instantly with preview
3. **Edit Properties**
   - Click any block on the canvas to select it
   - Properties panel (right sidebar) shows editable fields
   - Changes apply immediately
4. **Save Your Work**
   - Click "Save" (💾) in the top bar
   - Enter a template name
   - Access saved templates via "Templates" button

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + D` - Duplicate selected block
- `Delete` - Delete selected block

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **NextAuth.js** - Authentication
- **TypeScript** - Type safety
- **Vanilla JavaScript** (ES6 modules) - Email builder logic
- **Sortable.js** - Drag and drop functionality
- **html2canvas** - Thumbnail generation
- **Vercel** - Hosting and serverless functions

## 📝 License

This is a learning project. Feel free to use, modify, and learn from it!

---

**Built with ❤️ for email developers**
