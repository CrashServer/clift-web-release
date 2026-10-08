// Scene lookup on top of catalog-data.js, plus the user's custom scenes bank.

Object.assign(CLIFT.catalog, {
    // Scenes that threw at runtime; the UI marks them.
    broken: new Set(),

    // Built-in banks plus a "Custom" bank when the editors have produced scenes.
    allBanks() {
        const custom = CLIFT.custom.ids();
        return custom.length ? this.banks.concat([{ name: 'Custom', ids: custom, custom: true }]) : this.banks;
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
        const ids = this.allIds();
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
        return this.allIds().filter(id => this.name(id).toLowerCase().includes(q) || String(id) === q);
    }
});
