// CLIFT namespace, logging, events and small shared utilities.
// Everything is loaded with classic <script> tags (no ES modules) so the app
// keeps working when index.html is opened straight from disk (file://).

(function () {
    const debug = /[?&]debug\b/.test(location.search);

    const listeners = {};

    window.CLIFT = {
        version: '3.0',
        debug,

        // Verbose logging only with ?debug in the URL; warnings/errors always.
        log: debug ? console.log.bind(console, '[CLIFT]') : function () {},
        warn: console.warn.bind(console, '[CLIFT]'),
        error: console.error.bind(console, '[CLIFT]'),

        events: {
            on(name, fn) {
                (listeners[name] = listeners[name] || []).push(fn);
                return () => this.off(name, fn);
            },
            off(name, fn) {
                const list = listeners[name];
                if (list) list.splice(list.indexOf(fn) >>> 0, 1);
            },
            emit(name, data) {
                const list = listeners[name];
                if (!list) return;
                for (const fn of list.slice()) {
                    try { fn(data); } catch (e) { CLIFT.error(`listener for "${name}" failed`, e); }
                }
            }
        },

        util: {
            clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
            wrap: (v, n) => ((v % n) + n) % n,
            pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
            randInt: (n) => Math.floor(Math.random() * n),

            // Trigger a browser download for a Blob or a string.
            download(filename, data, type = 'application/json') {
                const blob = data instanceof Blob ? data : new Blob([data], { type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            },

            timestamp: () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-'),

            // localStorage can throw (private mode, blocked storage, file:// quirks).
            storage: {
                get(key, fallback = null) {
                    try {
                        const raw = localStorage.getItem(key);
                        return raw === null ? fallback : JSON.parse(raw);
                    } catch (e) {
                        return fallback;
                    }
                },
                set(key, value) {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        return true;
                    } catch (e) {
                        return false;
                    }
                },
                remove(key) {
                    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
                }
            }
        }
    };
})();
