// CLIFT Web WebSocket Client - Live Coding Overlay
// Connects to CLIFT WebSocket server for code overlay display

window.CLIFTWebSocket = {
    ws: null,
    connected: false,
    reconnectInterval: 5000,
    reconnectTimer: null,
    serverUrl: 'ws://localhost:8080',
    overlayElement: null,
    callbacks: {
        onConnect: [],
        onDisconnect: [],
        onMessage: [],
        onError: []
    },
    
    // Initialize WebSocket client
    init: function(overlayElement) {
        this.overlayElement = overlayElement || this.createOverlay();
        this.connect();
    },
    
    // Create overlay element if not provided
    createOverlay: function() {
        const overlay = document.createElement('div');
        overlay.id = 'clift-code-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10%;
            left: 10%;
            right: 10%;
            bottom: 10%;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #0f0;
            color: #0f0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            padding: 20px;
            overflow: auto;
            display: none;
            z-index: 1000;
            white-space: pre-wrap;
            word-wrap: break-word;
        `;
        document.body.appendChild(overlay);
        return overlay;
    },
    
    // Connect to WebSocket server
    connect: function() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }
        
        try {
            this.ws = new WebSocket(this.serverUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected to', this.serverUrl);
                this.connected = true;
                this.clearReconnectTimer();
                this.triggerCallbacks('onConnect');
                
                // Send initial handshake
                this.send({
                    type: 'client',
                    name: 'CLIFT Web'
                });
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.triggerCallbacks('onError', error);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.connected = false;
                this.triggerCallbacks('onDisconnect');
                this.scheduleReconnect();
            };
            
        } catch (e) {
            console.error('Failed to connect WebSocket:', e);
            this.scheduleReconnect();
        }
    },
    
    // Handle incoming messages
    handleMessage: function(data) {
        console.log('WebSocket message:', data);
        
        // CLIFT protocol: {player: 0|1, code: "...", executed: "...", active: true|false}
        if (data.code !== undefined) {
            this.displayCode(data);
        }
        
        // Handle other message types
        switch (data.type) {
            case 'ping':
                this.send({ type: 'pong' });
                break;
                
            case 'scene_change':
                // Could trigger scene changes in web version
                break;
                
            case 'effect_change':
                // Could trigger effect changes
                break;
        }
        
        this.triggerCallbacks('onMessage', data);
    },
    
    // Display code overlay
    displayCode: function(data) {
        if (!this.overlayElement) return;
        
        if (data.active) {
            // Show overlay with code
            let content = '';
            
            // Add player/deck indicator
            if (data.player !== undefined) {
                content += `[DECK ${data.player === 0 ? 'A' : 'B'}]\n\n`;
            }
            
            // Add code
            if (data.code) {
                content += '// CODE:\n';
                content += data.code + '\n\n';
            }
            
            // Add execution result
            if (data.executed) {
                content += '// OUTPUT:\n';
                content += data.executed;
            }
            
            this.overlayElement.textContent = content;
            this.overlayElement.style.display = 'block';
            
            // Auto-hide after delay if specified
            if (data.duration) {
                setTimeout(() => {
                    this.overlayElement.style.display = 'none';
                }, data.duration);
            }
        } else {
            // Hide overlay
            this.overlayElement.style.display = 'none';
        }
    },
    
    // Send data to server
    send: function(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            return true;
        }
        console.warn('WebSocket not connected');
        return false;
    },
    
    // Send code for display
    sendCode: function(code, player = 0, executed = '') {
        return this.send({
            player: player,
            code: code,
            executed: executed,
            active: true
        });
    },
    
    // Hide code overlay
    hideCode: function() {
        return this.send({
            active: false
        });
    },
    
    // Disconnect from server
    disconnect: function() {
        this.clearReconnectTimer();
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.connected = false;
    },
    
    // Auto-reconnect logic
    scheduleReconnect: function() {
        this.clearReconnectTimer();
        
        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            this.connect();
        }, this.reconnectInterval);
    },
    
    clearReconnectTimer: function() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    },
    
    // Event handling
    on: function(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    },
    
    off: function(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    },
    
    triggerCallbacks: function(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('Callback error:', e);
                }
            });
        }
    },
    
    // Status check
    isConnected: function() {
        return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
    },
    
    // Set custom server URL
    setServerUrl: function(url) {
        this.serverUrl = url;
        
        // Reconnect if already connected
        if (this.connected) {
            this.disconnect();
            this.connect();
        }
    }
};

// Integration with CLIFT engine
window.CLIFTWebSocket.Integration = {
    // Sync scene changes
    syncSceneChange: function(engine, deckIndex) {
        const deck = engine.decks[deckIndex];
        CLIFTWebSocket.send({
            type: 'scene_change',
            deck: deckIndex,
            scene: deck.scene,
            category: deck.category
        });
    },
    
    // Sync effect changes
    syncEffectChange: function(engine) {
        CLIFTWebSocket.send({
            type: 'effect_change',
            effect: engine.currentEffect,
            name: engine.effects[engine.currentEffect]
        });
    },
    
    // Sync BPM changes
    syncBPMChange: function(engine) {
        CLIFTWebSocket.send({
            type: 'bpm_change',
            bpm: engine.bpm
        });
    },
    
    // Live code execution example
    executeCode: function(code, deckIndex = 0) {
        try {
            // Create sandboxed context for code execution
            const context = {
                deck: deckIndex,
                time: Date.now(),
                Math: Math,
                console: {
                    log: (msg) => {
                        output += msg + '\n';
                        return msg;
                    }
                }
            };
            
            let output = '';
            
            // Execute code in limited scope
            const func = new Function('context', `
                with (context) {
                    ${code}
                }
            `);
            
            const result = func(context);
            
            // Send to display
            CLIFTWebSocket.sendCode(code, deckIndex, output || String(result));
            
            return { success: true, output: output || result };
        } catch (e) {
            const error = `Error: ${e.message}`;
            CLIFTWebSocket.sendCode(code, deckIndex, error);
            return { success: false, error: error };
        }
    }
};