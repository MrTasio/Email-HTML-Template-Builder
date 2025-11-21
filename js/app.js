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
        
        // Import
        document.getElementById('importBtn')?.addEventListener('click', () => {
            this.handleImport();
        });
        
        // File input change handler
        document.getElementById('importFileInput')?.addEventListener('change', (e) => {
            this.processImportFile(e.target.files[0]);
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
        const exportFormat = confirm(
            'What would you like to export?\n\n' +
            'OK = Export as JSON (shareable template file)\n' +
            'Cancel = Export as HTML (email-ready)'
        );
        
        if (exportFormat) {
            // Export as JSON for sharing
            this.exportTemplateJSON();
            alert('Template exported as JSON! Share this file with others to import.');
        } else {
            // Export as HTML (original behavior)
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
    }

    /**
     * Handle import - trigger file input
     */
    handleImport() {
        const fileInput = document.getElementById('importFileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Process imported file
     */
    async processImportFile(file) {
        if (!file) return;
        
        // Validate file type
        if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
            alert('Please import a JSON file (.json or .txt)');
            return;
        }
        
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            
            // Validate JSON structure
            if (!jsonData || typeof jsonData !== 'object') {
                throw new Error('Invalid JSON format');
            }
            
            // Determine import type
            if (jsonData.blocks && Array.isArray(jsonData.blocks)) {
                // It's a full template
                this.importTemplate(jsonData);
            } else if (jsonData.type && jsonData.data) {
                // It's a single block (either direct format or saved block format)
                this.importBlock(jsonData, file.name);
            } else if (jsonData.name && jsonData.type && jsonData.data) {
                // It's a saved block format from library
                this.importBlock(jsonData, jsonData.name);
            } else {
                throw new Error('Invalid template/block format. Expected:\n- Template: { blocks: [], version: "1.0" }\n- Block: { type: "...", data: {...} }');
            }
            
        } catch (error) {
            console.error('Import error:', error);
            alert(`Failed to import: ${error.message || 'Invalid file format'}`);
        }
        
        // Reset file input
        const fileInput = document.getElementById('importFileInput');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /**
     * Import template (full email template)
     */
    importTemplate(templateData) {
        const confirmReplace = confirm(
            'Import this template?\n\n' +
            'This will replace your current canvas.\n' +
            'OK = Replace, Cancel = Append to existing blocks'
        );
        
        if (confirmReplace) {
            // Replace current canvas
            emailModel.fromJSON(templateData);
            alert('Template imported successfully!');
        } else {
            // Append to existing blocks
            const blocks = templateData.blocks || [];
            blocks.forEach(block => {
                emailModel.addBlock({
                    type: block.type,
                    data: block.data
                });
            });
            alert(`Imported ${blocks.length} block(s) to your canvas!`);
        }
    }

    /**
     * Import single block to library
     */
    async importBlock(blockData, filenameOrName) {
        // Use name from data if available, otherwise use filename
        const defaultName = blockData.name || (typeof filenameOrName === 'string' ? filenameOrName.replace(/\.(json|txt)$/i, '') : 'Imported Block');
        const blockName = prompt(
            'Enter a name for this block:',
            defaultName
        );
        
        if (!blockName) return;
        
        try {
            // Validate block structure
            if (!blockData.type || !blockData.data) {
                throw new Error('Invalid block format. Block must have type and data.');
            }
            
            // Check if component type exists
            const component = getComponent(blockData.type);
            if (!component) {
                throw new Error(`Component type "${blockData.type}" not found.`);
            }
            
            // Create block object for library
            const block = {
                id: blockData.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: blockData.type,
                data: blockData.data
            };
            
            // Save to library
            await storageManager.saveBlock(block, blockName);
            
            // Refresh library tab if it's active
            this.refreshLibraryTab();
            
            alert('Block imported to library successfully!');
        } catch (error) {
            console.error('Block import error:', error);
            alert(`Failed to import block: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Export template as JSON (for sharing)
     */
    exportTemplateJSON() {
        const templateData = emailModel.toJSON();
        const jsonString = JSON.stringify(templateData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'email-template.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
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

