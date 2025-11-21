/**
 * ========================================
 * Canvas Rendering & Manipulation
 * ========================================
 * 
 * This module handles:
 * - Rendering blocks on the canvas
 * - Drag and drop from sidebar to canvas
 * - Reordering blocks within canvas
 * - Block selection
 * - Block controls (duplicate, delete)
 */

import { emailModel } from './model.js';
import { renderBlockHTML, getComponent } from './components.js';

class CanvasManager {
    constructor() {
        this.canvas = null;
        this.emptyState = null;
        this.sortableInstance = null;
        this.dragDropHandlers = {
            componentsList: {
                dragstart: null,
                dragend: null
            },
            canvas: {
                dragover: null,
                dragleave: null,
                drop: null
            }
        };
    }

    /**
     * Initialize the canvas
     */
    init(canvasElement, emptyStateElement) {
        this.canvas = canvasElement;
        this.emptyState = emptyStateElement;
        
        // Setup drag and drop for blocks
        this.setupDragDrop();
        
        // Listen for model changes
        emailModel.on('blocksChanged', () => this.render());
        emailModel.on('selectionChanged', () => this.updateSelection());
        
        // Deselect block when clicking outside canvas
        this.setupClickOutsideDeselect();
    }
    
    /**
     * Setup click outside canvas to deselect blocks
     */
    setupClickOutsideDeselect() {
        document.addEventListener('click', (e) => {
            // Don't deselect if clicking on:
            // - Canvas blocks (they handle their own selection)
            // - Properties panel
            // - Component list
            // - Modal overlays
            // - Top bar
            if (
                e.target.closest('.canvas-block') ||
                e.target.closest('.right-sidebar') ||
                e.target.closest('.left-sidebar') ||
                e.target.closest('.modal') ||
                e.target.closest('.top-bar')
            ) {
                return;
            }
            
            // Deselect if clicking on canvas background (empty space) or outside canvas area
            if (emailModel.getSelectedBlock()) {
                emailModel.selectBlock(null);
            }
        });
    }

    /**
     * Render all blocks on canvas
     */
    render() {
        if (!this.canvas) return;
        
        const blocks = emailModel.getAllBlocks();
        
        // Show/hide empty state
        if (blocks.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.canvas.innerHTML = '';
        } else {
            this.emptyState.classList.add('hidden');
            this.renderBlocks(blocks);
        }
        
        // Setup Sortable for reordering
        this.setupSortable();
    }

    /**
     * Render blocks array
     */
    renderBlocks(blocks) {
        const fragment = document.createDocumentFragment();
        
        blocks.forEach(block => {
            const blockElement = this.createBlockElement(block);
            fragment.appendChild(blockElement);
        });
        
        this.canvas.innerHTML = '';
        this.canvas.appendChild(fragment);
    }

    /**
     * Create a block element for canvas
     * This is the visual representation in the builder, NOT the email HTML
     */
    createBlockElement(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'canvas-block';
        wrapper.dataset.blockId = block.id;
        
        // Check if selected
        if (emailModel.getSelectedBlock()?.id === block.id) {
            wrapper.classList.add('selected');
        }
        
        // Controls bar
        const controls = document.createElement('div');
        controls.className = 'canvas-block-controls';
        
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'block-control-btn';
        duplicateBtn.title = 'Duplicate (Ctrl+D)';
        duplicateBtn.innerHTML = '📋';
        duplicateBtn.onclick = (e) => {
            e.stopPropagation();
            this.duplicateBlock(block.id);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'block-control-btn';
        deleteBtn.title = 'Delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteBlock(block.id);
        };
        
        controls.appendChild(duplicateBtn);
        controls.appendChild(deleteBtn);
        
        // Block content (this shows preview of email HTML)
        const content = document.createElement('div');
        content.className = 'canvas-block-content';
        content.innerHTML = this.renderBlockPreview(block);
        
        // Click to select
        wrapper.onclick = (e) => {
            if (e.target.closest('.canvas-block-controls')) return;
            this.selectBlock(block.id);
        };
        
        wrapper.appendChild(controls);
        wrapper.appendChild(content);
        
        return wrapper;
    }

    /**
     * Render block preview (shows what it will look like in email)
     */
    renderBlockPreview(block) {
        const component = getComponent(block.type);
        if (!component) return '';
        
        // Use the email HTML template for preview
        return component.htmlTemplate(block.data);
    }

    /**
     * Select a block
     */
    selectBlock(blockId) {
        emailModel.selectBlock(blockId);
    }

    /**
     * Update visual selection
     */
    updateSelection() {
        if (!this.canvas) return;
        
        const selectedBlock = emailModel.getSelectedBlock();
        const blockElements = this.canvas.querySelectorAll('.canvas-block');
        
        blockElements.forEach(el => {
            if (el.dataset.blockId === selectedBlock?.id) {
                el.classList.add('selected');
                // Scroll into view
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                el.classList.remove('selected');
            }
        });
    }

