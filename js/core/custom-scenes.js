// Registry for scenes created in the code / node editors.
//
// Runtime functions live in window.CLIFTCustomScenes (the editors write there);
// metadata + source code is persisted in localStorage so scenes survive reloads.

(function () {
    const STORAGE_KEY = 'clift-custom-scenes';
    const FIRST_ID = 1000;   // built-in scenes use 0-234; keep well clear
    const LIVE_ID = 999;     // the node editor's live-preview slot

    window.CLIFTCustomScenes = window.CLIFTCustomScenes || {};
    const meta = {};

    function compile(code) {
        // eslint-disable-next-line no-new-func
        const fn = new Function(`return (${code});`)();
        if (typeof fn !== 'function') throw new Error('Scene code must evaluate to a function');
        return fn;
    }

    CLIFT.custom = {
        FIRST_ID,
        LIVE_ID,
        compile,

        has(id) {
            return typeof window.CLIFTCustomScenes[id] === 'function' && (id >= FIRST_ID || id === LIVE_ID);
        },

        get(id) {
            return this.has(id) ? window.CLIFTCustomScenes[id] : null;
        },

        name(id) {
            if (id === LIVE_ID) return 'Editor Live';
            return (meta[id] && meta[id].name) || `Custom ${id}`;
        },

        ids() {
            return Object.keys(window.CLIFTCustomScenes).map(Number).filter(id => this.has(id)).sort((a, b) => a - b);
        },

        nextFreeId() {
            let id = FIRST_ID;
            while (window.CLIFTCustomScenes[id] || meta[id]) id++;
            return id;
        },

        // Add or replace a scene. `entry` = { name, type: 'code'|'node', code, nodes?, connections? }
        save(id, entry) {
            if (!(id >= FIRST_ID)) id = this.nextFreeId();
            const fn = compile(entry.code);
            window.CLIFTCustomScenes[id] = fn;
            meta[id] = { name: entry.name || `Custom ${id}`, type: entry.type || 'code', code: entry.code,
                         nodes: entry.nodes, connections: entry.connections };
            this.persist();
            CLIFT.events.emit('catalog-changed');
            return id;
        },

        remove(id) {
            delete window.CLIFTCustomScenes[id];
            delete meta[id];
            this.persist();
            CLIFT.events.emit('catalog-changed');
        },

        setLive(fn) {
            window.CLIFTCustomScenes[LIVE_ID] = fn;
            CLIFT.events.emit('catalog-changed');
        },

        persist() {
            CLIFT.util.storage.set(STORAGE_KEY, meta);
        },

        // Restore saved scenes. Older builds stored ids from 200 upward, which
        // overwrote built-in scenes; those are moved into the custom range.
        load() {
            const saved = CLIFT.util.storage.get(STORAGE_KEY, {});
            let migrated = false;
            for (const [key, entry] of Object.entries(saved)) {
                let id = Number(key);
                let code = entry.code;
                if (!code && entry.nodes && window.CLIFTNodeEditor && CLIFTNodeEditor.codeForGraph) {
                    code = CLIFTNodeEditor.codeForGraph(entry.nodes, entry.connections || []);
                }
                if (!code) continue;
                if (id < FIRST_ID) {
                    id = this.nextFreeId();
                    migrated = true;
                }
                try {
                    window.CLIFTCustomScenes[id] = compile(code);
                    meta[id] = Object.assign({}, entry, { code });
                } catch (e) {
                    CLIFT.warn(`custom scene ${key} could not be compiled:`, e.message);
                }
            }
            if (migrated) this.persist();
            return this.ids().length;
        },

        entry(id) {
            return meta[id] || null;
        }
    };
})();
