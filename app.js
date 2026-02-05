/**
 * Binary Code Converter
 * A fully functional word-to-binary and binary-to-word converter
 * with JSON file download/upload capabilities
 * 
 * @author Binary Converter
 * @version 1.0.0
 */

// ========================================
// DOM Element References
// ========================================

const elements = {
    // Text to Binary Section
    textInput: document.getElementById('textInput'),
    textCharCount: document.getElementById('textCharCount'),
    clearTextInput: document.getElementById('clearTextInput'),
    realtimeText: document.getElementById('realtimeText'),
    convertTextBtn: document.getElementById('convertTextBtn'),
    binaryOutput: document.getElementById('binaryOutput'),
    binaryBitCount: document.getElementById('binaryBitCount'),
    textBreakdownToggle: document.getElementById('textBreakdownToggle'),
    textBreakdownContent: document.getElementById('textBreakdownContent'),
    textBreakdownTable: document.getElementById('textBreakdownTable'),
    copyBinaryBtn: document.getElementById('copyBinaryBtn'),
    downloadTextJsonBtn: document.getElementById('downloadTextJsonBtn'),
    resetTextSection: document.getElementById('resetTextSection'),
    
    // Binary to Text Section
    binaryInput: document.getElementById('binaryInput'),
    binaryInputCount: document.getElementById('binaryInputCount'),
    clearBinaryInput: document.getElementById('clearBinaryInput'),
    realtimeBinary: document.getElementById('realtimeBinary'),
    formatSelect: document.getElementById('formatSelect'),
    convertBinaryBtn: document.getElementById('convertBinaryBtn'),
    textOutput: document.getElementById('textOutput'),
    textOutputCharCount: document.getElementById('textOutputCharCount'),
    binaryBreakdownToggle: document.getElementById('binaryBreakdownToggle'),
    binaryBreakdownContent: document.getElementById('binaryBreakdownContent'),
    binaryBreakdownTable: document.getElementById('binaryBreakdownTable'),
    copyTextBtn: document.getElementById('copyTextBtn'),
    downloadBinaryJsonBtn: document.getElementById('downloadBinaryJsonBtn'),
    resetBinarySection: document.getElementById('resetBinarySection'),
    
    // Upload Section
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    uploadStatus: document.getElementById('uploadStatus'),
    
    // Reference Section
    asciiRefToggle: document.getElementById('asciiRefToggle'),
    asciiRefContent: document.getElementById('asciiRefContent'),
    asciiGrid: document.getElementById('asciiGrid'),
    
    // Other
    themeToggle: document.getElementById('themeToggle'),
    binaryRain: document.getElementById('binaryRain'),
    toastContainer: document.getElementById('toastContainer')
};

// ========================================
// State Management
// ========================================

const state = {
    textToBinaryResult: null,
    binaryToTextResult: null,
    currentTheme: localStorage.getItem('theme') || 'dark'
};

// ========================================
// Utility Functions
// ========================================

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close notification">×</button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

/**
 * Remove a toast with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
    if (!toast.classList.contains('removing')) {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Format special characters for display
 * @param {string} char - The character to format
 * @returns {string} Formatted character display
 */
function formatCharacter(char) {
    const specialChars = {
        ' ': '(space)',
        '\n': '(newline)',
        '\t': '(tab)',
        '\r': '(return)'
    };
    return specialChars[char] || char;
}

// ========================================
// Conversion Functions
// ========================================

/**
 * Convert text to binary
 * @param {string} text - The text to convert
 * @returns {object} Conversion result object
 */
function textToBinary(text) {
    if (!text) {
        return null;
    }
    
    const breakdown = [];
    const binaryArray = [];
    
    for (let char of text) {
        const asciiValue = char.charCodeAt(0);
        const binaryCode = asciiValue.toString(2).padStart(8, '0');
        
        breakdown.push({
            character: char,
            displayChar: formatCharacter(char),
            asciiValue: asciiValue,
            binaryCode: binaryCode
        });
        
        binaryArray.push(binaryCode);
    }
    
    const binaryString = binaryArray.join(' ');
    
    return {
        conversionType: 'text-to-binary',
        timestamp: getTimestamp(),
        input: {
            originalText: text,
            characterCount: text.length
        },
        output: {
            binaryString: binaryString,
            binaryArray: binaryArray
        },
        breakdown: breakdown
    };
}

/**
 * Detect the format of binary input
 * @param {string} binary - The binary string to analyze
 * @returns {string} Format type: 'space', 'comma', 'continuous', or 'invalid'
 */
