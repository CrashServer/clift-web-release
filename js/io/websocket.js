// WebSocket client for the CLIFT live-coding server.
//
// Incoming:  { player: 0|1, code, executed, active, duration? }  -> code overlay
//            { type: 'scene_change', deck, sceneId }             -> load a scene
//            { type: 'effect_change', effect }                   -> select effect (index or name)
//            { type: 'bpm_change', bpm }
//            { type: 'ping' }                                    -> answered with pong
// Outgoing:  scene_change / effect_change / bpm_change when changed locally.
//
// Nothing connects until the user asks; reconnects only while a connection is wanted.

(function () {
    const URL_KEY = 'clift-ws-url';

    const ws = {
        url: CLIFT.util.storage.get(URL_KEY, 'ws://localhost:7745'),
        socket: null,
        wanted: false,
        status: 'offline', // offline | connecting | online
        retryTimer: null,
        overlay: null,
        callbacks: { onConnect: [], onDisconnect: [], onMessage: [] },

        init(engine) {
            this.engine = engine;
            this.overlay = document.getElementById('code-overlay');
            CLIFT.events.on('scene', deck => this.syncScene(deck));
            CLIFT.events.on('effect', () => this.syncEffect());
            CLIFT.events.on('bpm', () => this.syncBPM());
        },

        setUrl(url) {
            this.url = url.trim();
            CLIFT.util.storage.set(URL_KEY, this.url);
            if (this.wanted) {
                this.disconnect();
                this.connect();
            }
        },

        setStatus(status) {
            this.status = status;
            CLIFT.events.emit('ws-status', status);
        },

        connect() {
            this.wanted = true;
            if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;
            clearTimeout(this.retryTimer);
            this.setStatus('connecting');
            let socket;
            try {
                socket = new WebSocket(this.url);
            } catch (e) {
                CLIFT.warn('invalid WebSocket URL:', this.url);
                this.wanted = false;
                this.setStatus('offline');
                return;
            }
            this.socket = socket;
            socket.onopen = () => {
                this.setStatus('online');
                this.send({ type: 'client', name: 'CLIFT Web' });
                this.callbacks.onConnect.forEach(fn => fn());
            };
            socket.onmessage = (event) => {
                let data;
                try { data = JSON.parse(event.data); } catch (e) { return; }
                this.handleMessage(data);
            };
            socket.onclose = () => {
                if (this.socket !== socket) return;
                this.socket = null;
                this.setStatus('offline');
                this.callbacks.onDisconnect.forEach(fn => fn());
                if (this.wanted) this.retryTimer = setTimeout(() => this.connect(), 5000);
            };
        },

        disconnect() {
            this.wanted = false;
            clearTimeout(this.retryTimer);
            if (this.socket) {
                const s = this.socket;
                this.socket = null;
                s.close();
            }
            this.setStatus('offline');
        },

        toggle() {
            if (this.wanted) this.disconnect(); else this.connect();
        },

        isConnected() {
            return !!this.socket && this.socket.readyState === WebSocket.OPEN;
        },

        send(data) {
            if (!this.isConnected()) return false;
            this.socket.send(JSON.stringify(data));
            return true;
        },

        on(event, fn) {
            if (this.callbacks[event]) this.callbacks[event].push(fn);
        },

        handleMessage(data) {
            this.applyingRemote = true;
            try {
                this.applyMessage(data);
            } finally {
                this.applyingRemote = false;
            }
            this.callbacks.onMessage.forEach(fn => fn(data));
        },

        applyMessage(data) {
            const e = this.engine;
            if (data.code !== undefined || data.active !== undefined) this.showCode(data);
            switch (data.type) {
                case 'ping':
                    this.send({ type: 'pong' });
                    break;
                case 'scene_change': {
                    const id = data.sceneId !== undefined ? data.sceneId : data.category * 10 + (data.scene || 0);
                    e.setScene(Number(id), data.deck === 1 ? 1 : data.deck === 0 ? 0 : e.activeDeck);
                    break;
                }
                case 'effect_change': {
                    const idx = typeof data.effect === 'number' ? data.effect : e.effects.indexOf(data.effect || data.name);
                    if (idx >= 0) e.setEffect(idx);
                    break;
                }
                case 'bpm_change':
                    if (data.bpm) e.setBPM(data.bpm);
                    break;
            }
        },

        showCode(data) {
            const el = this.overlay;
            if (!el) return;
            clearTimeout(this.hideTimer);
            if (!data.active) {
                el.hidden = true;
                return;
            }
            let text = data.player !== undefined ? `[DECK ${data.player === 0 ? 'A' : 'B'}]\n\n` : '';
            if (data.code) text += `// CODE:\n${data.code}\n\n`;
            if (data.executed) text += `// OUTPUT:\n${data.executed}`;
            el.textContent = text;
            el.hidden = false;
            if (data.duration) this.hideTimer = setTimeout(() => { el.hidden = true; }, data.duration);
        },

        // Outgoing sync for local changes (not echoed back while applying remote ones).
        syncScene(deckIndex) {
            if (this.applyingRemote) return;
            const deck = this.engine.decks[deckIndex];
            this.send({ type: 'scene_change', deck: deckIndex, sceneId: deck.sceneId, name: CLIFT.catalog.name(deck.sceneId) });
        },
        syncEffect() {
            if (this.applyingRemote) return;
            const e = this.engine;
            this.send({ type: 'effect_change', effect: e.currentEffect, name: e.effects[e.currentEffect] });
        },
        syncBPM() {
            if (this.applyingRemote) return;
            this.send({ type: 'bpm_change', bpm: this.engine.bpm });
        }
    };

    CLIFT.ws = ws;
    window.CLIFTWebSocket = ws; // legacy name
})();
