/**
 * ========================================
 * Data Model & State Management
 * ========================================
 * 
 * This module manages the email template structure.
 * We use a JSON model approach instead of directly manipulating the DOM.
 * This keeps our code clean and makes undo/redo easier.
 * 
 * Data Structure:
 * [
 *   {
 *     id: "block-123",
 *     type: "text",
 *     data: { content: "<p>Hello</p>", fontSize: 16, ... }
 *   },
 *   { ... }
 * ]
 */

class EmailModel {
    constructor() {
        // Current template blocks (top-level only)
        this.blocks = [];
        
        // Map of all blocks (including nested) for quick access
        this.allBlocksMap = {};
        
        // Undo/Redo stacks
        this.undoStack = [];
        this.redoStack = [];
        
        // Currently selected block ID
        this.selectedBlockId = null;
        
        // Listeners for state changes
        this.listeners = {
            blocksChanged: [],
            selectionChanged: [],
            undoStateChanged: []
        };
    }

    /**
     * Add a new block to the canvas
     * @param {Object} block - Block object with type and data
     * @param {string} parentId - Optional parent block ID (for nested blocks)
     * @returns {string} - The ID of the created block
     */
    addBlock(block, parentId = null) {
        // Generate unique ID
        const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newBlock = {
            id,
            type: block.type,
            data: { ...block.data },
            parentId: parentId || null
        };
        
        // Update blocks map
        if (!this.allBlocksMap) this.allBlocksMap = {};
        this.allBlocksMap[id] = newBlock;
        
        // Save state for undo
        this.saveState();
        
        // If parent is specified, add to parent's children array
        if (parentId) {
            const parentBlock = this.getBlockById(parentId);
            if (parentBlock && parentBlock.type === 'row') {
                if (!parentBlock.data.children) {
                    parentBlock.data.children = [];
                }
                parentBlock.data.children.push(id);
            }
        } else {
            // Add to top-level blocks array
            this.blocks.push(newBlock);
        }
        
        // Notify listeners
        this.notifyListeners('blocksChanged');
        
        return id;
    }

    /**
     * Insert block at specific index
     * @param {Object} block - Block to insert
     * @param {number} index - Position to insert at
     * @returns {string} - Block ID
     */
    insertBlock(block, index) {
        const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newBlock = {
            id,
            type: block.type,
            data: { ...block.data },
            parentId: null
        };
        
        // Update blocks map
        if (!this.allBlocksMap) this.allBlocksMap = {};
        this.allBlocksMap[id] = newBlock;
        
        this.saveState();
        
        this.blocks.splice(index, 0, newBlock);
        this.notifyListeners('blocksChanged');
        
        return id;
    }

    /**
     * Remove a block by ID
     * @param {string} blockId - ID of block to remove
     */
    removeBlock(blockId) {
        this.saveState();
        
        const block = this.getBlockById(blockId);
        if (!block) return;
        
        // If block has a parent, remove from parent's children array
        if (block.parentId) {
            const parentBlock = this.getBlockById(block.parentId);
            if (parentBlock && parentBlock.data.children) {
                parentBlock.data.children = parentBlock.data.children.filter(id => id !== blockId);
            }
        } else {
            // Remove from top-level blocks
            this.blocks = this.blocks.filter(b => b.id !== blockId);
        }
        
        // If it's a row, also remove all its children
        if (block.type === 'row' && block.data.children) {
            block.data.children.forEach(childId => {
                this.removeBlock(childId);
            });
        }
        
        // Clear selection if deleted block was selected
        if (this.selectedBlockId === blockId) {
            this.selectedBlockId = null;
            this.notifyListeners('selectionChanged');
        }
        
        this.notifyListeners('blocksChanged');
    }

    /**
     * Update block data
     * @param {string} blockId - ID of block to update
     * @param {Object} updates - Properties to update
     */
    updateBlock(blockId, updates) {
        const block = this.getBlockById(blockId);
        if (!block) return;
        
        // Only save state if this is a significant change (not during typing)
        const shouldSaveState = !this.isTyping;
        if (shouldSaveState) {
            this.saveState();
        }
        
        // Merge updates
        block.data = { ...block.data, ...updates };
        
        // Update map if it exists
        if (this.allBlocksMap && this.allBlocksMap[blockId]) {
            this.allBlocksMap[blockId] = block;
        }
        
        this.notifyListeners('blocksChanged');
    }

    /**
     * Get a block by ID (top-level only, for backward compatibility)
     * @param {string} blockId - Block ID
     * @returns {Object|null} - Block object or null
     */
    getBlock(blockId) {
        // First check the map if it exists
        if (this.allBlocksMap && this.allBlocksMap[blockId]) {
            return this.allBlocksMap[blockId];
        }
        return this.getBlockById(blockId);
    }

    /**
     * Get all blocks (top-level only)
     * @returns {Array} - Array of blocks
     */
    getAllBlocks() {
        return [...this.blocks];
    }

