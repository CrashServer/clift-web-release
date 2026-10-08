// Projector output: a second browser window that shows only the visuals.
// Drag it to the projector and double-click it (or press F inside it) for
// fullscreen. While it is open, rendering uses that window's size, and the
// main window keeps the controls plus a letterboxed preview.
//
// The window is an about:blank popup, which shares this page's origin, so it
// can be driven from here even when CLIFT runs from file://.

(function () {
    const ow = {
        win: null,
        canvas: null,
        ctx: null,

        get isOpen() {
            return !!this.win && !this.win.closed;
        },

        open() {
            if (this.isOpen) {
                this.win.focus();
                return true;
            }
            const win = window.open('', '_blank', 'popup,width=1280,height=720');
            if (!win) throw new Error('The browser blocked the output window - allow popups for this page');

            const doc = win.document;
            doc.title = 'CLIFT Output';
            doc.documentElement.style.cssText = 'background:#000;height:100%';
            doc.body.style.cssText = 'margin:0;height:100%;background:#000;overflow:hidden;cursor:none';
            const canvas = doc.createElement('canvas');
            canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;display:block';
            const hint = doc.createElement('div');
            hint.textContent = 'Double-click or press F for fullscreen';
            hint.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
                'font:14px monospace;color:#0f0;background:rgba(0,0,0,.7);padding:6px 12px;' +
                'border:1px solid #0f0;transition:opacity .6s';
            doc.body.replaceChildren(canvas, hint);
            setTimeout(() => { hint.style.opacity = '0'; }, 3000);

            this.win = win;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { alpha: false });
            this.sizeCanvas();

            const fullscreen = () => {
                if (doc.fullscreenElement) doc.exitFullscreen();
                else doc.documentElement.requestFullscreen().catch(() => {});
            };
            win.addEventListener('dblclick', fullscreen);
            win.addEventListener('keydown', (ev) => {
                if (ev.key === 'f' || ev.key === 'F') {
                    ev.preventDefault();
                    fullscreen();
                } else {
                    CLIFT.keyboard.handle(ev); // the rest of the shortcuts work here too
                }
            });
            win.addEventListener('resize', () => {
                this.sizeCanvas();
                CLIFT.display.changed();
            });
            win.addEventListener('pagehide', () => setTimeout(() => this.closed(), 0));

            CLIFT.display.changed();
            CLIFT.events.emit('state');
            return true;
        },

        close() {
            if (this.isOpen) this.win.close();
            this.closed();
        },

        toggle() {
            if (this.isOpen) this.close(); else this.open();
            return this.isOpen;
        },

        closed() {
            if (!this.win) return;
            this.win = null;
            this.canvas = null;
            this.ctx = null;
            CLIFT.display.changed();
            CLIFT.events.emit('state');
        },

        sizeCanvas() {
            const { width, height, dpr } = CLIFT.display.size();
            this.canvas.width = Math.round(width * dpr);
            this.canvas.height = Math.round(height * dpr);
        },

        // Called by the output stage right after a frame is drawn.
        present(source) {
            if (!this.isOpen) {
                this.closed();
                return;
            }
            if (source) this.ctx.drawImage(source, 0, 0, this.canvas.width, this.canvas.height);
        },

        init() {
            window.addEventListener('beforeunload', () => this.close());
        }
    };

    CLIFT.outputWindow = ow;
})();
