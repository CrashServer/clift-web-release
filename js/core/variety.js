// Variety: novelty-weighted choices with memory.
//
// Every pick remembers what was chosen per category; recently used items get a
// much lower chance and recover over time (measured in beats), so Full Auto
// keeps rotating through everything instead of falling back on favorites.
//
//   CLIFT.variety.pick('looks', ['clean', 'tunnel', ...])
//   CLIFT.variety.pick('hits', [['explode', 1], ['glitch', 4]])   // with base weights

(function () {
    const HALF_LIFE = 24; // beats for a "used" mark to fade by half

    const memory = {}; // category -> { item: usage score }

    function beatNow() {
        return CLIFT.engine ? CLIFT.engine.clock.count + CLIFT.engine.clock.phase : 0;
    }

    CLIFT.variety = {
        // Usage score of an item, decayed to now.
        score(category, item) {
            const m = memory[category];
            const entry = m && m[item];
            if (!entry) return 0;
            return entry.score * Math.pow(0.5, (beatNow() - entry.at) / HALF_LIFE);
        },

        note(category, item) {
            const m = (memory[category] = memory[category] || {});
            m[item] = { score: this.score(category, item) + 1, at: beatNow() };
        },

        // items: array of values, or of [value, baseWeight] pairs.
        pick(category, items) {
            if (!items.length) return undefined;
            const list = items.map(it => Array.isArray(it) ? it : [it, 1]);
            const weights = list.map(([item, w]) => w / (1 + this.score(category, item) * 3) ** 2);
            let r = Math.random() * weights.reduce((a, b) => a + b, 0);
            let chosen = list[list.length - 1][0];
            for (let i = 0; i < list.length; i++) {
                r -= weights[i];
                if (r <= 0) { chosen = list[i][0]; break; }
            }
            this.note(category, chosen);
            return chosen;
        },

        reset() {
            for (const k of Object.keys(memory)) delete memory[k];
        }
    };
})();
