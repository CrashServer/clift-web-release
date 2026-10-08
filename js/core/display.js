// Size of the surface the visuals are rendered for: the projector output
// window when it is open, otherwise this window. Emits 'display-resize'.

CLIFT.display = {
    size() {
        const ow = CLIFT.outputWindow;
        const win = ow && ow.isOpen ? ow.win : window;
        const dpr = Math.min(win.devicePixelRatio || 1, 2);
        return {
            width: Math.max(1, win.innerWidth),
            height: Math.max(1, win.innerHeight),
            dpr
        };
    },

    changed() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => CLIFT.events.emit('display-resize', this.size()), 50);
    },

    init() {
        window.addEventListener('resize', () => this.changed());
    }
};
