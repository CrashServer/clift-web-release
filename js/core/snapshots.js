// Eight snapshot slots: a "look" (both decks, effect, render mode, colors,
// post-FX) that can be recalled instantly from the panel, keys or MIDI.
// BPM, crossfader and grid size are left alone so recalling never jumps the mix.

(function () {
    const STORAGE_KEY = 'clift-snapshots';
    const SLOTS = 8;

    function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }

    CLIFT.snapshots = {
        SLOTS,
        slots: (CLIFT.util.storage.get(STORAGE_KEY, null) || new Array(SLOTS).fill(null)).slice(0, SLOTS),

        capture() {
            const e = CLIFT.engine;
            return {
                decks: e.decks.map(d => clone({
                    sceneId: d.sceneId,
                    primaryColor: d.primaryColor,
                    secondaryColor: d.secondaryColor,
                    gradientType: d.gradientType,
                    params: d.params,
                    speed: d.speed,
                    pulse: d.pulse
                })),
                effect: e.currentEffect,
                renderMode: e.renderMode,
                mixMode: e.mixMode,
                colorMode: e.colorMode,
                colorEnabled: e.colorEnabled,
                invertColors: e.invertColors,
                postfx: CLIFT.output.getOptions()
            };
        },

        save(i) {
            this.slots[i] = this.capture();
            this.persist();
        },

        clear(i) {
            this.slots[i] = null;
            this.persist();
        },

        recall(i) {
            const s = this.slots[i];
            if (!s) return false;
            const e = CLIFT.engine;
            s.decks.forEach((d, k) => {
                const deck = e.decks[k];
                if (CLIFT.catalog.resolve(d.sceneId)) deck.sceneId = d.sceneId;
                deck.primaryColor = d.primaryColor;
                deck.secondaryColor = d.secondaryColor;
                deck.gradientType = d.gradientType;
                Object.assign(deck.params, d.params);
                if (typeof d.speed === 'number') deck.speed = d.speed;
                if (typeof d.pulse === 'number') deck.pulse = d.pulse;
            });
            e.currentEffect = s.effect;
            e.renderMode = s.renderMode;
            e.mixMode = s.mixMode;
            e.colorMode = s.colorMode;
            e.colorEnabled = s.colorEnabled;
            e.invertColors = s.invertColors;
            CLIFT.output.setOptions(s.postfx);
            CLIFT.events.emit('state');
            CLIFT.events.emit('scene', 0);
            CLIFT.events.emit('scene', 1);
            return true;
        },

        label(i) {
            const s = this.slots[i];
            if (!s) return 'Empty';
            return s.decks.map((d, k) => `${k ? 'B' : 'A'}: ${CLIFT.catalog.name(d.sceneId)}`).join('\n');
        },

        persist() {
            CLIFT.util.storage.set(STORAGE_KEY, this.slots);
            CLIFT.events.emit('state');
        },

        setAll(slots) {
            if (!Array.isArray(slots)) return;
            this.slots = slots.slice(0, SLOTS);
            while (this.slots.length < SLOTS) this.slots.push(null);
            this.persist();
        }
    };
})();
