// CLIFT scenes - category 17: Revolt

// ============================================
// CATEGORY 17: Revolt (170-179)
// ============================================

// Scene 170: Rising Fists
CLIFTScenes[170] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Rising fists symbolizing resistance
    for (let fist = 0; fist < 6; fist++) {
        const fistX = Math.floor(width * fist / 6) + 5;
        const audioMod = audio[fist * 10 % audio.length] || 0;
        const rise = Math.sin(t * 2 + fist * 0.5) * 0.3 + 0.7;
        const fistY = Math.floor(height * rise);
        
        if (fistX >= 0 && fistX < width && fistY >= 0 && fistY < height) {
            // Fist shape
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    if (fistY + dy >= 0 && fistY + dy < height && fistX + dx >= 0 && fistX + dx < width) {
                        buffer[fistY + dy][fistX + dx] = audioMod > 0.4 ? '█' : '▓';
                    }
                }
            }
            
            // Arm
            for (let armY = fistY + 3; armY < height && armY < fistY + 8; armY++) {
                if (fistX >= 0 && fistX < width) {
                    buffer[armY][fistX] = audioMod > 0.3 ? '║' : '│';
                }
            }
        }
    }
};

// Scene 171: Breaking Chains
CLIFTScenes[171] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Chain-breaking animations
    for (let chain = 0; chain < 4; chain++) {
        const chainY = Math.floor(height * chain / 4) + 3;
        const audioMod = audio[chain * 16 % audio.length] || 0;
        const breaking = Math.sin(t * 3 + chain) * 0.5 + 0.5;
        
        for (let x = 0; x < width; x++) {
            const segment = Math.floor(x / 6);
            const broken = breaking > 0.7 && segment % 2 === 0;
            
            if (chainY >= 0 && chainY < height) {
                if (broken && audioMod > 0.4) {
                    buffer[chainY][x] = '∞'; // Broken link
                } else if (audioMod > 0.2) {
                    buffer[chainY][x] = '○'; // Chain link
                } else {
                    buffer[chainY][x] = '─'; // Chain segment
                }
            }
        }
    }
};

// Scene 172: Crowd March
CLIFTScenes[172] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Marching crowd formations
    for (let row = 0; row < 4; row++) {
        const rowY = Math.floor(height * (row + 1) / 5);
        const marchOffset = Math.floor(t * 10 + row * 5) % width;
        
        for (let person = 0; person < 8; person++) {
            const personX = (marchOffset + person * 8) % width;
            const audioMod = audio[person * 8 % audio.length] || 0;
            
            if (personX >= 0 && personX < width && rowY >= 0 && rowY < height) {
                // Person representation
                buffer[rowY][personX] = audioMod > 0.4 ? '♦' : '♢';
                
                // Movement trail
                const trailX = (personX - 2 + width) % width;
                if (trailX >= 0 && trailX < width) {
                    buffer[rowY][trailX] = audioMod > 0.2 ? '·' : ' ';
                }
            }
        }
    }
};

// Scene 173: Barricade Building
CLIFTScenes[173] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Construction of protest barriers
    const barricadeHeight = Math.floor(height * 0.6);
    const construction = Math.sin(t * 0.5) * 0.5 + 0.5;
    
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const buildHeight = Math.floor(construction * barricadeHeight * (1 + audioMod * 0.5));
        
        for (let y = height - buildHeight; y < height; y++) {
            if (y >= 0 && y < height) {
                // Barricade materials
                const material = Math.floor(Math.random() * 3 + audioMod * 2);
                switch (material) {
                    case 0: buffer[y][x] = '█'; break;
                    case 1: buffer[y][x] = '▓'; break;
                    case 2: buffer[y][x] = '▒'; break;
                    case 3: buffer[y][x] = '░'; break;
                    case 4: buffer[y][x] = '■'; break;
                }
            }
        }
    }
};

// Scene 174: Molotov Cocktails
CLIFTScenes[174] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Protest weapon visualizations
    for (let molotov = 0; molotov < 5; molotov++) {
        const audioMod = audio[molotov * 12 % audio.length] || 0;
        
        if (audioMod > 0.3) {
            const trajectory = t * 5 + molotov * 2;
            const x = Math.floor(width * 0.2 + (trajectory % 1) * width * 0.6);
            const y = Math.floor(height * 0.2 + Math.sin(trajectory * 3) * height * 0.6);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = audioMod > 0.6 ? '💥' : '○';
                
                // Flame trail
                for (let trail = 1; trail <= 3; trail++) {
                    const trailX = x - trail;
                    if (trailX >= 0 && trailX < width) {
                        buffer[y][trailX] = '·';
                    }
                }
            }
        }
    }
};

