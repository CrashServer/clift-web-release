// Color pairs (matching the ncurses CLIFT terminal build) and gradient blending.

CLIFT.palette = {
    // Index 0 is unused so ids line up with the terminal version (1-10).
    pairs: [
        null,
        { fg: '#ff0040', bg: '#000000', name: 'Red' },
        { fg: '#00ff00', bg: '#000000', name: 'Green' },
        { fg: '#2a7fff', bg: '#000000', name: 'Blue' },
        { fg: '#ffff00', bg: '#000000', name: 'Yellow' },
        { fg: '#ff00ff', bg: '#000000', name: 'Magenta' },
        { fg: '#00ffff', bg: '#000000', name: 'Cyan' },
        { fg: '#ffffff', bg: '#000000', name: 'White' },
        { fg: '#000000', bg: '#ff0040', name: 'Inv Red' },
        { fg: '#000000', bg: '#00ff00', name: 'Inv Green' },
        { fg: '#000000', bg: '#2a7fff', name: 'Inv Blue' }
    ],
    count: 10,
    DEFAULT: 7,

    pair(id) {
        return this.pairs[id] || this.pairs[this.DEFAULT];
    },

    name(id) {
        return this.pair(id).name;
    },

    // Foreground color as an [r, g, b] triple (used by the experimental renderers).
    rgb(id) {
        const p = this.pair(id);
        const hex = p.fg === '#000000' ? p.bg : p.fg;
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    },

    gradients: ['Lin-H', 'Lin-V', 'Diag 1', 'Diag 2', 'Radial', 'Diamond', 'Wave-H', 'Wave-V', 'Noise', 'Spiral'],

    // 0..1 blend factor between a deck's primary and secondary color.
    gradientFactor(type, x, y, width, height, time) {
        const cx = width / 2;
        const cy = height / 2;
        const nx = x / width;
        const ny = y / height;
        switch (type) {
            case 0: return nx;
            case 1: return ny;
            case 2: return (nx + ny) / 2;
            case 3: return (nx + (1 - ny)) / 2;
            case 4: return Math.min(1, Math.hypot(x - cx, y - cy) / Math.hypot(cx, cy));
            case 5: return Math.min(1, (Math.abs(x - cx) + Math.abs(y - cy)) / (cx + cy));
            case 6: return (Math.sin(nx * Math.PI * 2 + time * 0.002) + 1) / 2;
            case 7: return (Math.sin(ny * Math.PI * 2 + time * 0.002) + 1) / 2;
            case 8: return (Math.sin(x * 0.1 + time * 0.001) * Math.cos(y * 0.1 + time * 0.001) + 1) / 2;
            case 9: {
                const angle = Math.atan2(y - cy, x - cx);
                return (Math.sin(angle * 3 + Math.hypot(x - cx, y - cy) * 0.1 + time * 0.003) + 1) / 2;
            }
            default: return 0.5;
        }
    }
};
