'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function EmailBuilder() {
  useEffect(() => {
    // Load the email builder scripts after DOM is ready
    if (typeof window !== 'undefined') {
      const loadScript = async () => {
        try {
          // Dynamically import the app.js module
          await import('/js/app.js')
        } catch (error) {
          console.error('Error loading email builder:', error)
        }
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadScript)
      } else {
        loadScript()
      }
    }
  }, [])

  return (
    <>
      {/* Load external scripts */}
      <Script
        src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"
        strategy="beforeInteractive"
      />

      {/* Builder HTML Structure */}
      <div id="email-builder-root">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <div className="logo">
              <span className="logo-icon">✉️</span>
              <span className="logo-text">Email Builder</span>
            </div>
          </div>
          <div className="top-bar-center">
            <button className="toolbar-btn" id="undoBtn" title="Undo (Ctrl+Z)">
              <span>↶</span> Undo
            </button>
            <button className="toolbar-btn" id="redoBtn" title="Redo (Ctrl+Y)">
              <span>↷</span> Redo
            </button>
            <div className="divider"></div>
            <button className="toolbar-btn primary" id="saveBtn" title="Save (Ctrl+S)">
              <span>💾</span> Save
            </button>
            <button className="toolbar-btn" id="previewBtn" title="Preview">
              <span>👁️</span> Preview
            </button>
            <div className="toolbar-dropdown">
              <button className="toolbar-btn" id="exportBtn" title="Export">
                <span>📥</span> Export
                <span style={{ marginLeft: '4px' }}>▼</span>
              </button>
              <div className="toolbar-dropdown-menu" id="exportDropdown">
                <button className="dropdown-item" data-export="html-clipboard">
                  <span>📋</span> Copy HTML to Clipboard
                </button>
                <button className="dropdown-item" data-export="html-download">
                  <span>💾</span> Download HTML
                </button>
                <button className="dropdown-item" data-export="json">
                  <span>📄</span> Export as JSON
                </button>
              </div>
            </div>
            <button className="toolbar-btn" id="importBtn" title="Import Template">
              <span>📤</span> Import
            </button>
          </div>
          <div className="top-bar-right">
            <button className="toolbar-btn" id="templatesBtn" title="My Templates">
              <span>📋</span> Templates
            </button>
            <a href="/api/auth/signout" className="toolbar-btn" title="Sign Out">
              <span>🚪</span> Sign Out
            </a>
          </div>
        </header>

        {/* Main Container */}
        <div className="main-container">
          {/* Left Sidebar - Component Library */}
          <aside className="left-sidebar">
            <div className="sidebar-header">
              <h2>Components</h2>
              <p className="sidebar-subtitle">Drag blocks to canvas</p>
            </div>
            <div className="component-tabs">
              <button type="button" className="component-tab active" data-tab="general">General</button>
              <button type="button" className="component-tab" data-tab="library">Library</button>
            </div>
            <div className="components-list" id="componentsList">
              {/* Components will be dynamically added here */}
            </div>
            <div className="components-list hidden" id="libraryList">
              {/* Saved blocks will be dynamically added here */}
            </div>
          </aside>

          {/* Center Canvas */}
          <main className="canvas-area">
            <div className="canvas-header">
              <h2>Canvas</h2>
              <div className="canvas-actions">
                <button className="small-btn" id="clearCanvasBtn">Clear All</button>
              </div>
            </div>
            <div className="canvas-container">
              <div className="canvas" id="canvas">
                <div className="canvas-empty-state" id="canvasEmptyState">
                  <p>🎨 Your canvas is empty</p>
                  <p className="hint">Drag components from the left sidebar to get started</p>
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar - Properties Panel */}
          <aside className="right-sidebar">
            <div className="sidebar-header">
              <h2>Properties</h2>
              <p className="sidebar-subtitle" id="propertiesSubtitle">Select a block to edit</p>
            </div>
            <div className="properties-panel" id="propertiesPanel">
              <div className="properties-empty">
                <p>No block selected</p>
                <p className="hint">Click on a block in the canvas to edit its properties</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Preview Modal */}
        <div className="modal" id="previewModal">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Preview</h2>
              <div className="preview-controls">
                <button className="preview-toggle active" data-mode="desktop" id="previewDesktopBtn">Desktop</button>
                <button className="preview-toggle" data-mode="mobile" id="previewMobileBtn">Mobile</button>
              </div>
              <button className="modal-close" id="closePreviewBtn">×</button>
            </div>
            <div className="modal-body">
              <div className="preview-container">
                <div className="preview-frame" id="previewFrame">
                  {/* Email preview will be rendered here */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Modal */}
        <div className="modal" id="templatesModal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>My Templates</h2>
              <button className="modal-close" id="closeTemplatesBtn">×</button>
            </div>
            <div className="modal-body">
              <div className="templates-list" id="templatesList">
                {/* Templates will be shown here */}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input for import */}
        <input type="file" id="importFileInput" accept=".json,.txt" style={{ display: 'none' }} />
      </div>
    </>
  )
}

