/**
 * ========================================
 * Properties Panel
 * ========================================
 * 
 * This module handles the right sidebar properties panel.
 * It dynamically generates form fields based on the selected block type.
 * 
 * Key concepts:
 * - Two-way binding: Form changes update model, model changes update form
 * - Live preview: Changes reflect immediately on canvas
 * - Contextual fields: Different fields for different block types
 */

import { emailModel } from './model.js';
import { getComponent } from './components.js';

class PropertiesManager {
    constructor() {
        this.panel = null;
        this.subtitle = null;
        this.currentBlockId = null;
        this.inputTimeout = null;
    }

    /**
     * Initialize properties panel
     */
    init(panelElement, subtitleElement) {
        this.panel = panelElement;
        this.subtitle = subtitleElement;
        
        // Listen for selection changes
        emailModel.on('selectionChanged', () => this.updatePanel());
        emailModel.on('blocksChanged', () => {
            // Update panel if selected block still exists
            const selected = emailModel.getSelectedBlock();
            if (selected) {
                this.updatePanel();
            } else {
                this.showEmptyState();
            }
        });
    }

    /**
     * Update the properties panel
     */
    updatePanel() {
        const selectedBlock = emailModel.getSelectedBlock();
        
        if (!selectedBlock) {
            this.showEmptyState();
            return;
        }
        
        this.currentBlockId = selectedBlock.id;
        const component = getComponent(selectedBlock.type);
        
        if (!component) {
            this.showEmptyState();
            return;
        }
        
        // Update subtitle
        this.subtitle.textContent = `Editing: ${component.label}`;
        
        // Render properties form
        this.renderPropertiesForm(selectedBlock, component);
    }

    /**
     * Show empty state (no block selected)
     */
    showEmptyState() {
        this.currentBlockId = null;
        this.subtitle.textContent = 'Select a block to edit';
        this.panel.innerHTML = `
            <div class="properties-empty">
                <p>No block selected</p>
                <p class="hint">Click on a block in the canvas to edit its properties</p>
            </div>
        `;
    }

    /**
     * Render properties form for a block
     */
    renderPropertiesForm(block, component) {
        const form = document.createElement('div');
        form.className = 'properties-form';
        
        // Generate fields based on block type
        const fields = this.getFieldsForType(block.type, block.data);
        
        fields.forEach(fieldGroup => {
            const group = this.createFieldGroup(fieldGroup.label, fieldGroup.fields);
            form.appendChild(group);
        });
        
        this.panel.innerHTML = '';
        this.panel.appendChild(form);
    }

