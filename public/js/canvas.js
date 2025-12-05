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
import { storageManager } from './storage.js';
import { getComponent, renderBlockHTML } from './components.js';

class CanvasManager {
    constructor() {
        this.canvas = null;
        this.emptyState = null;
        this.sortableInstance = null;
        this.rowSortableInstances = new Map(); // Track sortable instances for each row
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
        
        // Setup global event delegation for row child block controls
        this.setupRowChildControls();
        
        // Listen for model changes
        emailModel.on('blocksChanged', () => this.render());
        emailModel.on('selectionChanged', () => this.updateSelection());
        
        // Deselect block when clicking outside canvas
        this.setupClickOutsideDeselect();
    }

    /**
     * Setup event delegation for row child block controls
     * This handles controls for blocks inside rows
     */
    setupRowChildControls() {
        // Use event delegation on the canvas to handle all row child controls
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => {
                // Check if clicking on a row child block control button
                // Try multiple selectors to catch the button
                let btn = e.target.closest('.row-child-block-controls .block-control-btn');
                if (!btn) {
                    // Maybe the button itself was clicked
                    btn = e.target.closest('.block-control-btn');
                    if (btn && btn.closest('.row-child-block-controls')) {
                        // It's a row child control button
                    } else {
                        btn = null;
                    }
                }
                
                if (btn) {
                    e.stopPropagation();
                    e.preventDefault();
                    const action = btn.getAttribute('data-action') || btn.dataset.action;
                    const blockId = btn.getAttribute('data-block-id') || btn.dataset.blockId;
                    
                    console.log('Row child control clicked:', { action, blockId, btn }); // Debug
                    
                    if (blockId && action) {
                        if (action === 'duplicate') {
                            this.duplicateBlock(blockId);
                        } else if (action === 'save') {
                            this.saveBlockToLibrary(blockId);
                        } else if (action === 'delete') {
                            console.log('Calling deleteBlock with:', blockId); // Debug
                            this.deleteBlock(blockId);
                        }
                    }
                    return false;
                }
            }, true); // Use capture phase to catch events earlier
        }
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
            // Only render top-level blocks (not nested ones)
            if (!block.parentId) {
                const blockElement = this.createBlockElement(block);
                fragment.appendChild(blockElement);
            }
        });
        
        this.canvas.innerHTML = '';
        this.canvas.appendChild(fragment);
        
        // Setup sortable for rows after rendering
        setTimeout(() => {
            this.setupRowSortables();
            this.attachRowChildControls();
        }, 0);
    }

    /**
     * Attach event handlers to row child block controls
     */
    attachRowChildControls() {
        if (!this.canvas) return;
        
        // Find all row child block control buttons
        const buttons = this.canvas.querySelectorAll('.row-child-block-controls .block-control-btn');
        console.log('Found row child control buttons:', buttons.length); // Debug
        
        buttons.forEach((btn, index) => {
            const action = btn.getAttribute('data-action');
            const blockId = btn.getAttribute('data-block-id');
            console.log(`Button ${index}:`, { action, blockId, element: btn }); // Debug
            
            // Remove any existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add click handler with mousedown as backup
            const handleClick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const action = newBtn.getAttribute('data-action');
                const blockId = newBtn.getAttribute('data-block-id');
                
                console.log('Button clicked:', { action, blockId, event: e.type }); // Debug
                
                if (blockId && action) {
                    if (action === 'duplicate') {
                        this.duplicateBlock(blockId);
                    } else if (action === 'save') {
                        this.saveBlockToLibrary(blockId);
                    } else if (action === 'delete') {
                        console.log('Delete button clicked for block:', blockId); // Debug
                        this.deleteBlock(blockId);
                    }
                }
                return false;
            };
            
            newBtn.addEventListener('click', handleClick, true);
            newBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            }, true);
        });
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
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'block-control-btn';
        saveBtn.title = 'Save to Library';
        saveBtn.innerHTML = '💾';
        saveBtn.onclick = (e) => {
            e.stopPropagation();
            this.saveBlockToLibrary(block.id);
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
        controls.appendChild(saveBtn);
        controls.appendChild(deleteBtn);
        
        // Block content (this shows preview of email HTML)
        const content = document.createElement('div');
        content.className = 'canvas-block-content';
        content.innerHTML = this.renderBlockPreview(block);
        
        // For row components, make the content area a drop zone
        if (block.type === 'row') {
            content.classList.add('row-drop-zone');
            content.dataset.rowId = block.id;
            this.setupRowDropZone(content, block.id);
        }
        
        // Click to select (but not if clicking on child blocks)
        wrapper.onclick = (e) => {
            if (e.target.closest('.canvas-block-controls')) return;
            // Don't select row if clicking on a child block
            if (block.type === 'row' && e.target.closest('.row-child-block')) {
                const childBlockElement = e.target.closest('.row-child-block');
                const childBlockId = childBlockElement?.dataset.childBlockId;
                if (childBlockId) {
                    // Stop event propagation to prevent row selection
                    e.stopPropagation();
                    this.selectBlock(childBlockId);
                    return;
                }
            }
            this.selectBlock(block.id);
        };
        
        // Add click handler to child blocks for selection (controls handled globally)
        if (block.type === 'row') {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                const rowContent = wrapper.querySelector('.row-children');
                if (rowContent) {
                    // Use event delegation for child block selection
                    rowContent.addEventListener('click', (e) => {
                        // Don't handle if clicking on controls (handled globally)
                        if (e.target.closest('.row-child-block-controls')) {
                            return;
                        }
                        
                        // Handle child block selection
                        const childBlock = e.target.closest('.row-child-block');
                        if (childBlock) {
                            e.stopPropagation();
                            const childBlockId = childBlock.dataset.childBlockId;
                            if (childBlockId) {
                                this.selectBlock(childBlockId);
                            }
                        }
                    });
                }
            }, 0);
        }
        
        wrapper.appendChild(controls);
        wrapper.appendChild(content);
        
        return wrapper;
    }

    /**
     * Setup drop zone for row component
     */
    setupRowDropZone(rowContentElement, rowId) {
        rowContentElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            rowContentElement.classList.add('row-drop-zone-active');
        });
        
        rowContentElement.addEventListener('dragleave', (e) => {
            if (!rowContentElement.contains(e.relatedTarget)) {
                rowContentElement.classList.remove('row-drop-zone-active');
            }
        });
        
        rowContentElement.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            rowContentElement.classList.remove('row-drop-zone-active');
            
            const componentType = e.dataTransfer.getData('componentType');
            const savedBlockId = e.dataTransfer.getData('savedBlockId');
            
            if (savedBlockId) {
                this.addSavedBlockToRow(savedBlockId, rowId);
            } else if (componentType) {
                this.addBlockToRow(componentType, rowId);
            }
        });
    }

    /**
     * Add block to row from sidebar
     */
    addBlockToRow(componentType, rowId) {
        const component = getComponent(componentType);
        if (!component) {
            console.error('Component not found:', componentType);
            return;
        }
        
        const blockId = emailModel.addBlock({
            type: componentType,
            data: { ...component.defaultData }
        }, rowId);
        
        // Select the newly added block
        emailModel.selectBlock(blockId);
    }

    /**
     * Add saved block to row from library
     */
    addSavedBlockToRow(savedBlockId, rowId) {
        const savedBlock = storageManager.getSavedBlock(savedBlockId);
        if (!savedBlock) {
            console.error('Saved block not found:', savedBlockId);
            return;
        }
        
        const blockId = emailModel.addBlock({
            type: savedBlock.type,
            data: { ...savedBlock.data }
        }, rowId);
        
        // Select the newly added block
        emailModel.selectBlock(blockId);
    }

    /**
     * Render block preview (shows what it will look like in email)
     */
    renderBlockPreview(block) {
        const component = getComponent(block.type);
        if (!component) return '';
        
        // Handle row component with nested children
        if (block.type === 'row') {
            const childBlocks = emailModel.getChildBlocks(block.id);
            if (childBlocks && childBlocks.length > 0) {
                // Render children in a sortable container
                const childrenHTML = childBlocks.map(childBlock => {
                    const childPreview = this.renderBlockPreview(childBlock);
                    const blockId = childBlock.id;
                    return `<div class="row-child-block" data-child-block-id="${blockId}" draggable="true">
                        <div class="row-child-block-controls">
                            <button type="button" class="block-control-btn" title="Duplicate" data-action="duplicate" data-block-id="${blockId}">📋</button>
                            <button type="button" class="block-control-btn" title="Save to Library" data-action="save" data-block-id="${blockId}">💾</button>
                            <button type="button" class="block-control-btn" title="Delete" data-action="delete" data-block-id="${blockId}">🗑️</button>
                        </div>
                        <div class="row-child-block-content">${childPreview}</div>
                    </div>`;
                }).join('');
                
                // Create a wrapper for the row content
                const gap = block.data.gap || '20px';
                return `
                    <div class="row-container" style="background-color: ${block.data.backgroundColor || '#ffffff'}; padding: ${block.data.padding || '20px'};">
                        <div class="row-children" data-row-id="${block.id}" style="display: flex; flex-direction: column; gap: ${gap};">
                            ${childrenHTML}
                        </div>
                    </div>
                `;
            } else {
                // Empty row - show drop zone
                return `
                    <div class="row-container row-empty" style="background-color: ${block.data.backgroundColor || '#ffffff'}; padding: ${block.data.padding || '20px'}; min-height: 100px; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;">
                        <p style="margin: 0; color: #94a3b8; font-size: 14px;">Drop components here</p>
                    </div>
                `;
            }
        }
        
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
        const childBlockElements = this.canvas.querySelectorAll('.row-child-block');
        
        // Update top-level block selection
        blockElements.forEach(el => {
            if (el.dataset.blockId === selectedBlock?.id) {
                el.classList.add('selected');
                // Scroll into view
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                el.classList.remove('selected');
            }
        });
        
        // Update child block selection (inside rows)
        childBlockElements.forEach(el => {
            if (el.dataset.childBlockId === selectedBlock?.id) {
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
        const duplicatedId = emailModel.duplicateBlock(blockId);
        if (duplicatedId) {
            // Select the duplicated block
            emailModel.selectBlock(duplicatedId);
        }
    }

    /**
     * Delete a block
     */
    deleteBlock(blockId) {
        console.log('deleteBlock called with:', blockId); // Debug
        if (!blockId) {
            console.error('No blockId provided to deleteBlock');
            return;
        }
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
        
        // Handle both components list and library list
        const libraryList = document.getElementById('libraryList');
        
        // Setup drag handlers for components list
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
        
        // Setup drag handlers for library list
        if (libraryList) {
            libraryList.addEventListener('dragstart', (e) => {
                const item = e.target.closest('.library-item');
                if (!item) return;
                
                const savedBlockId = item.dataset.savedBlockId;
                if (savedBlockId) {
                    e.dataTransfer.setData('savedBlockId', savedBlockId);
                    e.dataTransfer.effectAllowed = 'copy';
                    item.style.opacity = '0.5';
                }
            });
            
            libraryList.addEventListener('dragend', (e) => {
                const item = e.target.closest('.library-item');
                if (item) {
                    item.style.opacity = '1';
                }
            });
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
                
                // Check if dropping into a row (handled by row drop zone)
                if (e.target.closest('.row-drop-zone')) {
                    return; // Row drop zone handles it
                }
                
                const componentType = e.dataTransfer.getData('componentType');
                const savedBlockId = e.dataTransfer.getData('savedBlockId');
                
                if (savedBlockId) {
                    this.addSavedBlockFromLibrary(savedBlockId);
                } else if (componentType) {
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
        const libraryList = document.getElementById('libraryList');
        
        if (componentsList && this.dragDropHandlers.componentsList.dragstart) {
            componentsList.removeEventListener('dragstart', this.dragDropHandlers.componentsList.dragstart);
            componentsList.removeEventListener('dragend', this.dragDropHandlers.componentsList.dragend);
            this.dragDropHandlers.componentsList.dragstart = null;
            this.dragDropHandlers.componentsList.dragend = null;
        }
        
        // Remove listeners from library list by cloning (simpler approach)
        if (libraryList) {
            const newList = libraryList.cloneNode(true);
            libraryList.parentNode.replaceChild(newList, libraryList);
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
     * Add saved block from library
     */
    addSavedBlockFromLibrary(savedBlockId) {
        const savedBlock = storageManager.getSavedBlock(savedBlockId);
        if (!savedBlock) {
            console.error('Saved block not found:', savedBlockId);
            return;
        }
        
        const blockId = emailModel.addBlock({
            type: savedBlock.type,
            data: { ...savedBlock.data }
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
     * Save block to library
     */
    async saveBlockToLibrary(blockId) {
        const block = emailModel.getBlock(blockId);
        if (!block) {
            console.error('Block not found:', blockId);
            return;
        }
        
        const name = prompt('Enter a name for this block:', `${block.type} Block`);
        if (!name) return;
        
        try {
            await storageManager.saveBlock(block, name);
            
            // Refresh library tab if it's active
            if (window.emailBuilderApp) {
                window.emailBuilderApp.refreshLibraryTab();
            }
            
            alert('Block saved to library!');
        } catch (error) {
            console.error('Error saving block:', error);
            alert('Error saving block to library.');
        }
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
        
        // Initialize Sortable for top-level canvas
        this.sortableInstance = new Sortable(this.canvas, {
            animation: 150,
            handle: '.canvas-block', // Can drag from anywhere on block
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            filter: '.row-children, .row-child-block', // Don't sort row children here
            onEnd: (evt) => {
                // Only handle top-level blocks
                const blockId = evt.item.dataset.blockId;
                if (blockId) {
                    const newIndex = evt.newIndex;
                    emailModel.moveBlock(blockId, newIndex);
                }
            }
        });
        
        // Setup Sortable for each row's children
        this.setupRowSortables();
    }

    /**
     * Setup Sortable.js for row children
     */
    setupRowSortables() {
        // Destroy existing row sortable instances
        this.rowSortableInstances.forEach((instance, rowId) => {
            if (instance) {
                instance.destroy();
            }
        });
        this.rowSortableInstances.clear();
        
        // Find all row children containers
        const rowChildrenContainers = this.canvas.querySelectorAll('.row-children');
        
        rowChildrenContainers.forEach(container => {
            const rowId = container.dataset.rowId;
            if (!rowId) return;
            
            // Initialize Sortable for this row's children
            const sortableInstance = new Sortable(container, {
                animation: 150,
                handle: '.row-child-block', // Can drag from anywhere on child block
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                group: 'row-children', // Allow dragging between rows if needed
                onEnd: (evt) => {
                    // Update model order within the row
                    const childBlockId = evt.item.dataset.childBlockId;
                    if (childBlockId && rowId) {
                        const newIndex = evt.newIndex;
                        emailModel.moveBlock(childBlockId, newIndex, rowId);
                    }
                }
            });
            
            // Store the instance
            this.rowSortableInstances.set(rowId, sortableInstance);
        });
    }
}

// Export singleton instance
export const canvasManager = new CanvasManager();

