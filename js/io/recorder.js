// Records the visible output canvas (including post-FX and render modes) to a
// video file. When a mic or audio file is the input, its sound is recorded too.

(function () {
    const MIME_TYPES = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
    ];

    CLIFT.recorder = {
        recording: false,
        recorder: null,
        chunks: [],
        startedAt: 0,

        get supported() {
            return typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream;
        },

        get elapsed() {
            return this.recording ? (performance.now() - this.startedAt) / 1000 : 0;
        },

        start() {
            if (!this.supported) throw new Error('Recording is not supported in this browser');
            const stream = CLIFT.output.canvas.captureStream(30);
            const audioTrack = this.audioTrack();
            if (audioTrack) stream.addTrack(audioTrack);

            const mimeType = MIME_TYPES.find(t => MediaRecorder.isTypeSupported(t)) || '';
            this.recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 8e6 } : undefined);
            this.chunks = [];
            this.recorder.ondataavailable = e => { if (e.data.size) this.chunks.push(e.data); };
            this.recorder.onstop = () => {
                const type = this.recorder.mimeType || 'video/webm';
                const ext = type.includes('mp4') ? 'mp4' : 'webm';
                CLIFT.util.download(`clift-recording-${CLIFT.util.timestamp()}.${ext}`, new Blob(this.chunks, { type }));
                this.chunks = [];
            };
            this.recorder.start(1000);
            this.recording = true;
            this.startedAt = performance.now();
            CLIFT.events.emit('state');
        },

        stop() {
            if (!this.recording) return;
            this.recorder.stop();
            this.recording = false;
            CLIFT.events.emit('state');
        },

        toggle() {
            if (this.recording) this.stop(); else this.start();
            return this.recording;
        },

        audioTrack() {
            const a = CLIFT.audio;
            if (!a.live || !a.sourceNode || !a.context) return null;
            if (!this.audioDest) this.audioDest = a.context.createMediaStreamDestination();
            try { a.sourceNode.connect(this.audioDest); } catch (e) { return null; }
            return this.audioDest.stream.getAudioTracks()[0] || null;
        }
    };
})();
