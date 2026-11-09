# 🚗 Spotify Car Thing (Superbird) DeskThing & BridgeThing WebApp

Transform your Spotify Car Thing into a high-performance desktop companion featuring:
1. **Universal Media Controller**: Real-time track metadata, album art, progress bar, and play/pause/skip for **Spotify, YouTube, Apple Music, and Podcasts** using `@bridgething/client`.
2. **Hardware & Touch Macro Pad**: Map the 4 top preset buttons, rotary dial, and touchscreen keys to macOS shortcuts (mic mute, terminal, workspace launcher, and git status).
3. **800 × 480 IPS Web Kiosk**: Real-time digital clock, Brooklyn Open-Meteo live weather, and live NYC MTA subway status (Atlantic Av - Barclays Ctr lines 2, 3, 4, 5, B, D, N, Q, R).

---

## 📱 Hardware Specifications

* **Device**: Spotify Car Thing (Superbird)
* **Firmware**: BridgeThing (Mainline Linux, U-Boot, Chromium cast_shell, Panfrost GPU)
* **Processor**: Amlogic S905D2 Quad-Core ARM Cortex-A53 @ 1.8 GHz
* **Display**: 3.97" 800 × 480 IPS color capacitive touchscreen (60 Hz)
* **Controls**:
  * 1 × Heavy Aluminum Rotary Dial with push button (Volume / Play-Pause)
  * 1 × Front "Back / M" tactile button
  * 4 × Top preset buttons (Hardware Macros 1–4)
  * 4 × Beamforming microphone array
* **Connectivity**: Bluetooth 5.0 (BLE / RFCOMM / iAP2) + USB-C

---

## 📦 Building the BridgeThing WebApp Package

To build the optimized package:

```bash
cd /Users/nikhil/workspace/car-thing-deskthing
npm install
npm run build
```

The build process:
* Bundles `src/app.js` using `esbuild` for Chromium 100+.
* Copies `manifest.json`, `index.html`, `styles.css`, and `icon.svg` into `dist/`.
* Packages everything into `dist/deskthing-kiosk.zip`.

---

## 📲 Installing on Your Car Thing

When you are ready to load the package onto your device:

1. Connect your Car Thing to your laptop via USB-C or turn on Bluetooth.
2. In **Google Chrome**, open **[bridgething.com/device](https://bridgething.com/device)**.
3. Click **Connect** and select your Car Thing from the WebUSB / WebBluetooth list.
4. Choose **Install Local App / Upload Zip** and select:
   `/Users/nikhil/workspace/car-thing-deskthing/dist/deskthing-kiosk.zip`
5. The app will install onto the device and appear directly in your launcher grid with the custom DeskThing icon!

---

## 🖥️ Companion Server & Macro Actions

The Node.js companion server runs locally on your Mac to execute media controls, AppleScripts, and macro actions triggered from the Car Thing.

```bash
npm start
```

### Hardware Control Mappings

| Control | Input | Action |
| :--- | :--- | :--- |
| **Rotary Dial Turn** | `wheel` (deltaX/Y) | Universal Volume Up / Down (+/- 5%) |
| **Rotary Dial Press** | `Enter` key | Universal Play / Pause Toggle |
| **Preset 1** | Top button `1` / Touch | Mute Mac Microphone |
| **Preset 2** | Top button `2` / Touch | Launch / Focus macOS Terminal |
| **Preset 3** | Top button `3` / Touch | Open `/Users/nikhil/workspace` |
| **Preset 4** | Top button `4` / Touch | Desktop notification with Git status |
| **Front Button** | Back / `m` | Return to BridgeThing Launcher Grid |

---

## 📄 License

MIT © [Nikhil Grover](https://github.com/nikhilgrover)