function detectBinaryFormat(binary) {
    const trimmed = binary.trim();
    
    if (trimmed.includes(' ')) {
        return 'space';
    } else if (trimmed.includes(',')) {
        return 'comma';
    } else if (/^[01]+$/.test(trimmed)) {
        return 'continuous';
    }
    
    return 'invalid';
}

/**
 * Parse binary input into array of 8-bit chunks
 * @param {string} binary - The binary string to parse
 * @param {string} format - The format to use for parsing
 * @returns {array|null} Array of binary chunks or null if invalid
 */
function parseBinaryInput(binary, format) {
    const trimmed = binary.trim();
    
    if (!trimmed) {
        return null;
    }
    
    let chunks;
    
    if (format === 'auto') {
        format = detectBinaryFormat(trimmed);
    }
    
    switch (format) {
        case 'space':
            chunks = trimmed.split(/\s+/);
            break;
        case 'comma':
            chunks = trimmed.split(',').map(s => s.trim());
            break;
        case 'continuous':
            // Split into 8-bit chunks
            const cleaned = trimmed.replace(/\s/g, '');
            chunks = cleaned.match(/.{1,8}/g) || [];
            break;
        default:
            return null;
    }
    
    // Validate each chunk
    for (let chunk of chunks) {
        if (!/^[01]+$/.test(chunk)) {
            return null;
        }
    }
    
    return chunks;
}

/**
 * Convert binary to text
 * @param {string} binary - The binary string to convert
 * @param {string} format - The format of the binary input
 * @returns {object|null} Conversion result object or null if invalid
 */
function binaryToText(binary, format = 'auto') {
    const chunks = parseBinaryInput(binary, format);
    
    if (!chunks || chunks.length === 0) {
        return null;
    }
    
    const breakdown = [];
    let decodedText = '';
    const warnings = [];
    
    for (let chunk of chunks) {
        // Pad chunk to 8 bits if necessary
        const paddedChunk = chunk.padStart(8, '0');
        const asciiValue = parseInt(paddedChunk, 2);
        const character = String.fromCharCode(asciiValue);
        
        // Check for non-printable characters
        if (asciiValue < 32 && asciiValue !== 10 && asciiValue !== 13 && asciiValue !== 9) {
            warnings.push(`Non-printable character detected: ASCII ${asciiValue}`);
        }
        
        breakdown.push({
            binaryCode: paddedChunk,
            asciiValue: asciiValue,
            character: character,
            displayChar: formatCharacter(character)
        });
        
        decodedText += character;
    }
    
    return {
        conversionType: 'binary-to-text',
        timestamp: getTimestamp(),
        input: {
            binaryString: binary.trim(),
            binaryArray: chunks
        },
        output: {
            decodedText: decodedText,
            characterCount: decodedText.length
        },
        breakdown: breakdown,
        warnings: warnings
    };
}

// ========================================
// UI Update Functions
// ========================================

/**
 * Update the text-to-binary output display
 * @param {object} result - The conversion result
 */
function updateTextToBinaryOutput(result) {
    if (!result) {
        elements.binaryOutput.innerHTML = '<span class="placeholder-text">Binary code will appear here...</span>';
        elements.binaryBitCount.textContent = '0 bits';
        elements.textBreakdownTable.querySelector('tbody').innerHTML = '';
        toggleActionButtons('text', false);
        return;
    }
    
    // Update output display
    elements.binaryOutput.textContent = result.output.binaryString;
    elements.binaryBitCount.textContent = `${result.output.binaryArray.length * 8} bits`;
    
    // Update breakdown table
    const tbody = elements.textBreakdownTable.querySelector('tbody');
    tbody.innerHTML = result.breakdown.map(item => `
        <tr>
            <td>${escapeHtml(item.displayChar)}</td>
            <td>${item.asciiValue}</td>
            <td>${item.binaryCode}</td>
        </tr>
    `).join('');
    
    // Enable action buttons
    toggleActionButtons('text', true);
    
    // Store result for download
    state.textToBinaryResult = result;
}

/**
 * Update the binary-to-text output display
 * @param {object} result - The conversion result
 */
