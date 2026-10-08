// CLIFT scenes - category 16: Giger-Inspired

// ============================================
// CATEGORY 16: Giger-Inspired (160-169)
// ============================================

// Scene 160: Biomech Spine
CLIFTScenes[160] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Organic spine structures
    const spineX = Math.floor(width / 2);
    const spineWave = Math.sin(t * 2) * 3;
    
    for (let y = 0; y < height; y++) {
        const vertebra = Math.floor(y / 3);
        const audioMod = audio[vertebra % audio.length] || 0;
        const x = spineX + Math.floor(spineWave * Math.sin(y * 0.5));
        
        if (x >= 0 && x < width) {
            // Vertebrae
            buffer[y][x] = audioMod > 0.4 ? '◊' : '◦';
            
            // Ribs
            const ribLength = Math.floor(4 + audioMod * 6);
            for (let i = 1; i <= ribLength; i++) {
                if (x - i >= 0) buffer[y][x - i] = '─';
                if (x + i < width) buffer[y][x + i] = '─';
            }
            
            // Organic connections
            if (y % 3 === 0 && x + 1 < width) {
                buffer[y][x + 1] = audioMod > 0.5 ? '╦' : '┬';
            }
        }
    }
};

// Scene 161: Alien Eggs
CLIFTScenes[161] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Egg-like organic forms
    for (let eggY = 2; eggY < height - 2; eggY += 6) {
        for (let eggX = 4; eggX < width - 4; eggX += 10) {
            const audioMod = audio[eggX % audio.length] || 0;
            const pulsating = Math.sin(t * 3 + eggX * 0.1) * 0.5 + 0.5;
            const active = audioMod > 0.3;
            
            // Egg shell
            const eggSize = Math.floor(2 + pulsating * 2);
            for (let dy = -eggSize; dy <= eggSize; dy++) {
                for (let dx = -eggSize; dx <= eggSize; dx++) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= eggSize && eggY + dy >= 0 && eggY + dy < height && eggX + dx >= 0 && eggX + dx < width) {
                        if (distance > eggSize - 1) {
                            buffer[eggY + dy][eggX + dx] = active ? '▓' : '▒';
                        } else if (active && distance < 1) {
                            buffer[eggY + dy][eggX + dx] = '●'; // Embryo
                        }
                    }
                }
            }
        }
    }
};

// Scene 162: Mech Tentacles
CLIFTScenes[162] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Mechanical tentacle structures
    for (let tentacle = 0; tentacle < 4; tentacle++) {
        const startX = Math.floor(width * tentacle / 4);
        const audioMod = audio[tentacle * 16 % audio.length] || 0;
        
        for (let segment = 0; segment < 20; segment++) {
            const segmentT = t + tentacle * 0.5 + segment * 0.1;
            const x = startX + Math.floor(Math.sin(segmentT) * 10);
            const y = Math.floor(segment * height / 20);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const jointChar = audioMod > 0.5 ? '◈' : '◇';
                const segmentChar = audioMod > 0.3 ? '║' : '│';
                
                buffer[y][x] = segment % 3 === 0 ? jointChar : segmentChar;
                
                // Mechanical details
                if (segment % 3 === 0 && x + 1 < width) {
                    buffer[y][x + 1] = audioMod > 0.4 ? '╫' : '┼';
                }
            }
        }
    }
};

// Scene 163: Xenomorph Hive
CLIFTScenes[163] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Alien hive environments
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const hiveCell = Math.floor(x / 6) + Math.floor(y / 4);
            const audioMod = audio[hiveCell % audio.length] || 0;
            const organic = Math.sin(x * 0.2 + y * 0.1 + t) * 0.5 + 0.5;
            
            if (organic > 0.7 && audioMod > 0.3) {
                buffer[y][x] = '▓';
            } else if (organic > 0.5 && audioMod > 0.2) {
                buffer[y][x] = '▒';
            } else if (organic > 0.3 && audioMod > 0.1) {
                buffer[y][x] = '░';
            }
            
            // Hive structure
            if (x % 6 === 0 || y % 4 === 0) {
                buffer[y][x] = audioMod > 0.4 ? '█' : '▓';
            }
        }
    }
};

// Scene 164: Biomech Skull
CLIFTScenes[164] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Skull outline
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const audioMod = audio[Math.floor(distance) % audio.length] || 0;
            
            // Skull shape
            if (distance > 8 && distance < 10) {
                buffer[y][x] = audioMod > 0.4 ? '█' : '▓';
            }
            
            // Eye sockets
            if (distance < 3 && (Math.abs(dx) > 2 || Math.abs(dy) > 1)) {
                buffer[y][x] = audioMod > 0.5 ? '●' : '○';
            }
            
            // Mechanical components
            if (distance < 8 && Math.random() < 0.05 + audioMod * 0.1) {
                buffer[y][x] = '╬';
            }
        }
    }
};

