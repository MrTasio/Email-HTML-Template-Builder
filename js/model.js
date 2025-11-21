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
        // Current template blocks
        this.blocks = [];
        
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
     * @returns {string} - The ID of the created block
     */
    addBlock(block) {
        // Generate unique ID
        const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newBlock = {
            id,
            type: block.type,
            data: { ...block.data }
        };
        
        // Save state for undo
        this.saveState();
        
        // Add to blocks array
        this.blocks.push(newBlock);
        
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
            data: { ...block.data }
        };
        
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
        
        this.blocks = this.blocks.filter(block => block.id !== blockId);
        
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
        const block = this.blocks.find(b => b.id === blockId);
        if (!block) return;
        
        // Only save state if this is a significant change (not during typing)
        const shouldSaveState = !this.isTyping;
        if (shouldSaveState) {
            this.saveState();
        }
        
        // Merge updates
        block.data = { ...block.data, ...updates };
        
        this.notifyListeners('blocksChanged');
    }

    /**
     * Get a block by ID
     * @param {string} blockId - Block ID
     * @returns {Object|null} - Block object or null
     */
    getBlock(blockId) {
        return this.blocks.find(b => b.id === blockId) || null;
    }

    /**
     * Get all blocks
     * @returns {Array} - Array of blocks
     */
    getAllBlocks() {
        return [...this.blocks];
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
     */
    moveBlock(blockId, newIndex) {
        this.saveState();
        
        const currentIndex = this.blocks.findIndex(b => b.id === blockId);
        if (currentIndex === -1) return;
        
        // Remove from old position
        const [block] = this.blocks.splice(currentIndex, 1);
        
        // Insert at new position
        this.blocks.splice(newIndex, 0, block);
        
        this.notifyListeners('blocksChanged');
    }

    /**
     * Duplicate a block
     * @param {string} blockId - Block ID to duplicate
     * @returns {string} - ID of duplicated block
     */
    duplicateBlock(blockId) {
        const block = this.getBlock(blockId);
        if (!block) return null;
        
        this.saveState();
        
        const currentIndex = this.blocks.findIndex(b => b.id === blockId);
        const duplicatedBlock = {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: block.type,
            data: JSON.parse(JSON.stringify(block.data)) // Deep clone
        };
        
        // Insert after current block
        this.blocks.splice(currentIndex + 1, 0, duplicatedBlock);
        
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
            blocks: this.blocks,
            version: '1.0'
        };
    }

    /**
     * Load model from JSON
     * @param {Object} json - JSON object
     */
    fromJSON(json) {
        this.saveState();
        this.blocks = json.blocks || [];
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