function updateBinaryToTextOutput(result) {
    if (!result) {
        elements.textOutput.innerHTML = '<span class="placeholder-text">Decoded text will appear here...</span>';
        elements.textOutputCharCount.textContent = '0 characters';
        elements.binaryBreakdownTable.querySelector('tbody').innerHTML = '';
        toggleActionButtons('binary', false);
        return;
    }
    
    // Update output display
    elements.textOutput.textContent = result.output.decodedText;
    elements.textOutputCharCount.textContent = `${result.output.characterCount} characters`;
    
    // Update breakdown table
    const tbody = elements.binaryBreakdownTable.querySelector('tbody');
    tbody.innerHTML = result.breakdown.map(item => `
        <tr>
            <td>${item.binaryCode}</td>
            <td>${item.asciiValue}</td>
            <td>${escapeHtml(item.displayChar)}</td>
        </tr>
    `).join('');
    
    // Show warnings if any
    if (result.warnings && result.warnings.length > 0) {
        showToast(result.warnings[0], 'warning');
    }
    
    // Enable action buttons
    toggleActionButtons('binary', true);
    
    // Store result for download
    state.binaryToTextResult = result;
}

/**
 * Toggle action buttons enabled/disabled state
 * @param {string} section - 'text' or 'binary'
 * @param {boolean} enabled - Whether to enable or disable
 */
function toggleActionButtons(section, enabled) {
    if (section === 'text') {
        elements.copyBinaryBtn.disabled = !enabled;
        elements.downloadTextJsonBtn.disabled = !enabled;
        elements.resetTextSection.disabled = !enabled;
    } else {
        elements.copyTextBtn.disabled = !enabled;
        elements.downloadBinaryJsonBtn.disabled = !enabled;
        elements.resetBinarySection.disabled = !enabled;
    }
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update character/bit counters
 */
function updateCounters() {
    // Text input counter
    const textLength = elements.textInput.value.length;
    elements.textCharCount.textContent = `${textLength} character${textLength !== 1 ? 's' : ''}`;
    
    // Binary input counter
    const binaryClean = elements.binaryInput.value.replace(/[^01]/g, '');
    elements.binaryInputCount.textContent = `${binaryClean.length} bits`;
}

// ========================================
// File Operations
// ========================================

/**
 * Download data as JSON file
 * @param {object} data - Data to download
 * @param {string} filename - Name of the file
 */
function downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('JSON file downloaded successfully!', 'success');
}

/**
 * Handle file upload
 * @param {File} file - The uploaded file
 */
async function handleFileUpload(file) {
    // Validate file type
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        showToast('Please upload a .json file', 'error');
        updateUploadStatus('Please upload a .json file', 'error');
        return;
    }
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validate JSON structure
        if (!data.conversionType || !data.input || !data.output) {
            throw new Error('Invalid JSON structure');
        }
        
        // Process based on conversion type
        if (data.conversionType === 'text-to-binary') {
            elements.textInput.value = data.input.originalText;
            updateCounters();
            updateTextToBinaryOutput(data);
            showToast('Text-to-binary conversion loaded!', 'success');
            updateUploadStatus('Text-to-binary conversion loaded successfully!', 'success');
        } else if (data.conversionType === 'binary-to-text') {
            elements.binaryInput.value = data.input.binaryString;
            updateCounters();
            updateBinaryToTextOutput(data);
            showToast('Binary-to-text conversion loaded!', 'success');
            updateUploadStatus('Binary-to-text conversion loaded successfully!', 'success');
        } else {
            throw new Error('Unknown conversion type');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Invalid JSON file structure', 'error');
        updateUploadStatus('Invalid JSON file structure', 'error');
    }
}

/**
 * Update upload status message
 * @param {string} message - Status message
 * @param {string} type - 'success' or 'error'
 */
function updateUploadStatus(message, type) {
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `upload-status ${type}`;
    
    // Clear status after 5 seconds
    setTimeout(() => {
        elements.uploadStatus.textContent = '';
        elements.uploadStatus.className = 'upload-status';
    }, 5000);
}

// ========================================
// Clipboard Operations
// ========================================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
    } catch (error) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy. Please try manually.', 'error');
        }
        
        document.body.removeChild(textarea);
    }
}

// ========================================
// Reset Functions
// ========================================

/**
 * Reset text-to-binary section
 */
function resetTextSection() {
    elements.textInput.value = '';
    updateTextToBinaryOutput(null);
    updateCounters();
    state.textToBinaryResult = null;
    
    // Collapse breakdown if expanded
    if (elements.textBreakdownToggle.getAttribute('aria-expanded') === 'true') {
        toggleBreakdown('text');
    }
}

/**
 * Reset binary-to-text section
 */