// Scene 165: Face Hugger
CLIFTScenes[165] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Face hugger body
    for (let y = centerY - 2; y <= centerY + 2; y++) {
        for (let x = centerX - 4; x <= centerX + 4; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[x % audio.length] || 0;
                buffer[y][x] = audioMod > 0.4 ? '▓' : '▒';
            }
        }
    }
    
    // Legs/tentacles
    for (let leg = 0; leg < 8; leg++) {
        const angle = (leg / 8) * Math.PI * 2;
        const legLength = 8 + Math.sin(t * 2 + leg) * 3;
        
        for (let segment = 1; segment <= legLength; segment++) {
            const x = centerX + Math.floor(Math.cos(angle) * segment);
            const y = centerY + Math.floor(Math.sin(angle) * segment);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[leg * 8 % audio.length] || 0;
                buffer[y][x] = audioMod > 0.3 ? '═' : '─';
            }
        }
    }
};

// Scene 166: Biomech Heart
CLIFTScenes[166] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Pulsating heart
    const heartbeat = Math.sin(t * 4) * 0.5 + 0.5;
    const beatPulse = beat * 0.3 + 0.7;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const audioMod = audio[Math.floor(distance) % audio.length] || 0;
            
            const heartShape = distance < 6 * (heartbeat * beatPulse);
            
            if (heartShape) {
                if (audioMod > 0.6) {
                    buffer[y][x] = '♥';
                } else if (audioMod > 0.4) {
                    buffer[y][x] = '▓';
                } else if (audioMod > 0.2) {
                    buffer[y][x] = '▒';
                } else {
                    buffer[y][x] = '░';
                }
            }
            
            // Mechanical valves
            if (distance > 6 && distance < 8 && Math.floor(t * 2) % 2 === 0) {
                buffer[y][x] = audioMod > 0.4 ? '╬' : '┼';
            }
        }
    }
};

// Scene 167: Alien Architecture
CLIFTScenes[167] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Biomechanical architectural forms
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const structure = Math.floor(x / 8) + Math.floor(y / 6);
            const audioMod = audio[structure % audio.length] || 0;
            const organic = Math.sin(x * 0.1 + y * 0.1 + t * 0.5) * 0.5 + 0.5;
            
            // Structural elements
            if (x % 8 === 0 && audioMod > 0.3) {
                buffer[y][x] = '║';
            } else if (y % 6 === 0 && audioMod > 0.3) {
                buffer[y][x] = '═';
            } else if (organic > 0.8 && audioMod > 0.4) {
                buffer[y][x] = '▓';
            } else if (organic > 0.6 && audioMod > 0.2) {
                buffer[y][x] = '▒';
            }
            
            // Joints and connections
            if (x % 8 === 0 && y % 6 === 0) {
                buffer[y][x] = audioMod > 0.5 ? '╬' : '┼';
            }
        }
    }
};

// Scene 168: Chestburster
CLIFTScenes[168] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Emergence sequence
    const emergence = Math.sin(t * 0.5) * 0.5 + 0.5;
    
    // Host body
    for (let y = centerY - 3; y <= centerY + 3; y++) {
        for (let x = centerX - 8; x <= centerX + 8; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[x % audio.length] || 0;
                buffer[y][x] = audioMod > 0.3 ? '▓' : '▒';
            }
        }
    }
    
    // Bursting creature
    const burstLength = Math.floor(emergence * 10);
    for (let i = 0; i < burstLength; i++) {
        const x = centerX + i;
        const y = centerY + Math.floor(Math.sin(i * 0.5) * 2);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const audioMod = audio[i % audio.length] || 0;
            buffer[y][x] = audioMod > 0.5 ? '▬' : '─';
        }
    }
    
    // Blood splatter
    for (let splat = 0; splat < 10; splat++) {
        const splatX = centerX + Math.floor(Math.sin(t + splat) * 15);
        const splatY = centerY + Math.floor(Math.cos(t + splat) * 8);
        
        if (splatX >= 0 && splatX < width && splatY >= 0 && splatY < height) {
            const audioMod = audio[splat % audio.length] || 0;
            if (audioMod > 0.4) {
                buffer[splatY][splatX] = '●';
            }
        }
    }
};

// Scene 169: Space Jockey
CLIFTScenes[169] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Large-scale alien pilot forms
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const audioMod = audio[Math.floor(distance) % audio.length] || 0;
            
            // Massive skeletal structure
            if (distance > 10 && distance < 12) {
                buffer[y][x] = audioMod > 0.4 ? '█' : '▓';
            }
            
            // Pilot chair integration
            if (distance < 8 && Math.abs(dy) < 2) {
                buffer[y][x] = audioMod > 0.5 ? '╬' : '┼';
            }
            
            // Atmospheric details
            if (Math.random() < 0.02 + audioMod * 0.05) {
                buffer[y][x] = '·';
            }
        }
    }
};
