/**
 * ========================================
 * Component Library
 * ========================================
 * 
 * This module defines all available email components.
 * Each component includes:
 * - type: unique identifier
 * - label: display name
 * - icon: emoji or symbol
 * - description: help text
 * - defaultData: default properties
 * - htmlTemplate: function to generate email-safe HTML
 * 
 * IMPORTANT: Email HTML must use:
 * - Tables for layout (not divs)
 * - Inline styles (no external CSS)
 * - Limited CSS support (no flexbox, grid, etc.)
 * - Web-safe fonts
 */

/**
 * Component Definitions
 * Each component has a template function that generates email-safe HTML
 */
export const componentDefinitions = {
    text: {
        type: 'text',
        label: 'Text Block',
        icon: '📝',
        description: 'Rich text content',
        defaultData: {
            content: '<p>Enter your text here...</p>',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            lineHeight: 1.6,
            textAlign: 'left',
            padding: '20px',
            backgroundColor: '#ffffff'
        },
        htmlTemplate: (data) => `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backgroundColor || '#ffffff'};">
                <tr>
                    <td align="${data.textAlign || 'left'}" style="padding: ${data.padding || '20px'}; font-family: ${data.fontFamily || 'Arial, sans-serif'}; font-size: ${data.fontSize || 16}px; color: ${data.color || '#000000'}; line-height: ${data.lineHeight || 1.6};">
                        ${data.content || '<p>Enter your text here...</p>'}
                    </td>
                </tr>
            </table>
        `
    },

    heading: {
        type: 'heading',
        label: 'Heading',
        icon: '📰',
        description: 'Large heading text',
        defaultData: {
            text: 'Your Heading Here',
            level: 'h1',
            fontSize: 32,
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            textAlign: 'left',
            padding: '20px',
            backgroundColor: '#ffffff'
        },
        htmlTemplate: (data) => {
            const tag = data.level || 'h1';
            const fontSize = data.fontSize || 32;
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backgroundColor || '#ffffff'};">
                    <tr>
                        <td align="${data.textAlign || 'left'}" style="padding: ${data.padding || '20px'};">
                            <${tag} style="margin: 0; font-family: ${data.fontFamily || 'Arial, sans-serif'}; font-size: ${fontSize}px; color: ${data.color || '#000000'}; font-weight: bold; line-height: 1.2;">
                                ${data.text || 'Your Heading Here'}
                            </${tag}>
                        </td>
                    </tr>
                </table>
            `;
        }
    },

    button: {
        type: 'button',
        label: 'Button',
        icon: '🔘',
        description: 'Call-to-action button',
        defaultData: {
            text: 'Click Here',
            url: '#',
            backgroundColor: '#2563eb',
            textColor: '#ffffff',
            fontSize: 16,
            padding: '12px 24px',
            borderRadius: '4px',
            fullWidth: false,
            align: 'left'
        },
        htmlTemplate: (data) => {
            const width = data.fullWidth ? '100%' : 'auto';
            const display = data.fullWidth ? 'block' : 'inline-block';
            
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="${data.align || 'left'}" style="padding: 20px;">
                            <a href="${data.url || '#'}" 
                               style="display: ${display}; width: ${width}; background-color: ${data.backgroundColor || '#2563eb'}; color: ${data.textColor || '#ffffff'}; text-decoration: none; padding: ${data.padding || '12px 24px'}; border-radius: ${data.borderRadius || '4px'}; font-size: ${data.fontSize || 16}px; font-family: Arial, sans-serif; text-align: center;">
                                ${data.text || 'Click Here'}
                            </a>
                        </td>
                    </tr>
                </table>
            `;
        }
    },

    image: {
        type: 'image',
        label: 'Image',
        icon: '🖼️',
        description: 'Single image',
        defaultData: {
            src: 'https://via.placeholder.com/600x300',
            alt: 'Image',
            width: '100%',
            maxWidth: '600px',
            align: 'center',
            padding: '20px',
            borderRadius: '0px',
            backgroundColor: '#ffffff'
        },
        htmlTemplate: (data) => {
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backgroundColor || '#ffffff'};">
                    <tr>
                        <td align="${data.align || 'center'}" style="padding: ${data.padding || '20px'};">
                            <img src="${data.src || 'https://via.placeholder.com/600x300'}" 
                                 alt="${data.alt || 'Image'}" 
                                 width="${data.maxWidth || '600'}" 
                                 style="max-width: 100%; height: auto; border-radius: ${data.borderRadius || '0px'}; display: block;" />
                        </td>
                    </tr>
                </table>
            `;
        }
    },

    divider: {
        type: 'divider',
        label: 'Divider',
        icon: '➖',
        description: 'Horizontal line separator',
        defaultData: {
            color: '#e2e8f0',
            height: '1px',
            padding: '20px',
            backgroundColor: '#ffffff'
        },
        htmlTemplate: (data) => {
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backgroundColor || '#ffffff'};">
                    <tr>
                        <td align="center" style="padding: ${data.padding || '20px'};">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="border-top: ${data.height || '1px'} solid ${data.color || '#e2e8f0'};"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `;
        }
    },

    spacer: {
        type: 'spacer',
        label: 'Spacer',
        icon: '⬜',
        description: 'Vertical spacing',
        defaultData: {
            height: '40px',
            backgroundColor: '#ffffff'
        },
        htmlTemplate: (data) => {
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backgroundColor || '#ffffff'};">
                    <tr>
                        <td style="height: ${data.height || '40px'}; line-height: ${data.height || '40px'}; font-size: 1px;">&nbsp;</td>
                    </tr>
                </table>
            `;
        }
    },

    twoColumns: {
        type: 'twoColumns',
        label: 'Two Columns',
        icon: '📊',
        description: 'Side-by-side content',
        defaultData: {
            column1Content: '<p>Left column content</p>',
            column2Content: '<p>Right column content</p>',
            column1Width: '50%',
            column2Width: '50%',
            padding: '20px',
            backgroundColor: '#ffffff',
            gap: '20px'
        },
        htmlTemplate: (data) => {
            const gap = data.gap || '20px';
            const col1Width = data.column1Width || '50%';
            const col2Width = data.column2Width || '50%';
            
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backgroundColor || '#ffffff'};">
                    <tr>
                        <td style="padding: ${data.padding || '20px'};">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td width="${col1Width}" valign="top" style="padding-right: ${gap};">
                                        ${data.column1Content || '<p>Left column content</p>'}
                                    </td>
                                    <td width="${col2Width}" valign="top" style="padding-left: ${gap};">
                                        ${data.column2Content || '<p>Right column content</p>'}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `;
        }
    },

    footer: {
        type: 'footer',
        label: 'Footer',
        icon: '🔻',
        description: 'Email footer with links',
        defaultData: {
            text: '© 2024 Your Company. All rights reserved.',
            links: [
                { text: 'Privacy Policy', url: '#' },
                { text: 'Unsubscribe', url: '#' }
            ],
            fontSize: 12,
            color: '#64748b',
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8fafc'
        },
        htmlTemplate: (data) => {
            let linksHtml = '';
            if (data.links && data.links.length > 0) {
                linksHtml = data.links.map(link => 
                    `<a href="${link.url || '#'}" style="color: ${data.color || '#64748b'}; text-decoration: underline; margin: 0 8px;">${link.text}</a>`
                ).join(' | ');
            }
            
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backgroundColor || '#f8fafc'};">
                    <tr>
                        <td align="${data.textAlign || 'center'}" style="padding: ${data.padding || '40px 20px'}; font-family: Arial, sans-serif; font-size: ${data.fontSize || 12}px; color: ${data.color || '#64748b'}; line-height: 1.6;">
                            ${data.text || '© 2024 Your Company. All rights reserved.'}
                            ${linksHtml ? '<br><br>' + linksHtml : ''}
                        </td>
                    </tr>
                </table>
            `;
        }
    }
};

/**
 * Get component definition by type
 * @param {string} type - Component type
 * @returns {Object|null} - Component definition
 */
export function getComponent(type) {
    return componentDefinitions[type] || null;
}

/**
 * Get all component definitions
 * @returns {Array} - Array of component definitions
 */
export function getAllComponents() {
    return Object.values(componentDefinitions);
}

/**
 * Generate HTML for a block
 * @param {Object} block - Block object with type and data
 * @returns {string} - HTML string
 */
export function renderBlockHTML(block) {
    const component = getComponent(block.type);
    if (!component) return '';
    
    return component.htmlTemplate(block.data);
}