function resetBinarySection() {
    elements.binaryInput.value = '';
    updateBinaryToTextOutput(null);
    updateCounters();
    state.binaryToTextResult = null;
    
    // Collapse breakdown if expanded
    if (elements.binaryBreakdownToggle.getAttribute('aria-expanded') === 'true') {
        toggleBreakdown('binary');
    }
}

// ========================================
// Breakdown Toggle
// ========================================

/**
 * Toggle breakdown section visibility
 * @param {string} section - 'text' or 'binary'
 */
function toggleBreakdown(section) {
    const toggle = section === 'text' ? elements.textBreakdownToggle : elements.binaryBreakdownToggle;
    const content = section === 'text' ? elements.textBreakdownContent : elements.binaryBreakdownContent;
    
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    toggle.setAttribute('aria-expanded', !isExpanded);
    content.hidden = isExpanded;
    
    // Update button text
    toggle.querySelector('span:last-child') || (toggle.innerHTML = toggle.innerHTML);
    const textNode = toggle.childNodes[toggle.childNodes.length - 1];
    if (textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = isExpanded ? ' Show Conversion Breakdown' : ' Hide Conversion Breakdown';
    }
}

// ========================================
// Theme Toggle
// ========================================

/**
 * Toggle between dark and light theme
 */
function toggleTheme() {
    const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    state.currentTheme = newTheme;
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle icon
    elements.themeToggle.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
}

/**
 * Initialize theme from storage
 */
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    elements.themeToggle.querySelector('.theme-icon').textContent = state.currentTheme === 'dark' ? '🌙' : '☀️';
}

// ========================================
// Binary Rain Effect
// ========================================

/**
 * Initialize the binary rain background effect
 */
function initializeBinaryRain() {
    const container = elements.binaryRain;
    const columnCount = Math.floor(window.innerWidth / 30);
    
    for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = 'binary-column';
        column.style.left = `${(i / columnCount) * 100}%`;
        column.style.animationDuration = `${10 + Math.random() * 20}s`;
        column.style.animationDelay = `${Math.random() * -20}s`;
        
        // Generate random binary string
        let binaryText = '';
        for (let j = 0; j < 50; j++) {
            binaryText += Math.random() > 0.5 ? '1' : '0';
        }
        column.textContent = binaryText;
        
        container.appendChild(column);
    }
}

// ========================================
// ASCII Reference Table
// ========================================

/**
 * Generate ASCII reference grid
 */
function generateAsciiReference() {
    const grid = elements.asciiGrid;
    grid.innerHTML = '';
    
    // Generate printable ASCII characters (32-126)
    for (let i = 32; i <= 126; i++) {
        const item = document.createElement('div');
        item.className = 'reference-item';
        
        const char = String.fromCharCode(i);
        const displayChar = i === 32 ? 'SPC' : char;
        
        item.innerHTML = `
            <span class="char">${escapeHtml(displayChar)}</span>
            <span class="ascii">${i}</span>
            <span class="binary">${i.toString(2).padStart(8, '0')}</span>
        `;
        
        grid.appendChild(item);
    }
}

// ========================================
// Event Listeners
// ========================================

