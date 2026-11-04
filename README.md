# 🚗 Spotify Car Thing (Superbird) DeskThing & Web Kiosk

Transform your discontinued Spotify Car Thing into a high-performance desktop companion featuring:
1. **DeskThing Media Hub**: Spotify & Apple Music controls, live album art, track scrub, and physical rotary volume knob.
2. **Hardware & Touch Macro Pad**: Map the 4 top preset buttons, rotary dial, and touchscreen keys to macOS shortcuts, mic mute, app launchers, and terminal commands.
3. **800 × 480 IPS Web Kiosk**: Real-time digital clock, Open-Meteo weather, and live MTA subway arrivals (Atlantic Av - Barclays Ctr).

---

## 📱 Hardware Specifications

* **Codename**: Superbird
* **Processor**: Amlogic S905D2 Quad-Core ARM Cortex-A53 @ 1.8 GHz
* **Display**: 3.97" 800 × 480 IPS color capacitive touchscreen (60 Hz)
* **Controls**:
  * 1 × Heavy Aluminum Rotary Dial with click button
  * 1 × Front "Back" tactile button
  * 4 × Top preset buttons
  * 4 × Beamforming microphone array
* **Connectivity**: USB 2.0 Type-C (Power + RNDIS/Ethernet data)

---

## ⚡ Flashing the Device (One-Time Setup)

Your device is currently detected in **Amlogic USB Burning Mode** (`GX-CHIP` / `0x1b8e:0xc003`).

### Web Flasher (Recommended)

1. Open **Google Chrome** on your Mac.
2. Navigate to **[terbium.app](https://terbium.app)**.
3. Click **Connect** and select **GX-CHIP** from the Chrome WebUSB dialog.
4. When prompted by the flasher, select the **DeskThing** firmware image.
5. Click **Flash Device**. The process takes approximately 2–3 minutes.
6. Once completed, the Car Thing will reboot into its new custom operating system!

*(If you ever need to enter USB Burn Mode again: unplug USB, hold **Button 1 and Button 4** on the top edge, and plug USB back in).*

---

## 🖥️ Companion Server & Macro Engine

The companion server runs locally on your Mac to execute media controls, AppleScripts, and macro actions triggered from the Car Thing.

### 1. Installation
```bash
cd /Users/nikhil/workspace/car-thing-deskthing
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Features & Macro Actions

| Action | Control | Mac Operation |
| :--- | :--- | :--- |
| **Play / Pause** | Front button / Touch | Toggles Spotify playback |
| **Volume Knob** | Rotary Dial | Adjusts macOS master volume (+/- 5%) |
| **Mute Mic** | Top Button 1 / Touch | Instantly toggles macOS system input volume |
| **Terminal** | Top Button 2 / Touch | Activates macOS Terminal |
| **Code Workspace**| Top Button 3 / Touch | Opens `/Users/nikhil/workspace` |
| **Git Status** | Top Button 4 / Touch | Desktop notification with git status |

---

## 📄 License

MIT © [Nikhil Grover](https://github.com/nikhilgrover)
