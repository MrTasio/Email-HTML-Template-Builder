/**
 * ========================================
 * Email HTML Exporter
 * ========================================
 * 
 * This module converts the JSON model into production-ready email HTML.
 * 
 * KEY EMAIL REQUIREMENTS:
 * - Tables for layout (NO divs/flexbox/grid)
 * - Inline styles (NO external CSS)
 * - Web-safe fonts only
 * - Limited CSS support
 * - Responsive using media queries (standard approach)
 * - Fallback fonts
 * 
 * This is where you show email expertise!
 */

import { emailModel } from './model.js';
import { renderBlockHTML } from './components.js';

class EmailExporter {
    /**
     * Export full email HTML
     * @param {Object} options - Export options
     * @returns {string} - Complete HTML email
     */
    exportHTML(options = {}) {
        const {
            subject = 'Email Template',
            backgroundColor = '#ffffff',
            contentWidth = '600px'
        } = options;
        
        const blocks = emailModel.getAllBlocks();
        
        // Build body HTML from blocks, handling nested blocks
        const bodyHTML = blocks.map(block => {
            return renderBlockHTML(block, (blockId) => {
                return emailModel.getChildBlocks(blockId);
            });
        }).join('\n');
        
        // Wrap in complete email HTML structure
        const html = this.wrapEmailHTML(bodyHTML, {
            subject,
            backgroundColor,
            contentWidth
        });
        
        return html;
    }

    /**
     * Wrap content in complete email HTML structure
     */
    wrapEmailHTML(content, options) {
        const { subject, backgroundColor, contentWidth } = options;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${subject}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
    <style type="text/css">
        /* Reset styles */
        body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            table-layout: auto;
        }
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
        
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            html {
                width: 100% !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
            }
            body {
                width: 100% !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .email-content {
                width: 100% !important;
                max-width: 100% !important;
            }
            .mobile-padding {
                padding: 10px !important;
            }
            img {
                max-width: 100% !important;
                height: auto !important;
            }
            /* Stack columns on mobile */
            .two-columns td {
                display: block !important;
                width: 100% !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
            /* Force all tables to wrap on mobile */
            table {
                width: 100% !important;
                max-width: 100% !important;
                table-layout: auto !important;
            }
            table[width] {
                width: 100% !important;
                max-width: 100% !important;
            }
            td, th {
                max-width: 100% !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
            /* Ensure text content wraps */
            p, div, span, a, h1, h2, h3, h4, h5, h6 {
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
            /* Ensure images don't overflow */
            img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
            }
            /* Box sizing for better wrapping */
            table, td, th {
                box-sizing: border-box !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor || '#f8fafc'};">
    <!-- Wrapper table for email container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${backgroundColor || '#f8fafc'};">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <!-- Email content container -->
                <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="${contentWidth}" style="width: ${contentWidth}; max-width: 100%; background-color: #ffffff; border-radius: 0;">
                    <tr>
                        <td class="email-content" style="padding: 0;">
                            ${content}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    /**
     * Copy HTML to clipboard
     */
    async copyToClipboard(options = {}) {
        const html = this.exportHTML(options);
        
        try {
            await navigator.clipboard.writeText(html);
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = html;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (err) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    }

    /**
     * Download HTML as file
     */
    downloadHTML(filename = 'email-template.html', options = {}) {
        const html = this.exportHTML(options);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Get preview HTML (for iframe preview)
     */
    getPreviewHTML(mode = 'desktop', options = {}) {
        const html = this.exportHTML(options);
        
        // Return just the body content for preview
        // The preview iframe will handle the wrapper
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const body = doc.querySelector('body');
        
        return body ? body.innerHTML : html;
    }
}

// Export singleton instance
export const emailExporter = new EmailExporter();

