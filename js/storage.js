/**
 * ========================================
 * LocalStorage Management
 * ========================================
 * 
 * This module handles saving/loading templates from localStorage.
 * 
 * Features:
 * - Save templates with metadata (name, date, thumbnail)
 * - Load templates
 * - List all saved templates
 * - Delete templates
 * - Generate thumbnails using html2canvas
 */

import { emailModel } from './model.js';
import { emailExporter } from './exporter.js';

const STORAGE_KEY = 'emailTemplates';
const SAVED_BLOCKS_KEY = 'emailSavedBlocks';

class StorageManager {
    /**
     * Get all saved templates
     * @returns {Array} - Array of template objects
     */
    getAllTemplates() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error loading templates:', error);
            return [];
        }
    }

    /**
     * Save current template
     * @param {string} name - Template name
     * @param {Function} onThumbnailGenerated - Callback when thumbnail is ready
     * @returns {string} - Template ID
     */
    async saveTemplate(name, onThumbnailGenerated = null) {
        const templates = this.getAllTemplates();
        
        // Create template object
        const template = {
            id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name || `Template ${templates.length + 1}`,
            date: new Date().toISOString(),
            data: emailModel.toJSON(),
            thumbnail: null // Will be generated asynchronously
        };
        
        // Add to list
        templates.push(template);
        
        // Save to localStorage
        this.saveAllTemplates(templates);
        
        // Generate thumbnail asynchronously
        if (typeof html2canvas !== 'undefined' && onThumbnailGenerated) {
            this.generateThumbnail(template.id).then(thumbnail => {
                // Update template with thumbnail
                const allTemplates = this.getAllTemplates();
                const index = allTemplates.findIndex(t => t.id === template.id);
                if (index !== -1) {
                    allTemplates[index].thumbnail = thumbnail;
                    this.saveAllTemplates(allTemplates);
                    
                    if (onThumbnailGenerated) {
                        onThumbnailGenerated(template.id, thumbnail);
                    }
                }
            }).catch(error => {
                console.error('Error generating thumbnail:', error);
            });
        }
        
        return template.id;
    }

    /**
     * Load a template by ID
     * @param {string} templateId - Template ID
     * @returns {boolean} - Success
     */
    loadTemplate(templateId) {
        const templates = this.getAllTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
            console.error('Template not found:', templateId);
            return false;
        }
        
        // Load template data into model
        emailModel.fromJSON(template.data);
        
        return true;
    }

    /**
     * Delete a template
     * @param {string} templateId - Template ID
     * @returns {boolean} - Success
     */
    deleteTemplate(templateId) {
        const templates = this.getAllTemplates();
        const filtered = templates.filter(t => t.id !== templateId);
        
        if (filtered.length === templates.length) {
            return false; // Template not found
        }
        
        this.saveAllTemplates(filtered);
        return true;
    }

    /**
     * Rename a template
     * @param {string} templateId - Template ID
     * @param {string} newName - New name
     * @returns {boolean} - Success
     */
    renameTemplate(templateId, newName) {
        const templates = this.getAllTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) return false;
        
        template.name = newName;
        this.saveAllTemplates(templates);
        
        return true;
    }

    /**
     * Duplicate a template
     * @param {string} templateId - Template ID to duplicate
     * @returns {string} - New template ID
     */
    duplicateTemplate(templateId) {
        const templates = this.getAllTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) return null;
        
        const newTemplate = {
            id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${template.name} (Copy)`,
            date: new Date().toISOString(),
            data: JSON.parse(JSON.stringify(template.data)), // Deep clone
            thumbnail: template.thumbnail // Copy thumbnail if available
        };
        
        templates.push(newTemplate);
        this.saveAllTemplates(templates);
        
        return newTemplate.id;
    }

    /**
     * Save all templates to localStorage
     */
    saveAllTemplates(templates) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        } catch (error) {
            console.error('Error saving templates:', error);
            alert('Error saving templates. Storage may be full.');
        }
    }

    /**
     * Generate thumbnail for template
     * @param {string} templateId - Template ID
     * @returns {Promise<string>} - Data URL of thumbnail
     */
    async generateThumbnail(templateId) {
        return new Promise((resolve, reject) => {
            // Load template temporarily to render
            const templates = this.getAllTemplates();
            const template = templates.find(t => t.id === templateId);
            
            if (!template) {
                reject(new Error('Template not found'));
                return;
            }
            
            // Save current state
            const currentState = emailModel.toJSON();
            
            // Load template temporarily
            emailModel.fromJSON(template.data);
            
            // Wait for canvas to render
            setTimeout(() => {
                const canvas = document.getElementById('canvas');
                if (!canvas) {
                    emailModel.fromJSON(currentState);
                    reject(new Error('Canvas not found'));
                    return;
                }
                
                // Use html2canvas to generate thumbnail
                html2canvas(canvas, {
                    backgroundColor: '#ffffff',
                    scale: 0.5,
                    logging: false,
                    useCORS: true
                }).then(canvas => {
                    const dataURL = canvas.toDataURL('image/png');
                    
                    // Restore previous state
                    emailModel.fromJSON(currentState);
                    
                    resolve(dataURL);
                }).catch(error => {
                    // Restore previous state
                    emailModel.fromJSON(currentState);
                    reject(error);
                });
            }, 500);
        });
    }

    /**
     * Clear all templates (for development/testing)
     */
    clearAll() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Get all saved blocks
     * @returns {Array} - Array of saved block objects
     */
    getAllSavedBlocks() {
        try {
            const stored = localStorage.getItem('emailSavedBlocks');
            if (!stored) return [];
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error loading saved blocks:', error);
            return [];
        }
    }

    /**
     * Save a block to library
     * @param {Object} block - Block object with type and data
     * @param {string} name - Block name
     * @returns {string} - Saved block ID
     */
    async saveBlock(block, name) {
        const savedBlocks = this.getAllSavedBlocks();
        
        const savedBlock = {
            id: `saved-block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name || `${block.type} Block`,
            type: block.type,
            data: JSON.parse(JSON.stringify(block.data)), // Deep clone
            date: new Date().toISOString(),
            thumbnail: null
        };

        // Generate thumbnail using html2canvas
        try {
            const canvas = document.getElementById('canvas');
            if (canvas && typeof html2canvas !== 'undefined') {
                // Find the block element in canvas
                const blockElement = canvas.querySelector(`[data-block-id="${block.id}"]`);
                if (blockElement) {
                    const thumbnail = await html2canvas(blockElement, {
                        backgroundColor: '#ffffff',
                        scale: 0.3,
                        logging: false,
                        useCORS: true
                    });
                    savedBlock.thumbnail = thumbnail.toDataURL('image/png');
                }
            }
        } catch (error) {
            console.error('Error generating thumbnail:', error);
        }

        savedBlocks.push(savedBlock);
        this.saveAllBlocks(savedBlocks);
        
        return savedBlock.id;
    }

    /**
     * Delete a saved block
     * @param {string} blockId - Saved block ID
     * @returns {boolean} - Success
     */
    deleteSavedBlock(blockId) {
        const savedBlocks = this.getAllSavedBlocks();
        const filtered = savedBlocks.filter(b => b.id !== blockId);
        
        if (filtered.length === savedBlocks.length) {
            return false; // Block not found
        }
        
        this.saveAllBlocks(filtered);
        return true;
    }

    /**
     * Save all blocks to localStorage
     * @param {Array} blocks - Array of saved blocks
     */
    saveAllBlocks(blocks) {
        try {
            localStorage.setItem('emailSavedBlocks', JSON.stringify(blocks));
        } catch (error) {
            console.error('Error saving blocks:', error);
            alert('Error saving blocks. Storage may be full.');
        }
    }

    /**
     * Get a saved block by ID
     * @param {string} blockId - Saved block ID
     * @returns {Object|null} - Saved block or null
     */
    getSavedBlock(blockId) {
        const savedBlocks = this.getAllSavedBlocks();
        return savedBlocks.find(b => b.id === blockId) || null;
    }
}

// Export singleton instance
export const storageManager = new StorageManager();