function initializeEventListeners() {
    // Text to Binary Conversion
    elements.convertTextBtn.addEventListener('click', () => {
        const text = elements.textInput.value;
        if (!text.trim()) {
            showToast('Please enter some text to convert', 'warning');
            return;
        }
        const result = textToBinary(text);
        updateTextToBinaryOutput(result);
        showToast('Converted successfully!', 'success');
    });
    
    // Binary to Text Conversion
    elements.convertBinaryBtn.addEventListener('click', () => {
        const binary = elements.binaryInput.value;
        if (!binary.trim()) {
            showToast('Please enter binary code to convert', 'warning');
            return;
        }
        
        const format = elements.formatSelect.value;
        const result = binaryToText(binary, format);
        
        if (!result) {
            showToast('Invalid binary format. Use only 0s and 1s.', 'error');
            return;
        }
        
        updateBinaryToTextOutput(result);
        showToast('Converted successfully!', 'success');
    });
    
    // Real-time conversion toggles
    elements.realtimeText.addEventListener('change', () => {
        if (elements.realtimeText.checked && elements.textInput.value) {
            const result = textToBinary(elements.textInput.value);
            updateTextToBinaryOutput(result);
        }
    });
    
    elements.realtimeBinary.addEventListener('change', () => {
        if (elements.realtimeBinary.checked && elements.binaryInput.value) {
            const result = binaryToText(elements.binaryInput.value, elements.formatSelect.value);
            if (result) updateBinaryToTextOutput(result);
        }
    });
    
    // Input event listeners for real-time conversion
    elements.textInput.addEventListener('input', () => {
        updateCounters();
        if (elements.realtimeText.checked) {
            const result = textToBinary(elements.textInput.value);
            updateTextToBinaryOutput(result);
        }
    });
    
    elements.binaryInput.addEventListener('input', () => {
        updateCounters();
        if (elements.realtimeBinary.checked) {
            const result = binaryToText(elements.binaryInput.value, elements.formatSelect.value);
            if (result) updateBinaryToTextOutput(result);
        }
    });
    
    // Clear buttons
    elements.clearTextInput.addEventListener('click', () => {
        elements.textInput.value = '';
        updateCounters();
        elements.textInput.focus();
    });
    
    elements.clearBinaryInput.addEventListener('click', () => {
        elements.binaryInput.value = '';
        updateCounters();
        elements.binaryInput.focus();
    });
    
    // Copy buttons
    elements.copyBinaryBtn.addEventListener('click', () => {
        if (state.textToBinaryResult) {
            copyToClipboard(state.textToBinaryResult.output.binaryString);
        }
    });
    
    elements.copyTextBtn.addEventListener('click', () => {
        if (state.binaryToTextResult) {
            copyToClipboard(state.binaryToTextResult.output.decodedText);
        }
    });
    
    // Download buttons
    elements.downloadTextJsonBtn.addEventListener('click', () => {
        if (state.textToBinaryResult) {
            const filename = `text-to-binary-${Date.now()}.json`;
            downloadJSON(state.textToBinaryResult, filename);
        }
    });
    
    elements.downloadBinaryJsonBtn.addEventListener('click', () => {
        if (state.binaryToTextResult) {
            const filename = `binary-to-text-${Date.now()}.json`;
            downloadJSON(state.binaryToTextResult, filename);
        }
    });
    
    // Reset buttons
    elements.resetTextSection.addEventListener('click', resetTextSection);
    elements.resetBinarySection.addEventListener('click', resetBinarySection);
    
    // Breakdown toggles
    elements.textBreakdownToggle.addEventListener('click', () => toggleBreakdown('text'));
    elements.binaryBreakdownToggle.addEventListener('click', () => toggleBreakdown('binary'));
    
    // Upload zone events
    elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    elements.uploadZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            elements.fileInput.click();
        }
    });
    
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Drag and drop
    elements.uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadZone.classList.add('drag-over');
    });
    
    elements.uploadZone.addEventListener('dragleave', () => {
        elements.uploadZone.classList.remove('drag-over');
    });
    
    elements.uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // ASCII reference toggle
    elements.asciiRefToggle.addEventListener('click', () => {
        const isExpanded = elements.asciiRefToggle.getAttribute('aria-expanded') === 'true';
        elements.asciiRefToggle.setAttribute('aria-expanded', !isExpanded);
        elements.asciiRefContent.hidden = isExpanded;
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const activeElement = document.activeElement;
            
            if (activeElement === elements.textInput || activeElement.closest('#textToBinarySection')) {
                elements.convertTextBtn.click();
            } else if (activeElement === elements.binaryInput || activeElement.closest('#binaryToTextSection')) {
                elements.convertBinaryBtn.click();
            }
        }
        
        // Ctrl/Cmd + Shift + C to copy result
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            const activeElement = document.activeElement;
            
            if (activeElement.closest('#textToBinarySection') && state.textToBinaryResult) {
                copyToClipboard(state.textToBinaryResult.output.binaryString);
            } else if (activeElement.closest('#binaryToTextSection') && state.binaryToTextResult) {
                copyToClipboard(state.binaryToTextResult.output.decodedText);
            }
        }
        
        // Escape to clear
        if (e.key === 'Escape') {
            const activeElement = document.activeElement;
            
            if (activeElement === elements.textInput) {
                elements.clearTextInput.click();
            } else if (activeElement === elements.binaryInput) {
                elements.clearBinaryInput.click();
            }
        }
    });
}

// ========================================
// Initialization
// ========================================

function initialize() {
    initializeTheme();
    initializeBinaryRain();
    generateAsciiReference();
    initializeEventListeners();
    updateCounters();
    
    console.log('🔢 Binary Code Converter initialized successfully!');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}