    /**
     * Get field definitions for a block type
     */
    getFieldsForType(type, currentData) {
        const fields = [];
        
        switch (type) {
            case 'text':
                fields.push({
                    label: 'Content',
                    fields: [
                        {
                            type: 'textarea',
                            key: 'content',
                            label: 'Text Content',
                            value: currentData.content || '',
                            placeholder: 'Enter HTML or plain text...'
                        },
                        {
                            type: 'text',
                            key: 'fontSize',
                            label: 'Font Size (px)',
                            value: currentData.fontSize || 16
                        },
                        {
                            type: 'select',
                            key: 'fontFamily',
                            label: 'Font Family',
                            value: currentData.fontFamily || 'Arial, sans-serif',
                            options: [
                                'Arial, sans-serif',
                                'Helvetica, sans-serif',
                                'Georgia, serif',
                                'Times New Roman, serif',
                                'Courier New, monospace'
                            ]
                        },
                        {
                            type: 'color',
                            key: 'color',
                            label: 'Text Color',
                            value: currentData.color || '#000000'
                        },
                        {
                            type: 'select',
                            key: 'textAlign',
                            label: 'Text Align',
                            value: currentData.textAlign || 'left',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        },
                        {
                            type: 'range',
                            key: 'lineHeight',
                            label: 'Line Height',
                            value: currentData.lineHeight || 1.6,
                            min: 1,
                            max: 3,
                            step: 0.1
                        },
                        {
                            type: 'text',
                            key: 'padding',
                            label: 'Padding (e.g., 20px or 20px 10px)',
                            value: currentData.padding || '20px'
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        }
                    ]
                });
                break;
                
            case 'heading':
                fields.push({
                    label: 'Heading',
                    fields: [
                        {
                            type: 'text',
                            key: 'text',
                            label: 'Heading Text',
                            value: currentData.text || ''
                        },
                        {
                            type: 'select',
                            key: 'level',
                            label: 'Heading Level',
                            value: currentData.level || 'h1',
                            options: [
                                { value: 'h1', label: 'H1' },
                                { value: 'h2', label: 'H2' },
                                { value: 'h3', label: 'H3' }
                            ]
                        },
                        {
                            type: 'text',
                            key: 'fontSize',
                            label: 'Font Size (px)',
                            value: currentData.fontSize || 32
                        },
                        {
                            type: 'color',
                            key: 'color',
                            label: 'Text Color',
                            value: currentData.color || '#000000'
                        },
                        {
                            type: 'select',
                            key: 'textAlign',
                            label: 'Text Align',
                            value: currentData.textAlign || 'left',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        }
                    ]
                });
                break;
                
            case 'button':
                fields.push({
                    label: 'Button',
                    fields: [
                        {
                            type: 'text',
                            key: 'text',
                            label: 'Button Text',
                            value: currentData.text || ''
                        },
                        {
                            type: 'text',
                            key: 'url',
                            label: 'Button URL',
                            value: currentData.url || '#'
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#2563eb'
                        },
                        {
                            type: 'color',
                            key: 'textColor',
                            label: 'Text Color',
                            value: currentData.textColor || '#ffffff'
                        },
                        {
                            type: 'text',
                            key: 'fontSize',
                            label: 'Font Size (px)',
                            value: currentData.fontSize || 16
                        },
                        {
                            type: 'text',
                            key: 'padding',
                            label: 'Padding (e.g., 12px 24px)',
                            value: currentData.padding || '12px 24px'
                        },
                        {
                            type: 'text',
                            key: 'borderRadius',
                            label: 'Border Radius (px)',
                            value: currentData.borderRadius || '4px'
                        },
                        {
                            type: 'select',
                            key: 'align',
                            label: 'Alignment',
                            value: currentData.align || 'left',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        },
                        {
                            type: 'checkbox',
                            key: 'fullWidth',
                            label: 'Full Width',
                            value: currentData.fullWidth || false
                        }
                    ]
                });
                break;
                
            case 'image':
                fields.push({
                    label: 'Image',
                    fields: [
                        {
                            type: 'text',
                            key: 'src',
                            label: 'Image URL',
                            value: currentData.src || ''
                        },
                        {
                            type: 'text',
                            key: 'alt',
                            label: 'Alt Text',
                            value: currentData.alt || ''
                        },
                        {
                            type: 'text',
                            key: 'maxWidth',
                            label: 'Max Width (px)',
                            value: currentData.maxWidth || '600'
                        },
                        {
                            type: 'select',
                            key: 'align',
                            label: 'Alignment',
                            value: currentData.align || 'center',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        },
                        {
                            type: 'text',
                            key: 'padding',
                            label: 'Padding',
                            value: currentData.padding || '20px'
                        },
                        {
                            type: 'text',
                            key: 'borderRadius',
                            label: 'Border Radius (px)',
                            value: currentData.borderRadius || '0px'
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        }
                    ]
                });
                break;
                
            case 'divider':
                fields.push({
                    label: 'Divider',
                    fields: [
                        {
                            type: 'color',
                            key: 'color',
                            label: 'Line Color',
                            value: currentData.color || '#e2e8f0'
                        },
                        {
                            type: 'text',
                            key: 'height',
                            label: 'Line Height (px)',
                            value: currentData.height || '1px'
                        },
                        {
                            type: 'text',
                            key: 'padding',
                            label: 'Padding',
                            value: currentData.padding || '20px'
                        }
                    ]
                });
                break;
                
            case 'spacer':
                fields.push({
                    label: 'Spacer',
                    fields: [
                        {
                            type: 'text',
                            key: 'height',
                            label: 'Height (px)',
                            value: currentData.height || '40px'
                        }
                    ]
                });
                break;
                
            case 'twoColumns':
                fields.push({
                    label: 'Two Columns',
                    fields: [
                        {
                            type: 'textarea',
                            key: 'column1Content',
                            label: 'Left Column Content',
                            value: currentData.column1Content || ''
                        },
                        {
                            type: 'textarea',
                            key: 'column2Content',
                            label: 'Right Column Content',
                            value: currentData.column2Content || ''
                        },
                        {
                            type: 'text',
                            key: 'column1Width',
                            label: 'Left Column Width (%)',
                            value: currentData.column1Width || '50%'
                        },
                        {
                            type: 'text',
                            key: 'column2Width',
                            label: 'Right Column Width (%)',
                            value: currentData.column2Width || '50%'
                        },
                        {
                            type: 'text',
                            key: 'gap',
                            label: 'Gap Between Columns',
                            value: currentData.gap || '20px'
                        }
                    ]
                });
                break;
                
            case 'footer':
                fields.push({
                    label: 'Footer',
                    fields: [
                        {
                            type: 'textarea',
                            key: 'text',
                            label: 'Footer Text',
                            value: currentData.text || ''
                        },
                        {
                            type: 'text',
                            key: 'fontSize',
                            label: 'Font Size (px)',
                            value: currentData.fontSize || 12
                        },
                        {
                            type: 'color',
                            key: 'color',
                            label: 'Text Color',
                            value: currentData.color || '#64748b'
                        },
                        {
                            type: 'select',
                            key: 'textAlign',
                            label: 'Text Align',
                            value: currentData.textAlign || 'center',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        }
                    ]
                });
                break;
        }
        
        return fields;
    }

