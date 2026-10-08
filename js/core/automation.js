// Full Auto mode: beat-synced random changes. New scenes are always cued on the
// off-air deck and brought in with a crossfade, so the output never hard-cuts
// to an unseen scene.

(function () {
    const { pick, randInt } = CLIFT.util;

    // Beats between changes for each rate.
    const RATES = {
        Slow: { scene: 64, effect: 16, color: 8 },
        Medium: { scene: 32, effect: 8, color: 4 },
        Fast: { scene: 16, effect: 4, color: 2 }
    };

    CLIFT.automation = {
        enabled: false,
        rate: 'Medium',
        rates: Object.keys(RATES),
        options: {
            scenes: true,
            crossfade: true,
            effects: true,
            colors: true,
            postfx: false,
            renderModes: false,
            resolution: false
        },
        optionLabels: {
            scenes: 'Scenes',
            crossfade: 'Crossfade',
            effects: 'Effects',
            colors: 'Colors',
            postfx: 'Post-FX',
            renderModes: 'Render modes',
            resolution: 'Resolution'
        },

        init(engine) {
            this.engine = engine;
            CLIFT.events.on('clock-beat', count => {
                if (this.enabled) this.onBeat(count);
            });
        },

        toggle(force) {
            this.enabled = force === undefined ? !this.enabled : !!force;
            CLIFT.events.emit('state');
            return this.enabled;
        },

        onBeat(count) {
            const e = this.engine;
            const rate = RATES[this.rate];
            const o = this.options;

            if (count % rate.scene === 0) {
                const target = e.offAirDeck;
                if (o.scenes) {
                    const ids = CLIFT.catalog.allIds().filter(id => !CLIFT.catalog.broken.has(id));
                    e.setScene(pick(ids), target);
                    if (o.colors) e.randomizeColors(target);
                }
                if (o.crossfade) e.startTransition(target);
                else if (o.scenes) e.setCrossfader(target);

                if (o.renderModes) e.setRenderMode(Math.random() < 0.7 ? 0 : 1 + randInt(e.renderModes.length - 1));
                if (o.postfx) CLIFT.output.applyPreset(pick(CLIFT.output.presetNames));
                if (o.resolution) {
                    const [w, h] = pick(e.resolutions.slice(1, 6));
                    e.setResolution(w, h);
                }
                return;
            }

            if (o.effects && count % rate.effect === 0) {
                e.setEffect(Math.random() < 0.4 ? 0 : 1 + randInt(e.effects.length - 1));
                return;
            }

            if (o.colors && count % rate.color === 0) {
                const onAir = 1 - e.offAirDeck;
                if (Math.random() < 0.5) e.stepGradient(1, onAir);
                else e.stepDeckColor(Math.random() < 0.5 ? 'primary' : 'secondary', 1, onAir);
            }
        }
    };
})();
