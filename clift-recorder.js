// CLIFT Web Recorder - Advanced Video Recording
// Captures ASCII display as video with proper formatting

window.CLIFTRecorder = {
    mediaRecorder: null,
    recordedChunks: [],
    canvas: null,
    ctx: null,
    isRecording: false,
    recordingStartTime: 0,
    frameCount: 0,
    
    // Recording settings
    settings: {
        width: 1920,
        height: 1080,
        fontSize: 16,
        fontFamily: 'Courier New, monospace',
        textColor: '#0f0',
        backgroundColor: '#000',
        lineHeight: 1.2,
        letterSpacing: 2,
        padding: 40,
        quality: 0.9,
        frameRate: 30
    },
    
    // Initialize recorder
    init: function(cliftEngine) {
        this.engine = cliftEngine;
        this.createCanvas();
        return this;
    },
    
    // Create offscreen canvas for recording
    createCanvas: function() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.settings.width;
        this.canvas.height = this.settings.height;
        this.ctx = this.canvas.getContext('2d');
        
        // Set default styles
        this.ctx.font = `${this.settings.fontSize}px ${this.settings.fontFamily}`;
        this.ctx.textBaseline = 'top';
    },
    
    // Start recording
    start: async function() {
        if (this.isRecording) {
            console.warn('Recording already in progress');
            return false;
        }
        
        try {
            // Clear previous recording
            this.recordedChunks = [];
            this.frameCount = 0;
            this.recordingStartTime = Date.now();
            
            // Create stream from canvas
            const stream = this.canvas.captureStream(this.settings.frameRate);
            
            // Configure MediaRecorder
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000 // 5 Mbps
            };
            
            // Fallback for browsers that don't support VP9
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options.mimeType = 'video/webm';
                }
            }
            
            this.mediaRecorder = new MediaRecorder(stream, options);
            
            // Handle data available
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            // Handle recording stop
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            // Handle errors
            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                this.stop();
            };
            
            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            
            // Start render loop
            this.renderLoop();
            
            console.log('Recording started');
            return true;
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.isRecording = false;
            return false;
        }
    },
    
    // Stop recording
    stop: function() {
        if (!this.isRecording || !this.mediaRecorder) {
            console.warn('No recording in progress');
            return false;
        }
        
        this.isRecording = false;
        this.mediaRecorder.stop();
        console.log('Recording stopped');
        
        return true;
    },
    
    // Render loop for recording
    renderLoop: function() {
        if (!this.isRecording) return;
        
        // Render current frame
        this.renderFrame();
        this.frameCount++;
        
        // Continue loop
        requestAnimationFrame(() => this.renderLoop());
    },
    
    // Render single frame
    renderFrame: function() {
        const { ctx, settings } = this;
        const buffer = this.engine.outputBuffer;
        
        // Clear canvas
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, settings.width, settings.height);
        
        // Calculate text metrics
        const charWidth = ctx.measureText('M').width + settings.letterSpacing;
        const lineHeight = settings.fontSize * settings.lineHeight;
        
        // Calculate starting position to center the content
        const contentWidth = buffer[0].length * charWidth;
        const contentHeight = buffer.length * lineHeight;
        const startX = (settings.width - contentWidth) / 2;
        const startY = (settings.height - contentHeight) / 2;
        
        // Set text color
        ctx.fillStyle = settings.textColor;
        
        // Render each character
        for (let y = 0; y < buffer.length; y++) {
            for (let x = 0; x < buffer[y].length; x++) {
                const char = buffer[y][x];
                if (char && char !== ' ') {
                    const posX = startX + x * charWidth;
                    const posY = startY + y * lineHeight;
                    
                    // Add glow effect for certain characters
                    if (char === '@' || char === '#' || char === '*') {
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = settings.textColor;
                    } else {
                        ctx.shadowBlur = 0;
                    }
                    
                    ctx.fillText(char, posX, posY);
                }
            }
        }
        
        // Add recording indicator
        this.drawRecordingIndicator();
        
        // Add timestamp
        this.drawTimestamp();
        
        // Add audio visualization if enabled
        if (this.engine.audioEnabled && this.engine.audioData) {
            this.drawAudioVisualization();
        }
    },
    
    // Draw recording indicator
    drawRecordingIndicator: function() {
        const { ctx, settings } = this;
        const time = Date.now() - this.recordingStartTime;
        const blink = Math.floor(time / 500) % 2; // Blink every 500ms
        
        if (blink) {
            ctx.save();
            ctx.fillStyle = '#f00';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f00';
            ctx.beginPath();
            ctx.arc(settings.padding, settings.padding, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // REC text
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('REC', settings.padding + 20, settings.padding - 5);
            ctx.restore();
        }
    },
    
    // Draw timestamp
    drawTimestamp: function() {
        const { ctx, settings } = this;
        const time = Date.now() - this.recordingStartTime;
        const seconds = Math.floor(time / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const timestamp = [
            hours.toString().padStart(2, '0'),
            (minutes % 60).toString().padStart(2, '0'),
            (seconds % 60).toString().padStart(2, '0')
        ].join(':');
        
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(timestamp, settings.padding, settings.padding + 25);
        ctx.restore();
    },
    
    // Draw audio visualization overlay
    drawAudioVisualization: function() {
        const { ctx, settings } = this;
        const audioData = this.engine.audioData;
        const barWidth = 3;
        const barSpacing = 1;
        const maxBarHeight = 50;
        const startX = settings.width - 200;
        const startY = settings.padding;
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(startX - 10, startY - 10, 180, maxBarHeight + 20);
        
        // Audio bars
        for (let i = 0; i < Math.min(audioData.length, 32); i++) {
            const barHeight = audioData[i] * maxBarHeight;
            const x = startX + i * (barWidth + barSpacing);
            const y = startY + maxBarHeight - barHeight;
            
            // Gradient based on intensity
            const intensity = audioData[i];
            const hue = 120 - intensity * 60; // Green to yellow
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        }
        
        ctx.restore();
    },
    
    // Process completed recording
    processRecording: function() {
        if (this.recordedChunks.length === 0) {
            console.warn('No data recorded');
            return;
        }
        
        // Create blob from chunks
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        
        // Generate filename
        const now = new Date();
        const filename = `CLIFT_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.webm`;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        
        // Auto-download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        // Show stats
        const duration = (Date.now() - this.recordingStartTime) / 1000;
        const size = (blob.size / 1024 / 1024).toFixed(2);
        const fps = (this.frameCount / duration).toFixed(1);
        
        console.log(`Recording saved: ${filename}`);
        console.log(`Duration: ${duration.toFixed(1)}s, Size: ${size}MB, FPS: ${fps}`);
        
        // Reset
        this.recordedChunks = [];
        this.frameCount = 0;
    },
    
    // Get recording status
    getStatus: function() {
        return {
            isRecording: this.isRecording,
            duration: this.isRecording ? (Date.now() - this.recordingStartTime) / 1000 : 0,
            frameCount: this.frameCount,
            fps: this.frameCount / ((Date.now() - this.recordingStartTime) / 1000) || 0
        };
    },
    
    // Update settings
    updateSettings: function(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Update canvas size if needed
        if (newSettings.width || newSettings.height) {
            this.canvas.width = this.settings.width;
            this.canvas.height = this.settings.height;
        }
        
        // Update font
        this.ctx.font = `${this.settings.fontSize}px ${this.settings.fontFamily}`;
    }
};