    /**
     * Get all blocks including nested ones
     * @returns {Array} - Array of all blocks (flat)
     */
    getAllBlocksFlat() {
        // Start with top-level blocks
        const allBlocks = [...this.blocks];
        
        // If we have a blocks map, use it to get all blocks
        if (this.allBlocksMap && Object.keys(this.allBlocksMap).length > 0) {
            const blockIds = new Set();
            // Add all top-level block IDs
            this.blocks.forEach(block => blockIds.add(block.id));
            
            // Recursively collect nested blocks from map
            const collectNested = (blockId) => {
                if (blockIds.has(blockId)) return; // Already added
                const block = this.allBlocksMap[blockId];
                if (block) {
                    allBlocks.push(block);
                    blockIds.add(blockId);
                    // If it's a row, collect its children
                    if (block.type === 'row' && block.data.children) {
                        block.data.children.forEach(childId => collectNested(childId));
                    }
                }
            };
            
            // Collect nested blocks for each top-level block
            this.blocks.forEach(block => {
                if (block.type === 'row' && block.data.children) {
                    block.data.children.forEach(childId => collectNested(childId));
                }
            });
        } else {
            // Fallback: recursively collect from blocks array
            const collectNested = (block) => {
                if (block.type === 'row' && block.data.children && block.data.children.length > 0) {
                    block.data.children.forEach(childId => {
                        const childBlock = this.getBlockById(childId);
                        if (childBlock && !allBlocks.find(b => b.id === childId)) {
                            allBlocks.push(childBlock);
                            collectNested(childBlock);
                        }
                    });
                }
            };
            
            this.blocks.forEach(block => collectNested(block));
        }
        
        return allBlocks;
    }

    /**
     * Get block by ID (searches all blocks including nested)
     * @param {string} blockId - Block ID
     * @returns {Object|null} - Block object or null
     */
    getBlockById(blockId) {
        // First check the map if it exists
        if (this.allBlocksMap && this.allBlocksMap[blockId]) {
            return this.allBlocksMap[blockId];
        }
        
        // Fallback: search top-level blocks
        let block = this.blocks.find(b => b.id === blockId);
        if (block) {
            // Update map
            if (!this.allBlocksMap) this.allBlocksMap = {};
            this.allBlocksMap[blockId] = block;
            return block;
        }
        
        // Then check nested blocks recursively
        const findInChildren = (parentBlock) => {
            if (parentBlock.type === 'row' && parentBlock.data.children) {
                for (const childId of parentBlock.data.children) {
                    if (childId === blockId) {
                        // This shouldn't happen as children should be in blocks array
                        // But we'll search recursively just in case
                        const allBlocks = this.getAllBlocksFlat();
                        return allBlocks.find(b => b.id === blockId) || null;
                    }
                    const childBlock = this.blocks.find(b => b.id === childId);
                    if (childBlock) {
                        const found = findInChildren(childBlock);
                        if (found) return found;
                    }
                }
            }
            return null;
        };
        
        for (const topBlock of this.blocks) {
            const found = findInChildren(topBlock);
            if (found) return found;
        }
        
        return null;
    }

    /**
     * Get child blocks for a row component
     * @param {string} rowId - Row block ID
     * @returns {Array} - Array of child blocks
     */
    getChildBlocks(rowId) {
        const rowBlock = this.getBlockById(rowId);
        if (!rowBlock || rowBlock.type !== 'row' || !rowBlock.data.children) {
            return [];
        }
        
        // Get child blocks from the map or by searching
        return rowBlock.data.children
            .map(childId => {
                // First check map
                if (this.allBlocksMap && this.allBlocksMap[childId]) {
                    return this.allBlocksMap[childId];
                }
                // Fallback to getBlockById
                return this.getBlockById(childId);
            })
            .filter(block => block !== null);
    }

    /**
     * Select a block
     * @param {string} blockId - Block ID to select (or null to deselect)
     */
    selectBlock(blockId) {
        if (this.selectedBlockId === blockId) return;
        
        this.selectedBlockId = blockId;
        this.notifyListeners('selectionChanged');
    }

    /**
     * Get currently selected block
     * @returns {Object|null} - Selected block or null
     */
    getSelectedBlock() {
        if (!this.selectedBlockId) return null;
        return this.getBlock(this.selectedBlockId);
    }

    /**
     * Move block to new position
     * @param {string} blockId - Block ID to move
     * @param {number} newIndex - New position index
     * @param {string} parentId - Optional parent ID (for moving within a row)
     */
    moveBlock(blockId, newIndex, parentId = null) {
        this.saveState();
        
        const block = this.getBlockById(blockId);
        if (!block) return;
        
        // If parentId is provided, move within parent's children array
        if (parentId) {
            const parentBlock = this.getBlockById(parentId);
            if (parentBlock && parentBlock.type === 'row' && parentBlock.data.children) {
                const currentIndex = parentBlock.data.children.indexOf(blockId);
                if (currentIndex === -1) return;
                
                // Remove from old position
                parentBlock.data.children.splice(currentIndex, 1);
                
                // Insert at new position
                parentBlock.data.children.splice(newIndex, 0, blockId);
                
                this.notifyListeners('blocksChanged');
                return;
            }
        }
        
        // Move within top-level blocks array
        const currentIndex = this.blocks.findIndex(b => b.id === blockId);
        if (currentIndex === -1) return;
        
        // Remove from old position
        const [blockToMove] = this.blocks.splice(currentIndex, 1);
        
        // Insert at new position
        this.blocks.splice(newIndex, 0, blockToMove);
        
        this.notifyListeners('blocksChanged');
    }

