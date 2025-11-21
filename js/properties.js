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
     * Get common spacing fields (padding and margin)
     */
    getSpacingFields(currentData) {
        return [
            {
                type: 'text',
                key: 'padding',
                label: 'Padding (e.g., 20px or 20px 10px)',
                value: currentData.padding || '20px'
            },
            {
                type: 'text',
                key: 'margin',
                label: 'Margin (e.g., 20px or 20px 10px)',
                value: currentData.margin || '0px'
            }
        ];
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
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        },
                        ...this.getSpacingFields(currentData)
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
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        },
                        ...this.getSpacingFields(currentData)
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
                        },
                        ...this.getSpacingFields(currentData)
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
                            key: 'borderRadius',
                            label: 'Border Radius (px)',
                            value: currentData.borderRadius || '0px'
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        },
                        ...this.getSpacingFields(currentData)
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
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        },
                        ...this.getSpacingFields(currentData)
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
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        },
                        ...this.getSpacingFields(currentData)
                    ]
                });
                break;
                
            case 'twoColumns':
                const column1Type = currentData.column1Type || 'html';
                const column2Type = currentData.column2Type || 'html';
                
                fields.push({
                    label: 'Two Columns',
                    fields: [
                        {
                            type: 'select',
                            key: 'column1Type',
                            label: 'Left Column Type',
                            value: column1Type,
                            options: [
                                { value: 'html', label: 'HTML Content' },
                                { value: 'image', label: 'Image' }
                            ]
                        },
                        // Left column - HTML fields
                        ...(column1Type === 'html' ? [{
                            type: 'textarea',
                            key: 'column1Content',
                            label: 'Left Column HTML Content',
                            value: currentData.column1Content || ''
                        }] : []),
                        // Left column - Image fields
                        ...(column1Type === 'image' ? [
                            {
                                type: 'text',
                                key: 'column1Src',
                                label: 'Left Image URL',
                                value: currentData.column1Src || 'https://via.placeholder.com/300x200'
                            },
                            {
                                type: 'text',
                                key: 'column1Alt',
                                label: 'Left Image Alt Text',
                                value: currentData.column1Alt || 'Left Image'
                            },
                            {
                                type: 'text',
                                key: 'column1MaxWidth',
                                label: 'Left Image Max Width (px)',
                                value: currentData.column1MaxWidth || '300'
                            },
                            {
                                type: 'select',
                                key: 'column1Align',
                                label: 'Left Image Align',
                                value: currentData.column1Align || 'center',
                                options: [
                                    { value: 'left', label: 'Left' },
                                    { value: 'center', label: 'Center' },
                                    { value: 'right', label: 'Right' }
                                ]
                            },
                            {
                                type: 'text',
                                key: 'column1BorderRadius',
                                label: 'Left Image Border Radius (px)',
                                value: currentData.column1BorderRadius || '0px'
                            }
                        ] : []),
                        {
                            type: 'select',
                            key: 'column2Type',
                            label: 'Right Column Type',
                            value: column2Type,
                            options: [
                                { value: 'html', label: 'HTML Content' },
                                { value: 'image', label: 'Image' }
                            ]
                        },
                        // Right column - HTML fields
                        ...(column2Type === 'html' ? [{
                            type: 'textarea',
                            key: 'column2Content',
                            label: 'Right Column HTML Content',
                            value: currentData.column2Content || ''
                        }] : []),
                        // Right column - Image fields
                        ...(column2Type === 'image' ? [
                            {
                                type: 'text',
                                key: 'column2Src',
                                label: 'Right Image URL',
                                value: currentData.column2Src || 'https://via.placeholder.com/300x200'
                            },
                            {
                                type: 'text',
                                key: 'column2Alt',
                                label: 'Right Image Alt Text',
                                value: currentData.column2Alt || 'Right Image'
                            },
                            {
                                type: 'text',
                                key: 'column2MaxWidth',
                                label: 'Right Image Max Width (px)',
                                value: currentData.column2MaxWidth || '300'
                            },
                            {
                                type: 'select',
                                key: 'column2Align',
                                label: 'Right Image Align',
                                value: currentData.column2Align || 'center',
                                options: [
                                    { value: 'left', label: 'Left' },
                                    { value: 'center', label: 'Center' },
                                    { value: 'right', label: 'Right' }
                                ]
                            },
                            {
                                type: 'text',
                                key: 'column2BorderRadius',
                                label: 'Right Image Border Radius (px)',
                                value: currentData.column2BorderRadius || '0px'
                            }
                        ] : []),
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
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#ffffff'
                        },
                        ...this.getSpacingFields(currentData)
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
                        },
                        {
                            type: 'color',
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: currentData.backgroundColor || '#f8fafc'
                        },
                        ...this.getSpacingFields(currentData)
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
                // Create wrapper for color picker + hex input
                container.className = 'property-field color-field';
                const colorWrapper = document.createElement('div');
                colorWrapper.style.display = 'flex';
                colorWrapper.style.gap = '8px';
                colorWrapper.style.alignItems = 'center';
                
                // Color picker input
                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = fieldDef.value || '#000000';
                colorInput.style.width = '60px';
                colorInput.style.height = '40px';
                colorInput.style.flexShrink = '0';
                // Allow dragging in color picker - only update after drag ends
                // Stop drag events from bubbling to component drag handlers
                colorInput.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
                colorInput.addEventListener('dragstart', (e) => {
                    e.stopPropagation();
                });
                
                // Hex text input
                const hexInput = document.createElement('input');
                hexInput.type = 'text';
                hexInput.value = fieldDef.value || '#000000';
                hexInput.placeholder = '#000000';
                hexInput.style.flex = '1';
                hexInput.style.fontFamily = 'monospace';
                hexInput.style.pattern = '#[0-9A-Fa-f]{6}';
                
                // Validate and update hex input
                const validateHex = (value) => {
                    if (!value) return false;
                    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
                    // Allow 3-digit hex - convert to 6-digit
                    if (value.length === 4 && value[0] === '#' && /^#[0-9A-Fa-f]{3}$/i.test(value)) {
                        return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
                    }
                    return hexRegex.test(value) ? value : false;
                };
                
                // Update model handler
                const updateModel = () => {
                    if (this.currentBlockId) {
                        this.handleFieldChange(fieldDef.key, colorInput);
                    }
                };
                
                // Update color picker when hex input changes
                let hexTimeout = null;
                hexInput.addEventListener('input', (e) => {
                    clearTimeout(hexTimeout);
                    let value = e.target.value;
                    if (value && !value.startsWith('#')) {
                        value = '#' + value;
                        e.target.value = value;
                    }
                    
                    // Validate hex value
                    const validHex = validateHex(value);
                    if (validHex) {
                        const fullHex = typeof validHex === 'string' ? validHex : value;
                        colorInput.value = fullHex;
                        hexInput.value = fullHex;
                        hexInput.style.borderColor = '';
                        // Update model after typing stops
                        hexTimeout = setTimeout(updateModel, 300);
                    } else {
                        hexInput.style.borderColor = '#ef4444'; // Red border for invalid
                    }
                });
                
                // Update hex input when color picker changes
                colorInput.addEventListener('change', () => {
                    hexInput.value = colorInput.value;
                    hexInput.style.borderColor = '';
                    updateModel();
                });
                
                // Handle blur - validate and set if valid, or revert
                hexInput.addEventListener('blur', () => {
                    clearTimeout(hexTimeout);
                    const validHex = validateHex(hexInput.value);
                    if (validHex) {
                        const fullHex = typeof validHex === 'string' ? validHex : hexInput.value;
                        colorInput.value = fullHex;
                        hexInput.value = fullHex;
                        hexInput.style.borderColor = '';
                        updateModel();
                    } else if (hexInput.value) {
                        // Revert to current color picker value
                        hexInput.value = colorInput.value;
                        hexInput.style.borderColor = '';
                    }
                });
                
                // Stop drag events from bubbling
                hexInput.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
                hexInput.draggable = false;
                
                colorWrapper.appendChild(colorInput);
                colorWrapper.appendChild(hexInput);
                container.appendChild(colorWrapper);
                // Set input to null so it doesn't get appended again below
                input = null;
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
            // Color inputs are handled separately in the case statement
            // For text inputs and textarea, update on blur and auto-save after 2 minutes of inactivity
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                let typingTimeout = null;
                
                // Update on blur (when clicking outside)
                input.addEventListener('blur', () => {
                    clearTimeout(typingTimeout);
                    this.handleFieldChange(fieldDef.key, input);
                });
                
                // Auto-save after 2 minutes (120000ms) of no typing
                input.addEventListener('input', () => {
                    clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => {
                        this.handleFieldChange(fieldDef.key, input);
                    }, 120000); // 2 minutes
                });
            } else {
                // For other inputs (select, checkbox, number, range), bind change events
                input.addEventListener('change', () => {
                    this.handleFieldChange(fieldDef.key, input);
                    
                    // If column type changed, refresh the panel to show/hide relevant fields
                    if (fieldDef.key === 'column1Type' || fieldDef.key === 'column2Type') {
                        setTimeout(() => {
                            this.updatePanel();
                        }, 50);
                    }
                });
            }
            
            // Stop drag events from bubbling to component drag handlers
            input.draggable = false;
            input.addEventListener('mousedown', (e) => {
                e.stopPropagation();
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
        
        // Update model immediately (blur and auto-save after 2 minutes are handled in event listeners)
        emailModel.updateBlock(this.currentBlockId, { [key]: value });
    }
}

// Export singleton instance
export const propertiesManager = new PropertiesManager();