// Scene 175: Tear Gas
CLIFTScenes[175] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Gas cloud effects
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const gasCloud = Math.sin(x * 0.1 + y * 0.15 + t * 2) * 0.5 + 0.5;
            const audioMod = audio[x % audio.length] || 0;
            const gasIntensity = gasCloud * (audioMod + 0.3);
            
            if (gasIntensity > 0.7) {
                buffer[y][x] = '▓';
            } else if (gasIntensity > 0.5) {
                buffer[y][x] = '▒';
            } else if (gasIntensity > 0.3) {
                buffer[y][x] = '░';
            } else if (gasIntensity > 0.1) {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 176: Graffiti Wall
CLIFTScenes[176] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Dynamic graffiti animations
    const messages = ['RESIST', 'REVOLT', 'UNITY', 'FREEDOM'];
    
    for (let msg = 0; msg < messages.length; msg++) {
        const message = messages[msg];
        const msgY = Math.floor(height * msg / 4) + 2;
        const audioMod = audio[msg * 16 % audio.length] || 0;
        const spray = Math.sin(t * 2 + msg) * 0.5 + 0.5;
        
        if (audioMod > 0.3) {
            for (let i = 0; i < message.length; i++) {
                const x = Math.floor(width * 0.2 + i * 2);
                if (x >= 0 && x < width && msgY >= 0 && msgY < height) {
                    buffer[msgY][x] = message[i];
                    
                    // Spray effect around letters
                    if (spray > 0.5) {
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (msgY + dy >= 0 && msgY + dy < height && x + dx >= 0 && x + dx < width) {
                                    if (Math.random() < 0.3) {
                                        buffer[msgY + dy][x + dx] = '·';
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Scene 177: Police Line Breaking
CLIFTScenes[177] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Barrier breakthrough scenes
    const lineY = Math.floor(height / 2);
    const breakthrough = Math.sin(t * 1.5) * 0.5 + 0.5;
    
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const section = Math.floor(x / 8);
        const broken = breakthrough > 0.7 && section % 2 === 0 && audioMod > 0.4;
        
        if (lineY >= 0 && lineY < height) {
            if (broken) {
                buffer[lineY][x] = ' '; // Broken line
                buffer[lineY - 1][x] = '▓'; // Debris
                buffer[lineY + 1][x] = '▒'; // Debris
            } else {
                buffer[lineY][x] = audioMod > 0.3 ? '█' : '▓'; // Intact line
            }
        }
    }
    
    // Crowd pressure indicators
    for (let pressure = 0; pressure < 10; pressure++) {
        const pX = Math.floor(width * pressure / 10);
        const pY = lineY + Math.floor(Math.sin(t * 3 + pressure) * 3);
        
        if (pX >= 0 && pX < width && pY >= 0 && pY < height) {
            const audioMod = audio[pressure * 6 % audio.length] || 0;
            if (audioMod > 0.5) {
                buffer[pY][pX] = '!';
            }
        }
    }
};

// Scene 178: Flag Burning
CLIFTScenes[178] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Flag destruction imagery
    const burning = Math.sin(t * 3) * 0.5 + 0.5;
    
    // Flag base
    for (let y = centerY - 4; y <= centerY + 4; y++) {
        for (let x = centerX - 8; x <= centerX + 8; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[x % audio.length] || 0;
                const burnLevel = burning * (1 + audioMod);
                
                if (burnLevel > 0.8) {
                    buffer[y][x] = '▓'; // Burning
                } else if (burnLevel > 0.5) {
                    buffer[y][x] = '▒'; // Smoldering
                } else if (burnLevel > 0.2) {
                    buffer[y][x] = '█'; // Intact
                }
            }
        }
    }
    
    // Flames
    for (let flame = 0; flame < 15; flame++) {
        const flameX = centerX + Math.floor(Math.sin(t * 4 + flame) * 12);
        const flameY = centerY - 6 + Math.floor(Math.cos(t * 3 + flame) * 4);
        
        if (flameX >= 0 && flameX < width && flameY >= 0 && flameY < height) {
            const audioMod = audio[flame % audio.length] || 0;
            if (audioMod > 0.3) {
                buffer[flameY][flameX] = '▲';
            }
        }
    }
};

// Scene 179: Victory Dance
CLIFTScenes[179] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Celebration sequences
    for (let dancer = 0; dancer < 8; dancer++) {
        const danceX = Math.floor(width * dancer / 8) + 2;
        const danceY = Math.floor(height * 0.7 + Math.sin(t * 4 + dancer) * 4);
        const audioMod = audio[dancer * 8 % audio.length] || 0;
        
        if (danceX >= 0 && danceX < width && danceY >= 0 && danceY < height) {
            // Dancing figure
            buffer[danceY][danceX] = audioMod > 0.4 ? '♪' : '♫';
            
            // Arms raised
            if (danceX - 1 >= 0) buffer[danceY][danceX - 1] = '\\';
            if (danceX + 1 < width) buffer[danceY][danceX + 1] = '/';
            
            // Celebration effects
            if (audioMod > 0.6) {
                for (let effect = 0; effect < 5; effect++) {
                    const eX = danceX + Math.floor(Math.sin(t * 6 + effect) * 3);
                    const eY = danceY + Math.floor(Math.cos(t * 6 + effect) * 2);
                    
                    if (eX >= 0 && eX < width && eY >= 0 && eY < height) {
                        buffer[eY][eX] = '★';
                    }
                }
            }
        }
    }
};
