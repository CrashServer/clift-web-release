// CLIFT Scene Editor - Visual scene creation and editing system
// Allows users to create custom ASCII scenes with live preview

window.CLIFTSceneEditor = {
    isOpen: false,
    currentScene: null,
    previewCanvas: null,
    previewCtx: null,
    codeEditor: null,
    templates: {},
    
    // Scene templates for different types
    sceneTemplates: {
        'basic': `// Basic Scene Template
function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    // Your scene code here
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 10 + Math.sin(t) * 5) {
                buffer[y][x] = '*';
            }
        }
    }
}`,
        
        'audio-reactive': `// Audio Reactive Scene Template
function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    // Use audio data for reactive visuals
    const audioIntensity = audio.reduce((a, b) => a + b) / audio.length;
    const radius = 10 + audioIntensity * 20;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < radius) {
                const chars = '.:-=+*#%@';
                const intensity = 1 - (dist / radius);
                const charIndex = Math.floor(intensity * chars.length);
                buffer[y][x] = chars[charIndex];
            }
        }
    }
}`,
        
        'pattern': `// Pattern Scene Template
function(buffer, width, height, time, params) {
    const t = time * 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const wave1 = Math.sin(x * 0.1 + t * 2);
            const wave2 = Math.cos(y * 0.1 + t * 1.5);
            const combined = wave1 + wave2;
            
            if (combined > 0.5) {
                buffer[y][x] = '#';
            } else if (combined > 0) {
                buffer[y][x] = '*';
            } else if (combined > -0.5) {
                buffer[y][x] = '.';
            }
        }
    }
}`,
        
        'text': `// Text Scene Template
function(buffer, width, height, time, params) {
    const text = "CLIFT";
    const centerX = Math.floor((width - text.length) / 2);
    const centerY = Math.floor(height / 2);
    const t = time * 0.001;
    
    // Animated text
    for (let i = 0; i < text.length; i++) {
        const x = centerX + i;
        const y = centerY + Math.floor(Math.sin(t + i * 0.5) * 3);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = text[i];
        }
    }
}`,
        
        'particles': `// Particle System Template
function(buffer, width, height, time, params) {
    // Initialize particles if needed
    if (!params._particles) {
        params._particles = [];
        for (let i = 0; i < 50; i++) {
            params._particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                char: Math.random() > 0.5 ? '*' : '.'
            });
        }
    }
    
    // Update particles
    for (let particle of params._particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = width - 1;
        if (particle.x >= width) particle.x = 0;
        if (particle.y < 0) particle.y = height - 1;
        if (particle.y >= height) particle.y = 0;
        
        // Draw particle
        const x = Math.floor(particle.x);
        const y = Math.floor(particle.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = particle.char;
        }
    }
}`
    },
    
    // Initialize the scene editor
    init: function() {
        this.createEditorHTML();
        this.setupEventListeners();
        this.initializePreview();
    },
    
    // Create the editor HTML structure
    createEditorHTML: function() {
        const editorHTML = `
            <div id="scene-editor-overlay" class="editor-overlay" style="display: none;">
                <div class="editor-container">
                    <div class="editor-header">
                        <h2>CLIFT Scene Editor</h2>
                        <div class="editor-controls">
                            <button id="scene-editor-close" class="btn">×</button>
                        </div>
                    </div>
                    
                    <div class="editor-content">
                        <div class="editor-sidebar">
                            <div class="template-section">
                                <h3>Templates</h3>
                                <select id="template-select">
                                    <option value="basic">Basic</option>
                                    <option value="audio-reactive">Audio Reactive</option>
                                    <option value="pattern">Pattern</option>
                                    <option value="text">Text</option>
                                    <option value="particles">Particles</option>
                                </select>
                                <button id="load-template" class="btn">Load Template</button>
                            </div>
                            
                            <div class="scene-info">
                                <h3>Scene Info</h3>
                                <label>Scene ID: <input type="number" id="scene-id" min="200" value="200"></label>
                                <label>Category: <input type="number" id="scene-category" min="20" value="20"></label>
                                <label>Name: <input type="text" id="scene-name" placeholder="Custom Scene"></label>
                            </div>
                            
                            <div class="editor-actions">
                                <button id="test-scene" class="btn btn-primary">Test Scene</button>
                                <button id="save-scene" class="btn btn-success">Save Scene</button>
                                <button id="export-scene" class="btn">Export Code</button>
                            </div>
                        </div>
                        
                        <div class="editor-main">
                            <div class="editor-tabs">
                                <button class="tab-button active" data-tab="code">Code</button>
                                <button class="tab-button" data-tab="preview">Preview</button>
                                <button class="tab-button" data-tab="help">Help</button>
                            </div>
                            
                            <div class="tab-content">
                                <div id="code-tab" class="tab-panel active">
                                    <textarea id="scene-code" class="code-editor" placeholder="Enter your scene code here..."></textarea>
                                    <div class="code-actions">
                                        <button id="format-code" class="btn">Format Code</button>
                                        <button id="validate-code" class="btn">Validate</button>
                                        <span id="code-status" class="status"></span>
                                    </div>
                                </div>
                                
                                <div id="preview-tab" class="tab-panel">
                                    <div class="preview-container">
                                        <canvas id="scene-preview" width="400" height="150"></canvas>
                                        <div class="preview-controls">
                                            <button id="preview-play" class="btn">Play</button>
                                            <button id="preview-pause" class="btn">Pause</button>
                                            <button id="preview-reset" class="btn">Reset</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="help-tab" class="tab-panel">
                                    <div class="help-content">
                                        <h3>Scene Function Parameters</h3>
                                        <ul>
                                            <li><strong>buffer</strong> - 2D array to draw ASCII characters</li>
                                            <li><strong>width</strong> - Screen width in characters</li>
                                            <li><strong>height</strong> - Screen height in characters</li>
                                            <li><strong>time</strong> - Current time in milliseconds</li>
                                            <li><strong>params</strong> - Object containing:
                                                <ul>
                                                    <li><strong>audio</strong> - Audio frequency data array</li>
                                                    <li><strong>beat</strong> - Beat position (0-1)</li>
                                                    <li><strong>bpm</strong> - Current BPM</li>
                                                    <li><strong>frame</strong> - Frame number</li>
                                                </ul>
                                            </li>
                                        </ul>
                                        
                                        <h3>Useful Functions</h3>
                                        <ul>
                                            <li><strong>Math.sin()</strong>, <strong>Math.cos()</strong> - For waves and oscillations</li>
                                            <li><strong>Math.sqrt()</strong> - For distance calculations</li>
                                            <li><strong>Math.floor()</strong> - For integer coordinates</li>
                                            <li><strong>Math.random()</strong> - For random values</li>
                                        </ul>
                                        
                                        <h3>ASCII Characters</h3>
                                        <p>Common characters for different intensities:</p>
                                        <code>' .:-=+*#%@█'</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS styles
        const editorCSS = `
            <style>
                .editor-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .editor-container {
                    width: 90vw;
                    height: 90vh;
                    background: #111;
                    border: 2px solid #0f0;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Courier New', monospace;
                }
                
                .editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    background: #222;
                    border-bottom: 1px solid #0f0;
                }
                
                .editor-header h2 {
                    color: #0f0;
                    margin: 0;
                    font-size: 18px;
                }
                
                .editor-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }
                
                .editor-sidebar {
                    width: 250px;
                    background: #1a1a1a;
                    padding: 20px;
                    border-right: 1px solid #333;
                    overflow-y: auto;
                }
                
                .editor-sidebar h3 {
                    color: #0f0;
                    margin: 0 0 10px 0;
                    font-size: 14px;
                }
                
                .template-section, .scene-info, .editor-actions {
                    margin-bottom: 20px;
                }
                
                .editor-sidebar select, .editor-sidebar input {
                    width: 100%;
                    padding: 5px;
                    margin: 5px 0;
                    background: #333;
                    border: 1px solid #555;
                    color: #fff;
                    font-family: 'Courier New', monospace;
                }
                
                .editor-sidebar label {
                    display: block;
                    color: #ccc;
                    font-size: 12px;
                    margin: 5px 0;
                }
                
                .editor-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .editor-tabs {
                    display: flex;
                    background: #222;
                    border-bottom: 1px solid #333;
                }
                
                .tab-button {
                    padding: 10px 20px;
                    background: #333;
                    border: none;
                    color: #ccc;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    border-right: 1px solid #555;
                }
                
                .tab-button:hover {
                    background: #444;
                }
                
                .tab-button.active {
                    background: #0f0;
                    color: #000;
                }
                
                .tab-content {
                    flex: 1;
                    position: relative;
                }
                
                .tab-panel {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: none;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .tab-panel.active {
                    display: block;
                }
                
                .code-editor {
                    width: 100%;
                    height: calc(100% - 60px);
                    background: #1a1a1a;
                    color: #0f0;
                    border: 1px solid #333;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 10px;
                    resize: none;
                    outline: none;
                }
                
                .code-actions {
                    margin-top: 10px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .preview-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                
                #scene-preview {
                    background: #000;
                    border: 2px solid #0f0;
                    font-family: 'Courier New', monospace;
                }
                
                .preview-controls {
                    display: flex;
                    gap: 10px;
                }
                
                .help-content {
                    color: #ccc;
                    line-height: 1.5;
                }
                
                .help-content h3 {
                    color: #0f0;
                    margin-top: 20px;
                }
                
                .help-content ul {
                    margin-left: 20px;
                }
                
                .help-content code {
                    background: #333;
                    padding: 2px 4px;
                    border-radius: 3px;
                }
                
                .btn {
                    padding: 5px 10px;
                    background: #333;
                    border: 1px solid #555;
                    color: #fff;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                }
                
                .btn:hover {
                    background: #444;
                }
                
                .btn-primary {
                    background: #0066cc;
                    border-color: #0088ff;
                }
                
                .btn-success {
                    background: #006600;
                    border-color: #00aa00;
                }
                
                .status {
                    color: #ccc;
                    font-size: 12px;
                }
                
                .status.success {
                    color: #0f0;
                }
                
                .status.error {
                    color: #f00;
                }
            </style>
        `;
        
        // Add to document
        document.head.insertAdjacentHTML('beforeend', editorCSS);
        document.body.insertAdjacentHTML('beforeend', editorHTML);
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        const elements = {
            overlay: document.getElementById('scene-editor-overlay'),
            closeBtn: document.getElementById('scene-editor-close'),
            templateSelect: document.getElementById('template-select'),
            loadTemplateBtn: document.getElementById('load-template'),
            sceneCode: document.getElementById('scene-code'),
            testBtn: document.getElementById('test-scene'),
            saveBtn: document.getElementById('save-scene'),
            exportBtn: document.getElementById('export-scene'),
            formatBtn: document.getElementById('format-code'),
            validateBtn: document.getElementById('validate-code'),
            status: document.getElementById('code-status'),
            previewPlay: document.getElementById('preview-play'),
            previewPause: document.getElementById('preview-pause'),
            previewReset: document.getElementById('preview-reset'),
            sceneId: document.getElementById('scene-id'),
            sceneCategory: document.getElementById('scene-category'),
            sceneName: document.getElementById('scene-name')
        };
        
        // Close editor
        elements.closeBtn.onclick = () => this.close();
        elements.overlay.onclick = (e) => {
            if (e.target === elements.overlay) this.close();
        };
        
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.onclick = () => this.switchTab(btn.dataset.tab);
        });
        
        // Load template
        elements.loadTemplateBtn.onclick = () => {
            const template = elements.templateSelect.value;
            elements.sceneCode.value = this.sceneTemplates[template];
            this.validateCode();
        };
        
        // Code actions
        elements.testBtn.onclick = () => this.testScene();
        elements.saveBtn.onclick = () => this.saveScene();
        elements.exportBtn.onclick = () => this.exportScene();
        elements.formatBtn.onclick = () => this.formatCode();
        elements.validateBtn.onclick = () => this.validateCode();
        
        // Preview controls
        elements.previewPlay.onclick = () => this.startPreview();
        elements.previewPause.onclick = () => this.pausePreview();
        elements.previewReset.onclick = () => this.resetPreview();
        
        // Auto-validate on code change
        elements.sceneCode.oninput = () => this.validateCode();
        
        // Scene ID/Category sync
        elements.sceneId.onchange = () => {
            const id = parseInt(elements.sceneId.value);
            elements.sceneCategory.value = Math.floor(id / 10);
        };
        
        elements.sceneCategory.onchange = () => {
            const category = parseInt(elements.sceneCategory.value);
            const currentId = parseInt(elements.sceneId.value);
            const sceneNum = currentId % 10;
            elements.sceneId.value = category * 10 + sceneNum;
        };
    },
    
    // Initialize preview canvas
    initializePreview: function() {
        this.previewCanvas = document.getElementById('scene-preview');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.previewCtx.font = '12px "Courier New", monospace';
        this.previewCtx.textBaseline = 'top';
        this.previewRunning = false;
        this.previewTime = 0;
    },
    
    // Open the editor
    open: function(sceneId = null) {
        this.isOpen = true;
        document.getElementById('scene-editor-overlay').style.display = 'flex';
        
        if (sceneId !== null) {
            this.loadScene(sceneId);
        } else {
            // Load basic template
            document.getElementById('scene-code').value = this.sceneTemplates.basic;
            this.validateCode();
        }
    },
    
    // Close the editor
    close: function() {
        this.isOpen = false;
        document.getElementById('scene-editor-overlay').style.display = 'none';
        this.pausePreview();
    },
    
    // Switch between tabs
    switchTab: function(tabName) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },
    
    // Load existing scene
    loadScene: function(sceneId) {
        const elements = {
            sceneId: document.getElementById('scene-id'),
            sceneCategory: document.getElementById('scene-category'),
            sceneName: document.getElementById('scene-name'),
            sceneCode: document.getElementById('scene-code')
        };
        
        elements.sceneId.value = sceneId;
        elements.sceneCategory.value = Math.floor(sceneId / 10);
        elements.sceneName.value = `Scene ${sceneId}`;
        
        if (window.CLIFTScenes && window.CLIFTScenes[sceneId]) {
            elements.sceneCode.value = window.CLIFTScenes[sceneId].toString();
        } else {
            elements.sceneCode.value = this.sceneTemplates.basic;
        }
        
        this.validateCode();
    },
    
    // Test scene in main engine
    testScene: function() {
        const code = document.getElementById('scene-code').value;
        const sceneId = parseInt(document.getElementById('scene-id').value);
        
        try {
            const sceneFunction = eval(`(${code})`);
            
            // Test the scene function
            if (typeof sceneFunction === 'function') {
                // Initialize custom scenes storage
                if (!window.CLIFTCustomScenes) {
                    window.CLIFTCustomScenes = {};
                }
                
                // Temporarily replace the scene
                const originalScene = window.CLIFTCustomScenes[sceneId];
                window.CLIFTCustomScenes[sceneId] = sceneFunction;
                
                // Switch to test scene
                if (window.clift) {
                    window.clift.selectCategory(Math.floor(sceneId / 10));
                    window.clift.selectDeck(0);
                    window.clift.decks[0].scene = sceneId % 10;
                    
                    this.showStatus('Testing custom scene...', 'success');
                    
                    // Restore original scene after 10 seconds
                    setTimeout(() => {
                        if (originalScene) {
                            window.CLIFTCustomScenes[sceneId] = originalScene;
                        } else {
                            delete window.CLIFTCustomScenes[sceneId];
                        }
                        this.showStatus('Test complete', 'success');
                    }, 10000);
                } else {
                    this.showStatus('CLIFT engine not available', 'error');
                }
            } else {
                this.showStatus('Invalid function', 'error');
            }
        } catch (e) {
            this.showStatus(`Error: ${e.message}`, 'error');
        }
    },
    
    // Save scene to custom scenes
    saveScene: function() {
        const code = document.getElementById('scene-code').value;
        const sceneId = parseInt(document.getElementById('scene-id').value);
        
        try {
            const sceneFunction = eval(`(${code})`);
            
            if (typeof sceneFunction === 'function') {
                // Initialize custom scenes storage
                if (!window.CLIFTCustomScenes) {
                    window.CLIFTCustomScenes = {};
                }
                
                window.CLIFTCustomScenes[sceneId] = sceneFunction;
                this.showStatus(`Custom scene ${sceneId} saved successfully`, 'success');
                
                console.log(`Custom scene ${sceneId} saved`);
            } else {
                this.showStatus('Invalid function', 'error');
            }
        } catch (e) {
            this.showStatus(`Error: ${e.message}`, 'error');
        }
    },
    
    // Export scene code
    exportScene: function() {
        const code = document.getElementById('scene-code').value;
        const sceneId = parseInt(document.getElementById('scene-id').value);
        const sceneName = document.getElementById('scene-name').value;
        
        const exportCode = `// ${sceneName} (Custom Scene ${sceneId})
CLIFTCustomScenes[${sceneId}] = ${code};`;
        
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(exportCode);
            this.showStatus('Code copied to clipboard', 'success');
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = exportCode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showStatus('Code copied to clipboard', 'success');
        }
    },
    
    // Format code
    formatCode: function() {
        const code = document.getElementById('scene-code').value;
        // Basic formatting - add proper indentation
        const formatted = this.formatJavaScript(code);
        document.getElementById('scene-code').value = formatted;
        this.showStatus('Code formatted', 'success');
    },
    
    // Validate code
    validateCode: function() {
        const code = document.getElementById('scene-code').value;
        
        try {
            const sceneFunction = eval(`(${code})`);
            
            if (typeof sceneFunction === 'function') {
                // Check if function has correct parameters
                const params = this.getFunctionParameters(sceneFunction);
                if (params.length >= 4) {
                    this.showStatus('Code is valid', 'success');
                } else {
                    this.showStatus('Warning: Function should have 5 parameters', 'error');
                }
            } else {
                this.showStatus('Not a valid function', 'error');
            }
        } catch (e) {
            this.showStatus(`Syntax error: ${e.message}`, 'error');
        }
    },
    
    // Start preview
    startPreview: function() {
        this.previewRunning = true;
        this.previewTime = 0;
        this.runPreview();
    },
    
    // Pause preview
    pausePreview: function() {
        this.previewRunning = false;
    },
    
    // Reset preview
    resetPreview: function() {
        this.previewTime = 0;
        this.previewRunning = false;
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    },
    
    // Run preview animation
    runPreview: function() {
        if (!this.previewRunning) return;
        
        const code = document.getElementById('scene-code').value;
        
        try {
            const sceneFunction = eval(`(${code})`);
            
            if (typeof sceneFunction === 'function') {
                // Create preview buffer
                const width = 50;
                const height = 15;
                const buffer = [];
                for (let y = 0; y < height; y++) {
                    buffer[y] = new Array(width).fill(' ');
                }
                
                // Run scene function
                const params = {
                    audio: new Float32Array(64).fill(0.3),
                    beat: (this.previewTime * 0.002) % 1,
                    bpm: 120,
                    frame: Math.floor(this.previewTime * 0.06),
                    _particles: null // Reset particles for each preview
                };
                
                sceneFunction(buffer, width, height, this.previewTime, params);
                
                // Render to canvas
                this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
                this.previewCtx.fillStyle = '#0f0';
                
                const charWidth = this.previewCanvas.width / width;
                const charHeight = this.previewCanvas.height / height;
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const char = buffer[y][x];
                        if (char !== ' ') {
                            this.previewCtx.fillText(char, x * charWidth, y * charHeight);
                        }
                    }
                }
                
                this.previewTime += 50;
                setTimeout(() => this.runPreview(), 50);
            }
        } catch (e) {
            this.showStatus(`Preview error: ${e.message}`, 'error');
            this.previewRunning = false;
        }
    },
    
    // Show status message
    showStatus: function(message, type = 'success') {
        const status = document.getElementById('code-status');
        status.textContent = message;
        status.className = `status ${type}`;
        
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status';
        }, 3000);
    },
    
    // Basic JavaScript formatting
    formatJavaScript: function(code) {
        // Simple formatting - this could be enhanced
        return code
            .replace(/\{/g, '{\n    ')
            .replace(/\}/g, '\n}')
            .replace(/;/g, ';\n    ')
            .replace(/\n\s*\n/g, '\n')
            .replace(/\n    \}/g, '\n}');
    },
    
    // Get function parameters
    getFunctionParameters: function(func) {
        const funcStr = func.toString();
        const params = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')'));
        return params.split(',').map(param => param.trim()).filter(param => param);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    CLIFTSceneEditor.init();
});

console.log('CLIFT Scene Editor loaded');