    /**
     * Create a field group
     */
    createFieldGroup(label, fields) {
        const group = document.createElement('div');
        group.className = 'property-group';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'property-group-label';
        labelEl.textContent = label;
        group.appendChild(labelEl);
        
        fields.forEach(field => {
            const fieldEl = this.createField(field);
            group.appendChild(fieldEl);
        });
        
        return group;
    }

    /**
     * Create a single form field
     */
    createField(fieldDef) {
        const container = document.createElement('div');
        container.className = 'property-field';
        
        const label = document.createElement('label');
        label.textContent = fieldDef.label;
        container.appendChild(label);
        
        let input;
        
        switch (fieldDef.type) {
            case 'text':
                input = document.createElement('input');
                input.type = 'text';
                input.value = fieldDef.value || '';
                if (fieldDef.placeholder) input.placeholder = fieldDef.placeholder;
                break;
                
            case 'textarea':
                input = document.createElement('textarea');
                input.value = fieldDef.value || '';
                if (fieldDef.placeholder) input.placeholder = fieldDef.placeholder;
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.value = fieldDef.value || 0;
                if (fieldDef.min !== undefined) input.min = fieldDef.min;
                if (fieldDef.max !== undefined) input.max = fieldDef.max;
                if (fieldDef.step !== undefined) input.step = fieldDef.step;
                break;
                
            case 'range':
                input = document.createElement('input');
                input.type = 'range';
                input.value = fieldDef.value || 0;
                input.min = fieldDef.min || 0;
                input.max = fieldDef.max || 100;
                input.step = fieldDef.step || 1;
                
                // Show value
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'range-value';
                valueDisplay.textContent = fieldDef.value || 0;
                input.addEventListener('input', () => {
                    valueDisplay.textContent = input.value;
                });
                container.appendChild(valueDisplay);
                break;
                
            case 'color':
                input = document.createElement('input');
                input.type = 'color';
                input.value = fieldDef.value || '#000000';
                break;
                
            case 'select':
                input = document.createElement('select');
                const options = fieldDef.options || [];
                options.forEach(opt => {
                    const option = document.createElement('option');
                    if (typeof opt === 'string') {
                        option.value = opt;
                        option.textContent = opt;
                    } else {
                        option.value = opt.value;
                        option.textContent = opt.label || opt.value;
                    }
                    if (option.value === fieldDef.value) {
                        option.selected = true;
                    }
                    input.appendChild(option);
                });
                break;
                
            case 'checkbox':
                container.className = 'property-field checkbox-field';
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = fieldDef.value || false;
                container.insertBefore(input, label);
                break;
        }
        
        if (input) {
            // Bind input to model updates
            input.addEventListener('input', () => {
                this.handleFieldChange(fieldDef.key, input);
            });
            
            input.addEventListener('change', () => {
                this.handleFieldChange(fieldDef.key, input);
            });
            
            container.appendChild(input);
        }
        
        return container;
    }

    /**
     * Handle field value change
     */
    handleFieldChange(key, input) {
        if (!this.currentBlockId) return;
        
        // Get value based on input type
        let value;
        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (input.type === 'number' || input.type === 'range') {
            value = parseFloat(input.value) || 0;
        } else {
            value = input.value;
        }
        
        // Update model (with debounce for text inputs)
        if (input.type === 'text' || input.type === 'textarea') {
            clearTimeout(this.inputTimeout);
            emailModel.startTyping();
            
            this.inputTimeout = setTimeout(() => {
                emailModel.updateBlock(this.currentBlockId, { [key]: value });
                emailModel.stopTyping();
                emailModel.saveState(); // Save after typing stops
            }, 300);
        } else {
            // Immediate update for other inputs
            emailModel.updateBlock(this.currentBlockId, { [key]: value });
        }
    }
}

// Export singleton instance
export const propertiesManager = new PropertiesManager();