    /**
     * Duplicate a block
     */
    duplicateBlock(blockId) {
        emailModel.duplicateBlock(blockId);
        // Select the duplicated block
        const newId = emailModel.getAllBlocks().find(b => b.id !== blockId)?.id;
        if (newId) {
            emailModel.selectBlock(newId);
        }
    }

    /**
     * Delete a block
     */
    deleteBlock(blockId) {
        if (confirm('Delete this block?')) {
            emailModel.removeBlock(blockId);
        }
    }

    /**
     * Setup drag and drop from sidebar
     */
    setupDragDrop() {
        // Remove existing listeners if they exist
        this.removeDragDropListeners();
        
        // Use event delegation for component items (handles dynamically added items)
        const componentsList = document.getElementById('componentsList');
        
        if (componentsList) {
            // Create handler functions
            this.dragDropHandlers.componentsList.dragstart = (e) => {
                const item = e.target.closest('.component-item');
                if (!item) return;
                
                const componentType = item.dataset.componentType;
                if (componentType) {
                    e.dataTransfer.setData('componentType', componentType);
                    e.dataTransfer.effectAllowed = 'copy';
                    item.style.opacity = '0.5';
                }
            };
            
            this.dragDropHandlers.componentsList.dragend = (e) => {
                const item = e.target.closest('.component-item');
                if (item) {
                    item.style.opacity = '1';
                }
            };
            
            // Add listeners
            componentsList.addEventListener('dragstart', this.dragDropHandlers.componentsList.dragstart);
            componentsList.addEventListener('dragend', this.dragDropHandlers.componentsList.dragend);
        }
        
        // Make canvas a drop zone
        if (this.canvas) {
            // Create handler functions
            this.dragDropHandlers.canvas.dragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                
                // Highlight canvas
                this.canvas.style.borderColor = '#2563eb';
                this.canvas.style.backgroundColor = '#eff6ff';
            };
            
            this.dragDropHandlers.canvas.dragleave = (e) => {
                // Only hide highlight if leaving canvas area
                if (!this.canvas.contains(e.relatedTarget)) {
                    this.canvas.style.borderColor = '';
                    this.canvas.style.backgroundColor = '';
                }
            };
            
            this.dragDropHandlers.canvas.drop = (e) => {
                e.preventDefault();
                
                // Reset canvas styling
                this.canvas.style.borderColor = '';
                this.canvas.style.backgroundColor = '';
                
                const componentType = e.dataTransfer.getData('componentType');
                if (componentType) {
                    this.addBlockFromSidebar(componentType);
                }
            };
            
            // Add listeners
            this.canvas.addEventListener('dragover', this.dragDropHandlers.canvas.dragover);
            this.canvas.addEventListener('dragleave', this.dragDropHandlers.canvas.dragleave);
            this.canvas.addEventListener('drop', this.dragDropHandlers.canvas.drop);
        }
    }
    
    /**
     * Remove drag and drop event listeners
     */
    removeDragDropListeners() {
        const componentsList = document.getElementById('componentsList');
        
        if (componentsList && this.dragDropHandlers.componentsList.dragstart) {
            componentsList.removeEventListener('dragstart', this.dragDropHandlers.componentsList.dragstart);
            componentsList.removeEventListener('dragend', this.dragDropHandlers.componentsList.dragend);
            this.dragDropHandlers.componentsList.dragstart = null;
            this.dragDropHandlers.componentsList.dragend = null;
        }
        
        if (this.canvas && this.dragDropHandlers.canvas.dragover) {
            this.canvas.removeEventListener('dragover', this.dragDropHandlers.canvas.dragover);
            this.canvas.removeEventListener('dragleave', this.dragDropHandlers.canvas.dragleave);
            this.canvas.removeEventListener('drop', this.dragDropHandlers.canvas.drop);
            this.dragDropHandlers.canvas.dragover = null;
            this.dragDropHandlers.canvas.dragleave = null;
            this.dragDropHandlers.canvas.drop = null;
        }
    }

    /**
     * Add block from sidebar (called when component is dropped)
     */
    addBlockFromSidebar(componentType) {
        const component = getComponent(componentType);
        if (!component) {
            console.error('Component not found:', componentType);
            return;
        }
        
        const blockId = emailModel.addBlock({
            type: componentType,
            data: { ...component.defaultData }
        });
        
        // Select the newly added block
        emailModel.selectBlock(blockId);
        
        // Scroll to new block
        setTimeout(() => {
            const blockEl = this.canvas.querySelector(`[data-block-id="${blockId}"]`);
            if (blockEl) {
                blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }


    /**
     * Setup Sortable.js for reordering blocks
     */
    setupSortable() {
        // Destroy existing instance
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }
        
        if (!this.canvas || this.canvas.children.length === 0) return;
        
        // Initialize Sortable
        this.sortableInstance = new Sortable(this.canvas, {
            animation: 150,
            handle: '.canvas-block', // Can drag from anywhere on block
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                // Update model order
                const blockId = evt.item.dataset.blockId;
                const newIndex = evt.newIndex;
                emailModel.moveBlock(blockId, newIndex);
            }
        });
    }
}

// Export singleton instance
export const canvasManager = new CanvasManager();

