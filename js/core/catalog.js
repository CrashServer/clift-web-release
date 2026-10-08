// Scene lookup on top of catalog-data.js, plus the user's custom scenes bank.

Object.assign(CLIFT.catalog, {
    // Scenes that threw at runtime; the UI marks them.
    broken: new Set(),

    favorites: new Set(CLIFT.util.storage.get('clift-favorites', [])),

    toggleFavorite(id) {
        if (this.favorites.has(id)) this.favorites.delete(id); else this.favorites.add(id);
        CLIFT.util.storage.set('clift-favorites', [...this.favorites]);
        CLIFT.events.emit('catalog-changed');
    },

    // Built-in banks, then "Custom" (editor scenes) and "Favorites" when not empty.
    // Favorites come last so a scene's home bank is still found first.
    allBanks() {
        let banks = this.banks;
        const custom = CLIFT.custom.ids();
        if (custom.length) banks = banks.concat([{ name: 'Custom', ids: custom, custom: true }]);
        const favs = [...this.favorites].filter(id => this.resolve(id)).sort((a, b) => a - b);
        if (favs.length) banks = banks.concat([{ name: '★ Favorites', ids: favs, favorites: true }]);
        return banks;
    },

    // Built-in banks only list each scene once; Favorites repeats them.
    uniqueIds() {
        return [...new Set(this.allIds())];
    },

    // Whether a scene reads the deck's Param 1-3 knobs.
    usesParams(id) {
        const fn = this.resolve(id);
        if (!fn) return false;
        if (fn.__usesParams === undefined) fn.__usesParams = /\bparam[123]\b/.test(fn.toString());
        return fn.__usesParams;
    },

    name(id) {
        if (CLIFT.custom.has(id)) return CLIFT.custom.name(id);
        return this.names[id] || `Scene ${id}`;
    },

    bankIndexOf(id) {
        const banks = this.allBanks();
        const i = banks.findIndex(b => b.ids.includes(id));
        return i < 0 ? 0 : i;
    },

    // Custom scenes only ever use their own id range, so they never shadow built-ins.
    resolve(id) {
        return CLIFT.custom.get(id) || window.CLIFTScenes[id] || null;
    },

    // Flat list of every playable scene id in bank order.
    allIds() {
        return this.allBanks().flatMap(b => b.ids);
    },

    // Step through scenes in catalog order, crossing bank boundaries.
    step(id, dir) {
        const ids = this.uniqueIds();
        const i = ids.indexOf(id);
        return ids[CLIFT.util.wrap((i < 0 ? 0 : i) + dir, ids.length)];
    },

    // First scene of the bank `dir` banks away from the one containing `id`.
    stepBank(id, dir) {
        const banks = this.allBanks();
        const b = CLIFT.util.wrap(this.bankIndexOf(id) + dir, banks.length);
        return banks[b].ids[0];
    },

    search(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return this.uniqueIds().filter(id => this.name(id).toLowerCase().includes(q) || String(id) === q);
    }
});