    /**
     * Duplicate a block
     * @param {string} blockId - Block ID to duplicate
     * @returns {string} - ID of duplicated block
     */
    duplicateBlock(blockId) {
        const block = this.getBlockById(blockId);
        if (!block) return null;
        
        this.saveState();
        
        const currentIndex = this.blocks.findIndex(b => b.id === blockId);
        const duplicatedBlock = {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: block.type,
            data: JSON.parse(JSON.stringify(block.data)), // Deep clone
            parentId: block.parentId || null
        };
        
        // If it's a row with children, we need to duplicate children too
        if (block.type === 'row' && block.data.children && block.data.children.length > 0) {
            duplicatedBlock.data.children = [];
            block.data.children.forEach(childId => {
                const childBlock = this.getBlockById(childId);
                if (childBlock) {
                    const duplicatedChildId = this.duplicateBlock(childId);
                    if (duplicatedChildId) {
                        // Update the duplicated child's parentId
                        const duplicatedChild = this.getBlockById(duplicatedChildId);
                        if (duplicatedChild) {
                            duplicatedChild.parentId = duplicatedBlock.id;
                        }
                        duplicatedBlock.data.children.push(duplicatedChildId);
                    }
                }
            });
        }
        
        // Update blocks map
        if (!this.allBlocksMap) this.allBlocksMap = {};
        this.allBlocksMap[duplicatedBlock.id] = duplicatedBlock;
        
        // Insert after current block (only if it's a top-level block)
        if (!block.parentId && currentIndex !== -1) {
            this.blocks.splice(currentIndex + 1, 0, duplicatedBlock);
        } else if (!block.parentId) {
            // If not found in top-level, just add to end
            this.blocks.push(duplicatedBlock);
        }
        // If it's a nested block, it will be added to parent's children array by the recursive call
        
        this.notifyListeners('blocksChanged');
        
        return duplicatedBlock.id;
    }

    /**
     * Clear all blocks
     */
    clearAll() {
        if (this.blocks.length === 0) return;
        
        this.saveState();
        this.blocks = [];
        this.selectedBlockId = null;
        
        this.notifyListeners('blocksChanged');
        this.notifyListeners('selectionChanged');
    }

    /**
     * Save current state for undo/redo
     */
    saveState() {
        const state = JSON.stringify(this.blocks);
        this.undoStack.push(state);
        
        // Limit undo stack size (keep last 50 states)
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when new action is performed
        this.redoStack = [];
        
        this.notifyListeners('undoStateChanged');
    }

    /**
     * Undo last action
     * @returns {boolean} - Success
     */
    undo() {
        if (this.undoStack.length === 0) return false;
        
        // Save current state to redo stack
        this.redoStack.push(JSON.stringify(this.blocks));
        
        // Restore previous state
        const previousState = this.undoStack.pop();
        this.blocks = JSON.parse(previousState);
        
        // Clear selection
        this.selectedBlockId = null;
        
        this.notifyListeners('blocksChanged');
        this.notifyListeners('selectionChanged');
        this.notifyListeners('undoStateChanged');
        
        return true;
    }

    /**
     * Redo last undone action
     * @returns {boolean} - Success
     */
    redo() {
        if (this.redoStack.length === 0) return false;
        
        // Save current state to undo stack
        this.undoStack.push(JSON.stringify(this.blocks));
        
        // Restore next state
        const nextState = this.redoStack.pop();
        this.blocks = JSON.parse(nextState);
        
        this.notifyListeners('blocksChanged');
        this.notifyListeners('undoStateChanged');
        
        return true;
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Export model to JSON
     * @returns {Object} - JSON representation
     */
    toJSON() {
        return {
            blocks: this.getAllBlocksFlat(),
            version: '1.1' // Updated version to support nested blocks
        };
    }

    /**
     * Load model from JSON
     * @param {Object} json - JSON object
     */
    fromJSON(json) {
        this.saveState();
        const allBlocks = json.blocks || [];
        
        // Separate top-level blocks from nested blocks
        this.blocks = allBlocks.filter(block => !block.parentId);
        
        // Store all blocks (including nested) in a map for quick access
        this.allBlocksMap = {};
        allBlocks.forEach(block => {
            this.allBlocksMap[block.id] = block;
        });
        
        this.selectedBlockId = null;
        
        this.notifyListeners('blocksChanged');
        this.notifyListeners('selectionChanged');
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Notify all listeners of an event
     * @param {string} event - Event name
     */
    notifyListeners(event) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

    /**
     * Mark that we're typing (prevents saving state on every keystroke)
     */
    startTyping() {
        this.isTyping = true;
    }

    /**
     * Mark that typing has stopped
     */
    stopTyping() {
        this.isTyping = false;
    }
}

// Export singleton instance
export const emailModel = new EmailModel();

