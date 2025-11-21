/**
 * ========================================
 * Main Application Entry Point
 * ========================================
 * 
 * This is the orchestrator that connects all modules together.
 * 
 * Responsibilities:
 * - Initialize all managers
 * - Set up UI event handlers
 * - Coordinate between modules
 * - Handle keyboard shortcuts
 */

import { emailModel } from './model.js';
import { canvasManager } from './canvas.js';
import { propertiesManager } from './properties.js';
import { emailExporter } from './exporter.js';
import { storageManager } from './storage.js';
import { getAllComponents, getComponent } from './components.js';

class EmailBuilderApp {
    constructor() {
        this.previewModal = null;
        this.templatesModal = null;
        this.previewMode = 'desktop';
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    init() {
        if (this.initialized) return;
        
        // Initialize managers
        this.initCanvas();
        this.initProperties();
        this.initComponentLibrary();
        this.initTopBar();
        this.initModals();
        this.initKeyboardShortcuts();
        
        // Render initial state
        canvasManager.render();
        propertiesManager.updatePanel();
        
        this.initialized = true;
        console.log('✅ Email Builder initialized');
    }

    /**
     * Initialize canvas
     */
    initCanvas() {
        const canvas = document.getElementById('canvas');
        const emptyState = document.getElementById('canvasEmptyState');
        
        if (!canvas || !emptyState) {
            console.error('Canvas elements not found');
            return;
        }
        
        canvasManager.init(canvas, emptyState);
    }

    /**
     * Initialize properties panel
     */
    initProperties() {
        const panel = document.getElementById('propertiesPanel');
        const subtitle = document.getElementById('propertiesSubtitle');
        
        if (!panel || !subtitle) {
            console.error('Properties elements not found');
            return;
        }
        
        propertiesManager.init(panel, subtitle);
    }

    /**
     * Initialize component library (left sidebar)
     */
    initComponentLibrary() {
        this.renderGeneralComponents();
        this.renderLibraryComponents();
        this.setupComponentTabs();
        
        // Re-initialize drag and drop after rendering components
        setTimeout(() => {
            canvasManager.setupDragDrop();
        }, 100);
    }

    /**
     * Render general components
     */
    renderGeneralComponents() {
        const componentsList = document.getElementById('componentsList');
        if (!componentsList) {
            console.error('Components list not found');
            return;
        }
        
        const components = getAllComponents();
        
        componentsList.innerHTML = components.map(component => `
            <div class="component-item" 
                 data-component-type="${component.type}"
                 draggable="true">
                <div class="component-item-header">
                    <span class="component-item-icon">${component.icon}</span>
                    <span class="component-item-label">${component.label}</span>
                </div>
                <div class="component-item-desc">${component.description}</div>
            </div>
        `).join('');
    }

    /**
     * Render library (saved blocks)
     */
    renderLibraryComponents() {
        const libraryList = document.getElementById('libraryList');
        if (!libraryList) {
            return;
        }
        
        const savedBlocks = storageManager.getAllSavedBlocks();
        
        if (savedBlocks.length === 0) {
            libraryList.innerHTML = `
                <div class="library-empty-state">
                    <div class="library-empty-state-icon">📚</div>
                    <div class="library-empty-state-title">No saved blocks yet</div>
                    <div class="library-empty-state-desc">Save a block from the canvas<br>to add it to your library</div>
                </div>
            `;
            return;
        }
        
        libraryList.innerHTML = savedBlocks.map(savedBlock => {
            const component = getComponent(savedBlock.type);
            const icon = component ? component.icon : '📦';
            const date = new Date(savedBlock.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
            const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            
            return `
                <div class="component-item library-item" 
                     data-saved-block-id="${savedBlock.id}"
                     draggable="true">
                    <div class="component-item-header">
                        <span class="component-item-icon">${icon}</span>
                        <span class="component-item-label">${savedBlock.name}</span>
                        <button class="library-item-delete" 
                                title="Delete from library"
                                onclick="event.stopPropagation(); window.emailBuilderApp.deleteSavedBlock('${savedBlock.id}')">
                            🗑️
                        </button>
                    </div>
                    ${savedBlock.thumbnail ? `
                        <div class="library-item-thumbnail">
                            <img src="${savedBlock.thumbnail}" alt="${savedBlock.name} preview" />
                        </div>
                    ` : ''}
                    <div class="component-item-desc">
                        <span style="font-weight: 500;">Saved:</span> ${dateStr} at ${timeStr}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Setup component tabs
     */
    setupComponentTabs() {
        const tabContainer = document.querySelector('.component-tabs');
        const componentsList = document.getElementById('componentsList');
        const libraryList = document.getElementById('libraryList');
        
        if (!tabContainer || !componentsList || !libraryList) {
            return;
        }
        
        // Remove existing listener if any
        if (this._tabClickHandler) {
            tabContainer.removeEventListener('click', this._tabClickHandler);
        }
        
        // Create handler function
        this._tabClickHandler = (e) => {
            const tab = e.target.closest('.component-tab');
            if (!tab) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = tab.dataset.tab;
            if (!tabName) return;
            
            const tabs = document.querySelectorAll('.component-tab');
            
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Re-query elements in case they were replaced
            const currentComponentsList = document.getElementById('componentsList');
            const currentLibraryList = document.getElementById('libraryList');
            
            if (!currentComponentsList || !currentLibraryList) {
                console.error('Lists not found');
                return;
            }
            
            // Show/hide lists
            if (tabName === 'general') {
                currentComponentsList.classList.remove('hidden');
                currentLibraryList.classList.add('hidden');
            } else if (tabName === 'library') {
                currentComponentsList.classList.add('hidden');
                currentLibraryList.classList.remove('hidden');
                this.renderLibraryComponents(); // Refresh library
            }
            
            // Re-initialize drag and drop
            setTimeout(() => {
                canvasManager.setupDragDrop();
            }, 100);
        };
        
        // Attach listener using event delegation
        tabContainer.addEventListener('click', this._tabClickHandler);
    }

    /**
     * Refresh library tab
     */
    refreshLibraryTab() {
        const libraryTab = document.querySelector('.component-tab[data-tab="library"]');
        if (libraryTab && libraryTab.classList.contains('active')) {
            this.renderLibraryComponents();
            setTimeout(() => {
                canvasManager.setupDragDrop();
            }, 100);
        }
    }

    /**
     * Delete saved block
     */
    deleteSavedBlock(blockId) {
        if (confirm('Delete this block from library?')) {
            storageManager.deleteSavedBlock(blockId);
            this.renderLibraryComponents();
            setTimeout(() => {
                canvasManager.setupDragDrop();
            }, 100);
        }
    }

    /**
     * Initialize top bar buttons
     */
    initTopBar() {
        // Undo/Redo
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            emailModel.undo();
            this.updateUndoRedoButtons();
        });
        
        document.getElementById('redoBtn')?.addEventListener('click', () => {
            emailModel.redo();
            this.updateUndoRedoButtons();
        });
        
        // Listen for undo state changes
        emailModel.on('undoStateChanged', () => {
            this.updateUndoRedoButtons();
        });
        
        // Save
        document.getElementById('saveBtn')?.addEventListener('click', () => {
            this.handleSave();
        });
        
        // Preview
        document.getElementById('previewBtn')?.addEventListener('click', () => {
            this.openPreview();
        });
        
        // Export
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.handleExport();
        });
        
        // Templates
        document.getElementById('templatesBtn')?.addEventListener('click', () => {
            this.openTemplates();
        });
        
        // Clear canvas
        document.getElementById('clearCanvasBtn')?.addEventListener('click', () => {
            if (confirm('Clear all blocks? This cannot be undone.')) {
                emailModel.clearAll();
            }
        });
        
        // Initial button state
        this.updateUndoRedoButtons();
    }

    /**
     * Update undo/redo button states
     */
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = !emailModel.canUndo();
            undoBtn.style.opacity = emailModel.canUndo() ? '1' : '0.5';
        }
        
        if (redoBtn) {
            redoBtn.disabled = !emailModel.canRedo();
            redoBtn.style.opacity = emailModel.canRedo() ? '1' : '0.5';
        }
    }

    /**
     * Handle save template
     */
    handleSave() {
        const name = prompt('Enter template name:', `Template ${new Date().toLocaleDateString()}`);
        if (!name) return;
        
        storageManager.saveTemplate(name, (templateId, thumbnail) => {
            console.log('Template saved with thumbnail:', templateId);
            // You could show a success message here
        });
        
        alert('Template saved!');
    }

    /**
     * Open preview modal
     */
    openPreview() {
        const modal = document.getElementById('previewModal');
        if (!modal) return;
        
        modal.classList.add('active');
        this.updatePreview();
    }

    /**
     * Close preview modal
     */
    closePreview() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Update preview content
     */
    updatePreview() {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;
        
        // Get preview HTML
        const html = emailExporter.exportHTML({
            subject: 'Email Preview'
        });
        
        // Create iframe
        let iframe = previewFrame.querySelector('iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '600px';
            iframe.style.border = 'none';
            previewFrame.innerHTML = '';
            previewFrame.appendChild(iframe);
        }
        
        // Write HTML to iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        
        // Update preview mode styling
        previewFrame.className = `preview-frame ${this.previewMode}`;
        
        if (this.previewMode === 'mobile') {
            iframe.style.width = '375px';
            iframe.style.transform = 'scale(1)';
        } else {
            iframe.style.width = '700px';
            iframe.style.transform = 'scale(1)';
        }
    }

    /**
     * Handle export
     */
    handleExport() {
        const choice = confirm('Copy HTML to clipboard? (OK = Copy, Cancel = Download)');
        
        if (choice) {
            emailExporter.copyToClipboard().then(success => {
                if (success) {
                    alert('HTML copied to clipboard!');
                } else {
                    alert('Failed to copy. Try downloading instead.');
                }
            });
        } else {
            const filename = prompt('Enter filename:', 'email-template.html');
            if (filename) {
                emailExporter.downloadHTML(filename);
                alert('HTML downloaded!');
            }
        }
    }

    /**
     * Open templates modal
     */
    openTemplates() {
        const modal = document.getElementById('templatesModal');
        if (!modal) return;
        
        modal.classList.add('active');
        this.renderTemplatesList();
    }

    /**
     * Close templates modal
     */
    closeTemplates() {
        const modal = document.getElementById('templatesModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Render templates list
     */
    renderTemplatesList() {
        const list = document.getElementById('templatesList');
        if (!list) return;
        
        const templates = storageManager.getAllTemplates();
        
        if (templates.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 40px;">No saved templates yet.</p>';
            return;
        }
        
        // Sort by date (newest first)
        templates.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        list.innerHTML = templates.map(template => `
            <div class="template-card">
                <div class="template-thumbnail">
                    ${template.thumbnail 
                        ? `<img src="${template.thumbnail}" alt="${template.name}">`
                        : '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--gray-400);">📄</div>'
                    }
                </div>
                <div class="template-info">
                    <div class="template-name">${template.name}</div>
                    <div class="template-date">${new Date(template.date).toLocaleDateString()}</div>
                </div>
                <div style="padding: 8px; display: flex; gap: 4px; border-top: 1px solid var(--gray-200);">
                    <button class="small-btn" onclick="window.emailBuilderApp.loadTemplate('${template.id}')" style="flex: 1;">Load</button>
                    <button class="small-btn" onclick="window.emailBuilderApp.duplicateTemplate('${template.id}')">📋</button>
                    <button class="small-btn" onclick="window.emailBuilderApp.deleteTemplate('${template.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load template
     */
    loadTemplate(templateId) {
        if (storageManager.loadTemplate(templateId)) {
            this.closeTemplates();
            alert('Template loaded!');
        } else {
            alert('Failed to load template');
        }
    }

    /**
     * Duplicate template
     */
    duplicateTemplate(templateId) {
        storageManager.duplicateTemplate(templateId);
        this.renderTemplatesList();
    }

    /**
     * Delete template
     */
    deleteTemplate(templateId) {
        if (confirm('Delete this template?')) {
            storageManager.deleteTemplate(templateId);
            this.renderTemplatesList();
        }
    }

    /**
     * Initialize modals
     */
    initModals() {
        // Preview modal
        this.previewModal = document.getElementById('previewModal');
        
        document.getElementById('closePreviewBtn')?.addEventListener('click', () => {
            this.closePreview();
        });
        
        // Preview mode toggles
        document.getElementById('previewDesktopBtn')?.addEventListener('click', () => {
            this.previewMode = 'desktop';
            document.querySelectorAll('.preview-toggle').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById('previewDesktopBtn')?.classList.add('active');
            this.updatePreview();
        });
        
        document.getElementById('previewMobileBtn')?.addEventListener('click', () => {
            this.previewMode = 'mobile';
            document.querySelectorAll('.preview-toggle').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById('previewMobileBtn')?.classList.add('active');
            this.updatePreview();
        });
        
        // Close modal on background click
        this.previewModal?.addEventListener('click', (e) => {
            if (e.target === this.previewModal) {
                this.closePreview();
            }
        });
        
        // Templates modal
        this.templatesModal = document.getElementById('templatesModal');
        
        document.getElementById('closeTemplatesBtn')?.addEventListener('click', () => {
            this.closeTemplates();
        });
        
        this.templatesModal?.addEventListener('click', (e) => {
            if (e.target === this.templatesModal) {
                this.closeTemplates();
            }
        });
    }

    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S - Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleSave();
                return;
            }
            
            // Ctrl/Cmd + Z - Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (emailModel.canUndo()) {
                    emailModel.undo();
                    this.updateUndoRedoButtons();
                }
                return;
            }
            
            // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
            if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
                ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                e.preventDefault();
                if (emailModel.canRedo()) {
                    emailModel.redo();
                    this.updateUndoRedoButtons();
                }
                return;
            }
            
            // Delete - Delete selected block
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selected = emailModel.getSelectedBlock();
                if (selected && document.activeElement.tagName !== 'INPUT' && 
                    document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    emailModel.removeBlock(selected.id);
                }
                return;
            }
            
            // Esc - Deselect
            if (e.key === 'Escape') {
                emailModel.selectBlock(null);
                return;
            }
            
            // Ctrl/Cmd + D - Duplicate selected block
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                const selected = emailModel.getSelectedBlock();
                if (selected) {
                    emailModel.duplicateBlock(selected.id);
                }
                return;
            }
        });
    }
}

// Initialize app when DOM is ready
let emailBuilderApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        emailBuilderApp = new EmailBuilderApp();
        emailBuilderApp.init();
        window.emailBuilderApp = emailBuilderApp; // Expose globally for template buttons
    });
} else {
    emailBuilderApp = new EmailBuilderApp();
    emailBuilderApp.init();
    window.emailBuilderApp = emailBuilderApp;
}

