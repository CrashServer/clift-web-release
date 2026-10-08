// Experimental render modes. These draw the mixed ASCII output onto a 2D canvas
// in other styles (surfaces, particles, splines, ...). The methods are mixed into
// CLIFTEngine.prototype and read this.outputBuffer / this.outputColorBuffer /
// this.width / this.height and draw on this.modeCanvas.

(function () {
    // Perceived "weight" of a glyph, used as height / size / depth.
    const CHAR_INTENSITY = {
        '.': 0.1, ',': 0.1, '`': 0.1, "'": 0.1,
        '-': 0.2, '_': 0.2, '~': 0.2,
        ':': 0.3, ';': 0.3, '!': 0.3, '|': 0.3,
        '+': 0.4, '=': 0.4, 'i': 0.4, 'l': 0.4,
        'o': 0.5, 'O': 0.5, '0': 0.5, 'c': 0.5,
        'x': 0.6, 'X': 0.6, '*': 0.6, '%': 0.6,
        '#': 0.7, '&': 0.7, '@': 0.7,
        '█': 1.0, '▉': 0.9, '▊': 0.8, '▋': 0.7, '▌': 0.5, '▍': 0.5, '▎': 0.4, '▏': 0.3,
        '▓': 0.8, '▒': 0.6, '░': 0.4,
        '▀': 0.5, '▄': 0.5, '▐': 0.5
    };

    // name -> method; index 0 (ASCII) is the regular renderer in engine.js.
    CLIFT.renderModes = [
        { name: 'ASCII', method: null },
        { name: 'Surface', method: 'renderSurfaceMode' },
        { name: 'Mesh', method: 'renderMeshMode' },
        { name: 'Particles', method: 'renderParticleMode' },
        { name: 'Lines', method: 'renderLineMode' },
        { name: 'Dots', method: 'renderDotMode' },
        { name: 'Waves', method: 'renderWaveMode' },
        { name: 'Plasma', method: 'renderPlasmaMode' },
        { name: 'Datamosh', method: 'renderMatrixMode' },
        { name: '3D ASCII', method: 'render3DMode' },
        { name: '3D City', method: 'render3DCityMode' },
        { name: 'Spline', method: 'renderSplineMode' },
        { name: 'Terminal', method: 'renderTerminalOverlay' }
    ];

    CLIFT.renderModeMethods = {
        getCharacterIntensity(char) {
            return CHAR_INTENSITY[char] || 0.5;
        },

        getCharacterSurfaceType(char) {
            // Map characters to surface types for different rendering styles
            if ('█▉▊▋▌▍▎▏▓▒░'.includes(char)) return 'solid';
            if ('*%#@&'.includes(char)) return 'rough';
            if ('~-_='.includes(char)) return 'wave';
            if ('|!:;'.includes(char)) return 'line';
            if ('oO0c'.includes(char)) return 'sphere';
            if ('+xX'.includes(char)) return 'cross';
            return 'basic';
        },

        renderSurfaceElement(ctx, x, y, intensity, surfaceType, color, cellWidth, cellHeight) {
            const centerX = x * cellWidth + cellWidth / 2;
            const centerY = y * cellHeight + cellHeight / 2;
        
            const { r, g, b } = this.parseColor(color);
        
            // Apply lighting based on intensity and position
            const lightIntensity = this.calculateLighting(x, y, intensity);
            const finalR = Math.min(255, r * lightIntensity);
            const finalG = Math.min(255, g * lightIntensity);
            const finalB = Math.min(255, b * lightIntensity);
        
            ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`;
        
            // Render based on surface type
            switch (surfaceType) {
                case 'solid':
                    this.renderSolidSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                    break;
                case 'rough':
                    this.renderRoughSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                    break;
                case 'wave':
                    this.renderWaveSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                    break;
                case 'line':
                    this.renderLineSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                    break;
                case 'sphere':
                    this.renderSphereSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                    break;
                case 'cross':
                    this.renderCrossSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                    break;
                default:
                    this.renderBasicSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
            }
        },

        calculateLighting(x, y, intensity) {
            // Simple lighting calculation with moving light source
            const time = performance.now() * 0.001;
            const lightX = this.width / 2 + Math.sin(time * 0.5) * this.width * 0.3;
            const lightY = this.height / 2 + Math.cos(time * 0.7) * this.height * 0.3;
        
            const distance = Math.sqrt((x - lightX) ** 2 + (y - lightY) ** 2);
            const maxDistance = Math.sqrt(this.width ** 2 + this.height ** 2);
            const distanceFactor = 1 - (distance / maxDistance);
        
            // Combine distance lighting with surface height
            const baseLighting = 0.3 + distanceFactor * 0.4;
            const heightLighting = intensity * 0.5;
        
            return Math.min(1.5, baseLighting + heightLighting);
        },

        parseColor(color) {
            // Enhanced color parsing with fallbacks
            const [r, g, b] = CLIFT.palette.rgb(color);
            return { r, g, b };
        },

        renderSolidSurface(ctx, x, y, intensity, w, h) {
            const size = Math.max(2, intensity * Math.min(w, h));
            ctx.fillRect(x - size/2, y - size/2, size, size);
        },

        renderRoughSurface(ctx, x, y, intensity, w, h) {
            const size = intensity * Math.min(w, h) * 0.8;
            for (let i = 0; i < 4; i++) {
                const offsetX = (Math.random() - 0.5) * size * 0.5;
                const offsetY = (Math.random() - 0.5) * size * 0.5;
                const dotSize = size * (0.2 + Math.random() * 0.3);
                ctx.fillRect(x + offsetX - dotSize/2, y + offsetY - dotSize/2, dotSize, dotSize);
            }
        },

        renderWaveSurface(ctx, x, y, intensity, w, h) {
            const time = performance.now() * 0.002;
            const waveHeight = intensity * h * 0.5;
            const waveY = y + Math.sin(x * 0.1 + time) * waveHeight;
            ctx.fillRect(x - w*0.4, waveY - 1, w*0.8, 2);
        },

        renderLineSurface(ctx, x, y, intensity, w, h) {
            const lineHeight = intensity * h;
            ctx.fillRect(x - 1, y - lineHeight/2, 2, lineHeight);
        },

        renderSphereSurface(ctx, x, y, intensity, w, h) {
            const radius = intensity * Math.min(w, h) * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        },

        renderCrossSurface(ctx, x, y, intensity, w, h) {
            const size = intensity * Math.min(w, h) * 0.6;
            ctx.fillRect(x - size/2, y - 1, size, 2);
            ctx.fillRect(x - 1, y - size/2, 2, size);
        },

        renderBasicSurface(ctx, x, y, intensity, w, h) {
            const size = intensity * Math.min(w, h) * 0.6;
            ctx.fillRect(x - size/2, y - size/2, size, size);
        },

        renderSurfaceMode(ctx, cellWidth, cellHeight) {
            // Original surface rendering mode
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y][x];
                    const color = this.outputColorBuffer[y][x];
                
                    if (char && char !== ' ') {
                        const intensity = this.getCharacterIntensity(char);
                        const surfaceType = this.getCharacterSurfaceType(char);
                        this.renderSurfaceElement(ctx, x, y, intensity, surfaceType, color, cellWidth, cellHeight);
                    }
                }
            }
        },

        renderMeshMode(ctx, cellWidth, cellHeight, time) {
            ctx.lineWidth = 1;
        
            // Create wireframe mesh from ASCII data
            for (let y = 0; y < this.height - 1; y++) {
                for (let x = 0; x < this.width - 1; x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ') {
                        const intensity = this.getCharacterIntensity(char);
                        const color = this.outputColorBuffer[y][x];
                        const { r, g, b } = this.parseColor(color);
                    
                        // Create mesh vertices based on intensity
                        const x1 = x * cellWidth;
                        const y1 = y * cellHeight + intensity * 20;
                        const x2 = (x + 1) * cellWidth;
                        const y2 = y * cellHeight + intensity * 20;
                        const x3 = x * cellWidth;
                        const y3 = (y + 1) * cellHeight + intensity * 20;
                        const x4 = (x + 1) * cellWidth;
                        const y4 = (y + 1) * cellHeight + intensity * 20;
                    
                        // Animate mesh with wave motion
                        const wave = Math.sin(time * 2 + x * 0.1 + y * 0.1) * 5;
                    
                        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1 + wave);
                        ctx.lineTo(x2, y2 + wave);
                        ctx.lineTo(x4, y4 + wave);
                        ctx.lineTo(x3, y3 + wave);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
        },

        renderParticleMode(ctx, cellWidth, cellHeight, time) {
            // Optimized particle system with trails - fewer particles but with trails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Slower fade for longer trails
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
            // Initialize fast particles if needed
            if (!this.fastParticles) {
                this.fastParticles = [];
            }
        
            // Spawn new particles from the ASCII scene, within the particle budget
            let budget = 400 - this.fastParticles.length;
            for (let y = 0; y < this.height && budget > 0; y++) {
                for (let x = 0; x < this.width && budget > 0; x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ' && Math.random() < 0.15) { // Lower spawn rate for fewer particles
                        budget--;
                        const intensity = this.getCharacterIntensity(char);
                        const color = this.outputColorBuffer[y][x];
                    
                        const { r, g, b } = this.parseColor(color);
                    
                        // Create particle with trail tracking
                        this.fastParticles.push({
                            x: x * cellWidth + Math.random() * cellWidth,
                            y: y * cellHeight + Math.random() * cellHeight,
                            // Faster velocities to maintain scene shape recognition
                            vx: (Math.random() - 0.5) * 35,
                            vy: (Math.random() - 0.5) * 35,
                            life: 0.5 + Math.random() * 0.4, // Longer life for trails (0.5-0.9 seconds)
                            maxLife: 0.5 + Math.random() * 0.4,
                            size: 1 + intensity * 2,
                            char: char,
                            r, g, b,
                            // Trail tracking
                            trail: [], // Store previous positions
                            trailLength: 8 + Math.floor(intensity * 6) // Trail length based on intensity
                        });
                    }
                }
            }
        
            // Update and render particles with trails
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let currentFont = '';
            for (let i = this.fastParticles.length - 1; i >= 0; i--) {
                const p = this.fastParticles[i];
            
                // Store current position in trail before updating
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > p.trailLength) {
                    p.trail.shift(); // Remove oldest trail point
                }
            
                // Update position with fast movement
                p.x += p.vx;
                p.y += p.vy;
            
                // Add gravity and air resistance for more natural movement
                p.vy += 0.4; // Slightly less gravity for longer airtime
                p.vx *= 0.985; // Less air resistance for smoother trails
                p.vy *= 0.985;
            
                // Decrease life to maintain scene shape but allow for trails
                p.life -= 0.018; // Slightly slower decay for trail visibility
            
                // Remove dead particles or those off-screen
                if (p.life <= 0 || p.x < -50 || p.x > ctx.canvas.width + 50 || 
                    p.y < -50 || p.y > ctx.canvas.height + 50) {
                    this.fastParticles.splice(i, 1);
                    continue;
                }
            
                // Render trail first (behind particle), as one faded polyline
                if (p.trail.length > 1) {
                    const trailAlpha = (p.life / p.maxLife) * 0.35;
                    if (trailAlpha > 0.05) {
                        ctx.strokeStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${trailAlpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p.trail[0].x, p.trail[0].y);
                        for (let t = 1; t < p.trail.length; t++) ctx.lineTo(p.trail[t].x, p.trail[t].y);
                        ctx.stroke();
                    }
                }
            
                // Render main particle as its character
                const alpha = Math.min(1, p.life / p.maxLife);
                const size = p.size * alpha;
                const font = `${Math.max(1, Math.round(size * 8))}px monospace`;
                if (font !== currentFont) {
                    ctx.font = font;
                    currentFont = font;
                }
                ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
                ctx.fillText(p.char, p.x, p.y);
            
                // Also render as a small dot for extra density
                ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        
            // Reset text alignment
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
        },

        renderLineMode(ctx, cellWidth, cellHeight, time) {
            ctx.lineWidth = 2;
        
            // Create flowing lines from ASCII data
            for (let y = 0; y < this.height; y++) {
                ctx.beginPath();
                let started = false;
            
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ') {
                        const intensity = this.getCharacterIntensity(char);
                        const color = this.outputColorBuffer[y][x];
                        const { r, g, b } = this.parseColor(color);
                    
                        const xPos = x * cellWidth;
                        const yPos = y * cellHeight + Math.sin(time * 3 + x * 0.2) * intensity * 10;
                    
                        if (!started) {
                            ctx.moveTo(xPos, yPos);
                            started = true;
                        } else {
                            ctx.lineTo(xPos, yPos);
                        }
                    
                        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                    }
                }
                if (started) {
                    ctx.stroke();
                }
            }
        },

        renderDotMode(ctx, cellWidth, cellHeight, time) {
            // Pulsating dots based on ASCII data
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ') {
                        const intensity = this.getCharacterIntensity(char);
                        const color = this.outputColorBuffer[y][x];
                        const { r, g, b } = this.parseColor(color);
                    
                        const pulse = Math.sin(time * 4 + x * 0.5 + y * 0.3) * 0.5 + 0.5;
                        const size = intensity * 8 * (0.5 + pulse * 0.5);
                    
                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        ctx.beginPath();
                        ctx.arc(x * cellWidth + cellWidth/2, y * cellHeight + cellHeight/2, size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        },

        renderWaveMode(ctx, cellWidth, cellHeight, time) {
            ctx.lineWidth = 2;
        
            // Create wave interference patterns
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ') {
                        const intensity = this.getCharacterIntensity(char);
                        const color = this.outputColorBuffer[y][x];
                        const { r, g, b } = this.parseColor(color);
                    
                        // Create ripple effects
                        const centerX = x * cellWidth + cellWidth/2;
                        const centerY = y * cellHeight + cellHeight/2;
                        const maxRadius = intensity * 40 + 10;
                    
                        // Create expanding rings
                        for (let i = 1; i <= 4; i++) {
                            const wavePhase = (time * 60 + i * 15) % 120;
                            const waveRadius = (wavePhase / 120) * maxRadius;
                            const alpha = Math.max(0, 1 - (wavePhase / 120)) * intensity;
                        
                            if (alpha > 0.1 && waveRadius > 2) {
                                ctx.globalAlpha = alpha;
                                ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                                ctx.beginPath();
                                ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                        }
                        ctx.globalAlpha = 1.0; // Reset alpha
                    }
                }
            }
        },

        renderPlasmaMode(ctx, cellWidth, cellHeight, time) {
            // Optimized plasma - render at lower resolution and scale up
            const scale = 4; // Render at 1/4 resolution for speed
            const lowWidth = Math.floor(this.modeCanvas.width / scale);
            const lowHeight = Math.floor(this.modeCanvas.height / scale);
        
            // Create a smaller canvas for plasma calculation
            const plasmaData = ctx.createImageData(lowWidth, lowHeight);
            const data = plasmaData.data;
        
            for (let y = 0; y < lowHeight; y++) {
                for (let x = 0; x < lowWidth; x++) {
                    // Get corresponding ASCII character
                    const asciiX = Math.floor((x * scale) / cellWidth);
                    const asciiY = Math.floor((y * scale) / cellHeight);
                    const char = this.outputBuffer[asciiY] && this.outputBuffer[asciiY][asciiX] || ' ';
                    const intensity = char !== ' ' ? this.getCharacterIntensity(char) : 0.1;
                
                    // Generate plasma pattern (optimized)
                    const plasma1 = Math.sin(x * 0.4 + time * 2);
                    const plasma2 = Math.sin(y * 0.2 + time * 1.5);
                    const plasma3 = Math.sin((x + y) * 0.3 + time);
                    const plasma4 = Math.sin(Math.sqrt(x*x + y*y) * 0.5 + time * 0.8);
                
                    const plasma = (plasma1 + plasma2 + plasma3 + plasma4) * 0.25;
                    const modulated = plasma * intensity * 2;
                
                    const pixelIndex = (y * lowWidth + x) * 4;
                    data[pixelIndex] = Math.floor((Math.sin(modulated * Math.PI) + 1) * 127); // Red
                    data[pixelIndex + 1] = Math.floor((Math.sin(modulated * Math.PI + 2.1) + 1) * 127); // Green
                    data[pixelIndex + 2] = Math.floor((Math.sin(modulated * Math.PI + 4.2) + 1) * 127); // Blue
                    data[pixelIndex + 3] = 255; // Alpha
                }
            }
        
            // Draw the low-res plasma to a temporary canvas and scale it up
            if (!this.plasmaCanvas) this.plasmaCanvas = document.createElement('canvas');
            const tempCanvas = this.plasmaCanvas;
            if (tempCanvas.width !== lowWidth || tempCanvas.height !== lowHeight) {
                tempCanvas.width = lowWidth;
                tempCanvas.height = lowHeight;
            }
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(plasmaData, 0, 0);
        
            // Scale up the plasma to full resolution with smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(tempCanvas, 0, 0, lowWidth, lowHeight, 0, 0, this.modeCanvas.width, this.modeCanvas.height);
        },

        render3DMode(ctx, cellWidth, cellHeight, time) {
            const canvas = this.modeCanvas;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
        
            // Create array to store 3D points with characters
            const points3D = [];
        
            // Process each character and assign Z-depth based on intensity
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y] && this.outputBuffer[y][x] || ' ';
                    if (char !== ' ') {
                        const intensity = this.getCharacterIntensity(char);
                    
                        // Convert 2D position to 3D coordinates
                        const x3d = (x - this.width / 2) * cellWidth;
                        const y3d = (y - this.height / 2) * cellHeight;
                        const z3d = intensity * 200 + Math.sin(time + x * 0.1 + y * 0.1) * 50; // Z-depth based on character intensity + animation
                    
                        points3D.push({
                            x: x3d,
                            y: y3d,
                            z: z3d,
                            char: char,
                            intensity: intensity,
                            screenX: 0,
                            screenY: 0,
                            visible: true
                        });
                    }
                }
            }
        
            // Performance optimization: limit processing for dense grids
            const maxPoints = 300; // Limit total points to maintain performance
            if (points3D.length > maxPoints) {
                // Keep only high-intensity characters for dense scenes
                points3D.sort((a, b) => b.intensity - a.intensity);
                points3D.length = maxPoints;
            }
        
            // Simple 3D projection (perspective)
            const focalLength = 400;
            const cameraZ = 300;
        
            points3D.forEach(point => {
                const distance = cameraZ + point.z;
                if (distance > 0) {
                    point.screenX = centerX + (point.x * focalLength) / distance;
                    point.screenY = centerY + (point.y * focalLength) / distance;
                    point.visible = true;
                } else {
                    point.visible = false;
                }
            });
        
            // Sort points by Z-depth (back to front for proper rendering)
            points3D.sort((a, b) => a.z - b.z);
        
            // Optimized line connections: use spatial partitioning for performance
            const maxConnections = 200; // Limit total connections
            let connectionCount = 0;
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.lineWidth = 1;
        
            // Only check every nth point for connections to reduce O(n²) complexity
            const checkEvery = Math.max(1, Math.floor(points3D.length / 50));
        
            for (let i = 0; i < points3D.length && connectionCount < maxConnections; i += checkEvery) {
                const pointA = points3D[i];
                if (!pointA.visible) continue;
            
                // Only check nearby points (limited range)
                const searchRange = Math.min(20, points3D.length - i);
                for (let j = i + 1; j < i + searchRange && connectionCount < maxConnections; j++) {
                    const pointB = points3D[j];
                    if (!pointB.visible) continue;
                
                    // Quick 2D screen distance check before 3D calculation
                    const screenDx = pointA.screenX - pointB.screenX;
                    const screenDy = pointA.screenY - pointB.screenY;
                    const screenDist = screenDx * screenDx + screenDy * screenDy;
                
                    if (screenDist < 10000) { // 100px screen distance
                        // Calculate 3D distance only if screen distance is reasonable
                        const dx = pointA.x - pointB.x;
                        const dy = pointA.y - pointB.y;
                        const dz = pointA.z - pointB.z;
                        const distance3D = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                        // Only connect points that are close enough
                        if (distance3D < 120) { // Reduced from 150 for better performance
                            const alpha = Math.max(0, 1 - distance3D / 120) * 0.4;
                            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                        
                            ctx.beginPath();
                            ctx.moveTo(pointA.screenX, pointA.screenY);
                            ctx.lineTo(pointB.screenX, pointB.screenY);
                            ctx.stroke();
                            connectionCount++;
                        }
                    }
                }
            }
        
            // Draw the character points
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
        
            points3D.forEach(point => {
                if (!point.visible) return;
            
                // Color based on Z-depth and character intensity
                const depthFactor = Math.max(0.2, 1 - (point.z / 400));
                const red = Math.floor(255 * point.intensity * depthFactor);
                const green = Math.floor(128 * depthFactor);
                const blue = Math.floor(255 * depthFactor);
            
                ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                ctx.fillText(point.char, point.screenX, point.screenY);
            });
        },

        render3DCityMode(ctx, cellWidth, cellHeight, time) {
            // Dark black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
            // Much faster scrolling parameters
            const scrollSpeed = time * 80; // Much faster movement
            const cityWidth = cellWidth * 1.2; // Building width based on cell size
            const groundLevel = ctx.canvas.height * 0.8; // Lower ground level
        
            // Create seamless scrolling by drawing multiple screen widths
            const totalWidth = ctx.canvas.width + cityWidth * 2;
            const startX = -(scrollSpeed % cityWidth);
        
            // First render the ASCII scene in the sky area for visibility
            ctx.font = `${Math.min(cellWidth, cellHeight) * 0.6}px monospace`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'rgba(200, 200, 200, 0.8)'; // Light gray for contrast
        
            for (let y = 0; y < Math.min(this.height, Math.floor(groundLevel / cellHeight) - 2); y++) {
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ') {
                        const screenX = x * cellWidth;
                        const screenY = y * cellHeight;
                        ctx.fillText(char, screenX, screenY);
                    }
                }
            }
        
            // Create buildings directly from ASCII scene data
            for (let x = 0; x < ctx.canvas.width; x += cityWidth) {
                // Map to buffer coordinates for building data
                const bufferX = Math.floor((x + scrollSpeed) / cityWidth) % this.width;
            
                // Create building column from ASCII data
                let columnData = [];
                for (let y = 0; y < this.height; y++) {
                    const char = this.outputBuffer[y][bufferX];
                    if (char && char !== ' ') {
                        columnData.push({
                            char: char,
                            intensity: this.getCharacterIntensity(char),
                            y: y
                        });
                    }
                }
            
                // Sort by intensity for building hierarchy
                columnData.sort((a, b) => b.intensity - a.intensity);
            
                // Create buildings from sorted data
                let currentHeight = groundLevel;
                for (let i = 0; i < Math.min(columnData.length, 5); i++) { // Max 5 buildings per column
                    const data = columnData[i];
                    const buildingHeight = data.intensity * 150 + 20; // Base height on character intensity
                    const buildingY = currentHeight - buildingHeight;
                
                    // Building width varies by character type
                    let buildingWidth = cityWidth * 0.8;
                    if ('█▉▊▋▌▍▎▏▓▒░'.includes(data.char)) {
                        buildingWidth = cityWidth * 1.0; // Wide buildings for block chars
                    } else if ('|!:;'.includes(data.char)) {
                        buildingWidth = cityWidth * 0.4; // Narrow buildings for line chars
                    } else if ('*%#@&'.includes(data.char)) {
                        buildingWidth = cityWidth * 0.6; // Medium buildings for complex chars
                    }
                
                    // Only draw if building is visible
                    if (x > -cityWidth && x < ctx.canvas.width + cityWidth) {
                        // Building silhouette in white/gray
                        const brightness = Math.floor(100 + data.intensity * 155);
                        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                        ctx.fillRect(x, buildingY, buildingWidth, buildingHeight);
                    
                        // Add character detail on building
                        ctx.fillStyle = '#000'; // Black text on white building
                        ctx.font = `${Math.min(buildingWidth * 0.8, buildingHeight * 0.3)}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(data.char, x + buildingWidth/2, buildingY + buildingHeight/2);
                    
                        // Building outline for definition
                        ctx.strokeStyle = '#666';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x, buildingY, buildingWidth, buildingHeight);
                    
                        // Windows for tall buildings
                        if (buildingHeight > 60) {
                            ctx.fillStyle = '#333';
                            const floors = Math.floor(buildingHeight / 20);
                            for (let floor = 1; floor < floors; floor++) {
                                const windowY = buildingY + floor * 20;
                                const windowWidth = Math.max(2, buildingWidth * 0.1);
                                const windowSpacing = buildingWidth / 4;
                            
                                for (let w = 1; w <= 3; w++) {
                                    const windowX = x + w * windowSpacing - windowWidth/2;
                                    ctx.fillRect(windowX, windowY - 3, windowWidth, 6);
                                }
                            }
                        }
                    }
                
                    currentHeight = buildingY; // Stack buildings vertically
                    if (currentHeight < 50) break; // Don't go too high
                }
            }
        
            // Draw ground plane in dark gray
            ctx.fillStyle = '#111';
            ctx.fillRect(0, groundLevel, ctx.canvas.width, ctx.canvas.height - groundLevel);
        
            // Reset text alignment after building rendering
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
        },

        renderSplineMode(ctx, cellWidth, cellHeight, time) {
            // Network rendering - clean splines connecting ASCII characters as nodes
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
            // Collect nodes from ASCII buffer
            const nodes = [];
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y][x];
                    if (!char || char === ' ') continue;
                
                    const intensity = this.getCharacterIntensity(char);
                    nodes.push({
                        x: x * cellWidth + cellWidth/2,
                        y: y * cellHeight + cellHeight/2,
                        intensity: intensity,
                        char: char,
                        id: y * this.width + x
                    });
                }
            }
        
            if (nodes.length < 2) return;
        
            // Faster spline connections - simplified logic
            const connections = [];
            const maxDistance = Math.min(cellWidth, cellHeight) * 6; // Smaller radius for performance
            const maxConnections = 300; // More connections but simpler logic
            const connectionPhase = Math.floor(time * 0.5) % 3; // Faster changes, fewer phases
        
            for (let i = 0; i < nodes.length && connections.length < maxConnections; i += 2) { // Skip every other node for performance
                const nodeA = nodes[i];
            
                // Simplified connection logic - just find nearby nodes quickly
                for (let j = i + 1; j < nodes.length && connections.length < maxConnections; j++) {
                    const nodeB = nodes[j];
                    const distance = Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
                
                    if (distance < maxDistance) {
                        // Simple connection criteria based on phase
                        let shouldConnect = false;
                        switch(connectionPhase) {
                            case 0: // Close connections
                                shouldConnect = distance < maxDistance * 0.6;
                                break;
                            case 1: // Medium connections
                                shouldConnect = distance > maxDistance * 0.3 && distance < maxDistance * 0.8;
                                break;
                            case 2: // All valid connections
                                shouldConnect = true;
                                break;
                        }
                    
                        if (shouldConnect) {
                            const strength = (nodeA.intensity + nodeB.intensity) / 2 * (1 - distance / maxDistance);
                            if (strength > 0.2) { // Lower threshold for more connections
                                connections.push({
                                    from: nodeA,
                                    to: nodeB,
                                    strength: strength,
                                    distance: distance
                                });
                            }
                        }
                    }
                }
            }
        
            // Draw connections as splines
            connections.forEach(connection => {
                const { from, to, strength } = connection;
            
                // Connection color based on strength and time
                const hue = (strength * 240 + time * 30) % 360; // Blue to red spectrum
                const alpha = strength * 0.8 + 0.2;
                // More variation in line thickness based on strength and character types
                const baseWidth = strength * 3 + 0.5;
                const thicknessVariation = (from.intensity + to.intensity) / 2;
                const lineWidth = baseWidth * (0.5 + thicknessVariation * 1.5);
            
                ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${alpha})`;
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
            
                // Draw smooth curve between nodes
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
            
                // Add slight curve for more organic feel
                const offset = Math.sin(time + from.id * 0.1) * 20;
                const controlX = midX + offset;
                const controlY = midY - offset;
            
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.quadraticCurveTo(controlX, controlY, to.x, to.y);
                ctx.stroke();
            
                // Animated data flow along connections
                const flowPos = (time * 0.5 + connection.distance * 0.01) % 1;
                const flowX = from.x + (to.x - from.x) * flowPos;
                const flowY = from.y + (to.y - from.y) * flowPos;
            
                ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.8)`;
                ctx.beginPath();
                ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        
            // Draw network nodes
            nodes.forEach(node => {
                const size = 2 + node.intensity * 6;
                const brightness = 40 + node.intensity * 60;
            
                // Node color based on intensity
                const nodeColor = `rgb(${brightness}, ${brightness + 50}, ${brightness + 100})`;
            
                // Node glow (soft halo, much cheaper than a gradient per node)
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            
                // Core node
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
        
            // Add subtle grid background for network feel
            ctx.strokeStyle = 'rgba(0, 50, 100, 0.1)';
            ctx.lineWidth = 0.5;
            const gridSpacing = 50;
        
            ctx.beginPath();
            for (let x = 0; x < ctx.canvas.width; x += gridSpacing) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, ctx.canvas.height);
            }
            for (let y = 0; y < ctx.canvas.height; y += gridSpacing) {
                ctx.moveTo(0, y);
                ctx.lineTo(ctx.canvas.width, y);
            }
            ctx.stroke();
        },

        renderTerminalOverlay(ctx, cellWidth, cellHeight, time) {
            // First render the normal ASCII scene
            this.renderASCII(ctx, cellWidth, cellHeight);
        
            // Then overlay terminal boot sequence as effect
            const fontSize = 12; // Smaller overlay text
            ctx.font = `${fontSize}px monospace`;
            ctx.textBaseline = 'top';
            const lineHeight = fontSize + 2;
        
            // Extended boot messages
            const bootMessages = [
                '[ OK ] Started Update UTMP about System Runlevel Changes',
                '[ OK ] Started Load/Save Random Seed', 
                '[ OK ] Started Network Manager Wait Online',
                '[ OK ] Reached target Network is Online',
                '[ OK ] Started OpenSSH Daemon',
                '[ OK ] Started D-Bus System Message Bus',
                '[INFO] Loading kernel modules...',
                '[INFO] Mounting filesystems...',
                '[INFO] Starting system services...',
                '[INFO] Loading ASCII VJ Engine...',
                '[INFO] Initializing audio subsystem...',
                '[INFO] Mounting visualization drivers...',
                '[INFO] Loading scene database...',
                '[INFO] Starting network interfaces...',
                '[INFO] Configuring display adapters...',
                '[ OK ] Started CLIFT ASCII VJ Service',
                '[ OK ] Started Audio Reactive Engine',
                '[ OK ] Started PostFX Pipeline',
                '[INFO] Entering VJ mode...',
                '[INFO] System ready for performance',
                '[ OK ] All systems operational',
                '[INFO] Monitoring performance metrics...',
                '[INFO] Processing audio input...',
                '[INFO] Rendering ASCII scenes...',
                '[INFO] Applying visual effects...',
                '[WARN] High CPU usage detected',
                '[INFO] Optimizing frame rate...',
                '[ OK ] Performance stabilized',
                '[INFO] Scene transition initiated...',
                '[INFO] Crossfader position changed',
                '[INFO] Effect parameters updated...',
                '[INFO] Beat detection active',
                '[INFO] BPM: 120 detected',
                '[INFO] Audio reactive mode enabled',
                '[INFO] Full auto mode engaged',
            ];
        
            // Fast scrolling boot sequence
            const scrollSpeed = time * 2.5; // Much faster
            const totalLines = Math.ceil(ctx.canvas.height / lineHeight) + 10;
        
            // Semi-transparent overlay background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
            // Terminal scan lines covering full screen
            for (let y = 0; y < ctx.canvas.height; y += 4) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.03)';
                ctx.fillRect(0, y, ctx.canvas.width, 1);
            }
        
            // Smooth infinite scrolling messages
            for (let i = 0; i < totalLines; i++) {
                // Smooth infinite loop without stuttering
                const scrollOffset = scrollSpeed % bootMessages.length;
                const messageIndex = Math.floor(scrollOffset + i * 0.3) % bootMessages.length;
                const message = bootMessages[messageIndex];
            
                // Smooth vertical position calculation
                const yPos = (i * lineHeight - (scrollSpeed * lineHeight * 0.5) % (totalLines * lineHeight));
            
                // Wrap around smoothly when reaching bottom
                let displayY = yPos;
                if (displayY > ctx.canvas.height) {
                    displayY = yPos - (totalLines * lineHeight);
                }
            
                if (displayY > -lineHeight && displayY < ctx.canvas.height + lineHeight) {
                    // Different colors for different message types
                    let color = 'rgba(0, 200, 0, 0.8)'; // Semi-transparent
                    if (message.includes('[ OK ]')) color = 'rgba(0, 255, 0, 0.9)';
                    if (message.includes('[INFO]')) color = 'rgba(0, 150, 255, 0.8)';
                    if (message.includes('[WARN]')) color = 'rgba(255, 200, 0, 0.8)';
                    if (message.includes('[ERROR]')) color = 'rgba(255, 100, 100, 0.8)';
                
                    // Distribute messages across screen width
                    const columnWidth = ctx.canvas.width / 3;
                    const column = i % 3;
                    const xPos = 10 + column * columnWidth;
                
                    ctx.fillStyle = color;
                    ctx.fillText(message.substring(0, 40), xPos, displayY); // Truncate if too long
                
                    // Add timestamp
                    const timestamp = String(Math.floor(scrollSpeed * 2 + i) / 10).padStart(6, '0');
                    ctx.fillStyle = 'rgba(100, 255, 100, 0.6)';
                    ctx.fillText(`[${timestamp}]`, ctx.canvas.width - 80, displayY);
                }
            }
        
            // Mix in actual ASCII scene data as system output
            const overlayStartY = ctx.canvas.height * 0.75;
            let overlayLine = 0;
        
            for (let y = 0; y < this.height && overlayLine < 4; y += 4) {
                let line = '';
                for (let x = 0; x < Math.min(this.width, 60); x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ') {
                        line += char;
                    }
                }
            
                if (line.trim().length > 3) {
                    const lineY = overlayStartY + overlayLine * lineHeight;
                    if (lineY < ctx.canvas.height - 20) {
                        // ASCII data as system debug output with transparency
                        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
                        const addr = (y * this.width).toString(16).padStart(6, '0').toUpperCase();
                        ctx.fillText(`[VJ_BUF] ${addr}: ${line.substring(0, 50)}`, 10, lineY);
                        overlayLine++;
                    }
                }
            }
        
            // System status overlay at bottom
            const statusBarY = ctx.canvas.height - 18;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, statusBarY, ctx.canvas.width, 18);
        
            // Status information
            const loadAvg = (Math.sin(time * 0.02) + 1) * 50;
            const memUsage = ((Math.sin(time * 0.01) + 1) * 30 + 40);
            const fps = Math.floor(28 + Math.sin(time * 0.03) * 6);
        
            ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
            ctx.font = `10px monospace`;
            ctx.fillText(`CLIFT VJ | Load: ${loadAvg.toFixed(1)}% | Mem: ${memUsage.toFixed(1)}% | FPS: ${fps} | Scene: ${CLIFT.catalog.name(this.decks[this.activeDeck].sceneId)} | Mode: Terminal`, 5, statusBarY + 6);
        
            // Blinking cursor
            const cursorTime = Math.floor(time * 3) % 2;
            if (cursorTime) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                ctx.fillRect(ctx.canvas.width - 10, statusBarY + 2, 6, 12);
            }
        
            // Subtle border
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        },

        renderASCII(ctx, cellWidth, cellHeight) {
            // Render the actual ASCII scene underneath
            ctx.font = `${Math.min(cellWidth, cellHeight)}px monospace`;
            ctx.textBaseline = 'top';
        
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const char = this.outputBuffer[y][x];
                    if (char && char !== ' ') {
                        const screenX = x * cellWidth;
                        const screenY = y * cellHeight;
                    
                        const { r, g, b } = this.parseColor(this.outputColorBuffer[y][x]);
                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        ctx.fillText(char, screenX, screenY);
                    }
                }
            }
        },

        renderMatrixMode(ctx, cellWidth, cellHeight, time) {
            // Lightweight datamoshing effect using simple canvas operations
        
            // First render the ASCII scene normally
            this.renderASCII(ctx, cellWidth, cellHeight);
        
            // Simple glitch effects based on scene content - much lighter on CPU
            const glitchPhase = Math.floor(time * 2) % 10; // changes twice per second
        
            if (glitchPhase < 2) { // Only glitch 20% of the time
                // Horizontal displacement based on ASCII content
                for (let y = 0; y < this.height; y++) {
                    let hasContent = false;
                    let totalIntensity = 0;
                
                    for (let x = 0; x < this.width; x++) {
                        const char = this.outputBuffer[y][x];
                        if (char && char !== ' ') {
                            hasContent = true;
                            totalIntensity += this.getCharacterIntensity(char);
                        }
                    }
                
                    if (hasContent) {
                        const avgIntensity = totalIntensity / this.width;
                        const displacement = Math.floor(Math.sin(time * 3 + y * 0.1) * avgIntensity * 15);
                    
                        if (Math.abs(displacement) > 2) {
                            const screenY = y * cellHeight;
                            const rowHeight = cellHeight;
                        
                            // Shift the row through a scratch canvas (no CPU readback)
                            const w = ctx.canvas.width;
                            const scratch = this.datamoshRow || (this.datamoshRow = document.createElement('canvas'));
                            if (scratch.width !== w || scratch.height !== Math.ceil(rowHeight)) {
                                scratch.width = w;
                                scratch.height = Math.ceil(rowHeight);
                            }
                            const sctx = scratch.getContext('2d');
                            sctx.clearRect(0, 0, scratch.width, scratch.height);
                            sctx.drawImage(ctx.canvas, 0, screenY, w, rowHeight, 0, 0, w, rowHeight);
                            ctx.clearRect(0, screenY, w, rowHeight);
                            ctx.drawImage(scratch, 0, 0, w, rowHeight, displacement, screenY, w, rowHeight);
                        }
                    }
                }
            }
        
            // Add simple RGB shift for high-intensity areas
            if (glitchPhase === 3) {
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
                ctx.fillRect(2, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
                ctx.fillRect(-1, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
                ctx.fillRect(1, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    };
})();
