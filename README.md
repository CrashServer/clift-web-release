# 🌊 CLIFT Web - ASCII Art VJ Software

```
   ▄████▄   ██▓     ██▓  █████▒▄▄▄█████▓
  ▒██▀ ▀█  ▓██▒    ▓██▒▓██   ▒ ▓  ██▒ ▓▒
  ▒▓█    ▄ ▒██░    ▒██▒▒████ ░ ▒ ▓██░ ▒░
  ▒▓▓▄ ▄██▒▒██░    ░██░░▓█▒  ░ ░ ▓██▓ ░ 
  ▒ ▓███▀ ░░██████▒░██░░▒█░      ▒██▒ ░ 
  ░ ░▒ ▒  ░░ ▒░▓  ░░▓   ▒ ░      ▒ ░░   
    ░  ▒   ░ ░ ▒  ░ ▒ ░ ░          ░    
  ░          ░ ░    ▒ ░ ░ ░      ░      
  ░ ░          ░  ░ ░              
  ░                               
```

**Browser-based ASCII Art VJ Software**

*A project by [crashserver.fr](https://crashserver.fr)*

---

## STATUS: ALPHA 

So basically this is the js port of :
https://github.com/CrashServer/clift_terminal


⚠️ **This software is in active development.** 
Expect breaking changes, experimental features, and a lot of digital glitch. 
More features are coming! Probably breaking the software. It usually works but expect strange behaviors when playing a lot with post-fx. transitions are not perfect atm either. There is a full mode which is pretty cool. 
---

If you want to support : https://coff.ee/crashserver


```
    ╔══════════════════════════════════════╗
    ║  CLIFT: future proof, ascii vjing    ║  
    ║  for yesterday                       ║
    ╚══════════════════════════════════════╝
```


## 🔥 Features

### **Visual Engine**
- **180+ ASCII Art Scenes** - From geometric patterns to glitch effects
- **9 Experimental Render Modes** - Including 3D ASCII with depth mapping
- **17 Post-Processing Effects** - Blur, glitch, emboss, and more
- **Dual Deck System** - VJ workflow with crossfader mixing
- **Real-time Audio Visualization** - Microphone input with beat detection
- **glowy stuff**

###  EXPERIMENTAL :  **Render Modes**
- **ASCII** - Classic terminal-style rendering
- **Surface** - Height-mapped 3D surfaces
- **Mesh** - Connected wireframe rendering  
- **Particles** - Dynamic particle systems
- **Lines** - Flowing line art
- **Dots** - Pointillism effects
- **Waves** - Fluid wave simulations
- **Plasma** - Retro plasma effects
- **3D ASCII** - Characters with Z-depth and connections ✨

### **Audio Integration**
- **Microphone Input** - Real-time audio analysis
- **4-Band FFT** - Bass, Low, Mid, High frequency visualization
- **Beat Detection** - Automatic rhythm analysis

---

## 🌐 Browser Compatibility
### **Recommended: Firefox** 🦊
CLIFT Web is optimized for **Mozilla Firefox** and provides the best performance and compatibility. It should maybe work on **chrome** but might not. Especially audio reactivity. 

## 🎛️ Controls & Usage
### **Basic VJ Workflow**
1. **Enable Audio** - Click the microphone button (allow browser permissions) - important !!!
2. **Select Scenes** - Use category/scene controls for each deck
3. **Choose Render Mode** - Toggle through 9 different rendering styles
4. **Mix Decks** - Use crossfader or trigger transitions
5. **Apply Effects** - Add PostFX for glow and color grading

### **Keyboard Shortcuts**
- **Space** - Play/Pause
- **T** - Trigger transition
- **A** - Toggle audio
- **F** - Toggle fullscreen
- **R** - Start/stop recording

### **Full Auto Mode**
Enables a random thing that goes exploring all possibilies. 
- **Scenes** - Automatic scene changes
- **Effects** - Cycling through visual effects  
- **Crossfade** - Animated deck transitions
- **PostFX** - Color and glow automation
- **Experimental** - Render mode cycling
- **Colors** - Palette automation
- **Subdivision** - Timing control (1-16 beats)

---
## 🛠️ Architecture

### **Core Technology**
- **Pure JavaScript** - No frameworks, no dependencies
- **Web Audio API** - Real-time audio processing
- **Canvas 2D** - High-performance ASCII rendering
- **WebGL PostFX** - Hardware-accelerated effects
- **MediaRecorder** - Built-in video recording ** more or less reliable

### **File Structure**
```
clift-web/
├── index.html              # Main application
├── clift-engine.js          # Core rendering engine
├── clift-scenes-final.js    # 190+ scene definitions
├── clift-effects.js         # Post-processing effects
├── clift-audio-enhanced.js  # Audio visualization
├── clift-postfx-clean.js    # WebGL post-effects
├── clift-recorder.js        # Video recording
├── clift-websocket.js       # Live coding support
└── clift-mobile.js          # Mobile optimizations
```


## 🎨 Scene Development
### **Adding Custom Scenes**
Scenes follow this pattern:
```javascript
CLIFTScenes[sceneNumber] = function(buffer, width, height, time, params) {
    // buffer: 2D array of characters [y][x]
    // width, height: Display dimensions  
    // time: Milliseconds since start
    // params: { audioData, beatPhase, bpm, deckParams, ... }
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Generate ASCII character based on position and time
            buffer[y][x] = getCharacterForPosition(x, y, time);
        }
    }
};
```

### **Audio-Reactive Parameters**
```javascript
// Access audio data
const bassLevel = params.audioData.bass;    // 0.0 - 1.0
const beatPhase = params.beatPhase;         // 0.0 - 1.0 (beat cycle)
const bpm = params.bpm;                     // Beats per minute

// Beat detection
if (beatPhase < 0.1) {
    // On beat - trigger effects
}
```

---
## 🌊 What's Coming

- **Better Recording** - yeah it sucks for the moment
- **MIDI Controller Support** - Hardware VJ controller integration
- **Advanced Scenes** - More complex visualizations
- **Mobile App** - Dedicated mobile interface
- **WebSocket** - it already more or less there, for live coding text support for example

## 🐛 Known Issues
A lot atm. 

---

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork** the repository
2. **Create** a feature branch
3. **Test** in Firefox thoroughly  
4. **Submit** a pull request

### **Areas for Contribution**
- New ASCII art scenes
- Performance optimizations
- Mobile compatibility improvements
- Bug fixes and testing

---

## 📜 License

**MIT License** - See LICENSE file for details.

---

## 🔗 Links

- **Project**: [crashserver.fr](https://crashserver.fr)
- **Issues**: Report bugs and feature requests
- **Wiki**: Detailed documentation and tutorials

---

## 💫 Credits

**Developed by the crashserver.fr team**
**Happy VJing!** 🎵✨
