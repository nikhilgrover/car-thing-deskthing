import { BridgethingClient } from '@bridgething/client';

// DOM elements
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const appBadge = document.getElementById('app-badge');
const albumArt = document.getElementById('album-art');
const albumArtFallback = document.getElementById('album-art-fallback');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const trackAlbum = document.getElementById('track-album');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const progressFill = document.getElementById('progress-fill');
const btnPrev = document.getElementById('btn-prev');
const btnPlayPause = document.getElementById('btn-play-pause');
const btnNext = document.getElementById('btn-next');
const playIcon = document.getElementById('play-icon');
const toastEl = document.getElementById('toast');

// State tracking
let client = null;
let isPlaying = false;
let currentPositionMs = 0;
let totalDurationMs = 0;
let progressTimer = null;
let lastArtworkId = null;

// Helper to format ms into mm:ss
function formatTime(ms) {
  if (!ms || isNaN(ms) || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Show a temporary HUD toast
let toastTimeout = null;
function showToast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 1800);
}

// Update Play/Pause button graphic
function updatePlayIcon(playing) {
  isPlaying = playing;
  if (!playIcon) return;
  if (playing) {
    // Show Pause bars
    playIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16" rx="1"></rect>
      <rect x="14" y="4" width="4" height="16" rx="1"></rect>
    `;
  } else {
    // Show Play triangle
    playIcon.innerHTML = `
      <polygon points="6 4 20 12 6 20 6 4"></polygon>
    `;
  }
}

// Progress bar tick
function startProgressTimer() {
  clearInterval(progressTimer);
  if (!isPlaying) return;
  progressTimer = setInterval(() => {
    if (isPlaying && totalDurationMs > 0) {
      currentPositionMs += 500;
      if (currentPositionMs > totalDurationMs) currentPositionMs = totalDurationMs;
      updateProgressDisplay();
    }
  }, 500);
}

function updateProgressDisplay() {
  if (timeCurrent) timeCurrent.textContent = formatTime(currentPositionMs);
  if (timeTotal) timeTotal.textContent = formatTime(totalDurationMs);
  if (progressFill && totalDurationMs > 0) {
    const pct = Math.min(100, Math.max(0, (currentPositionMs / totalDurationMs) * 100));
    progressFill.style.width = `${pct}%`;
  }
}

// Handle player snapshot updates from BridgeThing
function handlePlayerState(snapshot) {
  if (!snapshot) return;
  const state = snapshot.state || snapshot;
  const track = state.track;
  const activeApp = snapshot.activeApp;

  // Active App Name Badge
  if (appBadge) {
    if (activeApp && activeApp.name) {
      appBadge.textContent = activeApp.name;
    } else if (track && track.uri) {
      appBadge.textContent = track.uri.startsWith('spotify') ? 'Spotify' : 'Media';
    } else {
      appBadge.textContent = 'Universal Player';
    }
  }

  // Track metadata
  if (track) {
    if (trackTitle) trackTitle.textContent = track.title || 'Unknown Title';
    if (trackArtist) trackArtist.textContent = track.artist || track.albumArtist || 'Unknown Artist';
    if (trackAlbum) trackAlbum.textContent = track.album || '';
    totalDurationMs = track.durationMs || 0;

    // Artwork handling
    if (track.artworkId && track.artworkId !== lastArtworkId) {
      lastArtworkId = track.artworkId;
      fetchArtwork(track.artworkId);
    } else if (!track.artworkId) {
      resetArtwork();
    }
  } else {
    if (trackTitle) trackTitle.textContent = 'No Media Playing';
    if (trackArtist) trackArtist.textContent = 'Play audio on phone or laptop';
    if (trackAlbum) trackAlbum.textContent = 'Connected via Bluetooth';
    resetArtwork();
  }

  // Playback state & position
  const playback = state.playback;
  if (playback) {
    const playing = playback.state === 'playing' || playback.playing === true;
    updatePlayIcon(playing);
    if (playback.positionMs !== null && playback.positionMs !== undefined) {
      currentPositionMs = playback.positionMs;
    }
    updateProgressDisplay();
    if (playing) {
      startProgressTimer();
    } else {
      clearInterval(progressTimer);
    }
  }
}

// Fetch artwork bytes using client.asset.get
function fetchArtwork(id) {
  if (!client || !client.asset) return;
  client.asset.get({ id })
    .then(res => {
      if (res.ok && res.response && res.response.bytes) {
        const blob = new Blob([res.response.bytes], { type: res.response.mime || 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        if (albumArt) {
          albumArt.src = url;
          albumArt.style.display = 'block';
        }
        if (albumArtFallback) albumArtFallback.style.display = 'none';
      } else {
        resetArtwork();
      }
    })
    .catch(() => {
      resetArtwork();
    });
}

function resetArtwork() {
  if (albumArt) {
    albumArt.style.display = 'none';
    albumArt.src = '';
  }
  if (albumArtFallback) albumArtFallback.style.display = 'block';
  lastArtworkId = null;
}

// Initialize BridgeThing Client
function initBridgeThing() {
  try {
    client = new BridgethingClient();

    client.on(event => {
      if (event.type === 'open') {
        if (statusDot) statusDot.classList.remove('disconnected');
        if (statusText) statusText.textContent = 'BridgeThing Connected';
        // Request immediate snapshot
        client.player.stateGet()
          .then(res => {
            if (res.ok) handlePlayerState(res.response);
          })
          .catch(e => console.warn('Initial state error:', e));
      } else if (event.type === 'close') {
        if (statusDot) statusDot.classList.add('disconnected');
        if (statusText) statusText.textContent = 'Reconnecting...';
      }
    });

    // Subscribe to ongoing player events
    if (client.player) {
      client.player.onSnapshot(snapshot => {
        handlePlayerState(snapshot);
      });
      client.player.onDelta(delta => {
        if (delta && delta.playback) {
          if (delta.playback.playing !== undefined && delta.playback.playing !== null) {
            updatePlayIcon(delta.playback.playing);
          }
          if (delta.playback.positionMs !== undefined && delta.playback.positionMs !== null) {
            currentPositionMs = delta.playback.positionMs;
            updateProgressDisplay();
          }
        }
      });
    }
  } catch (err) {
    console.warn('BridgeThing client init fallback:', err);
    if (statusDot) statusDot.classList.add('disconnected');
    if (statusText) statusText.textContent = 'Standalone Mode';
  }
}

// Send macro / companion action
function sendAction(action) {
  showToast(`Macro: ${action}`);

  // Also try local companion server if accessible
  fetch('/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  }).catch(err => {
    console.log('Companion server fetch note:', err.message);
  });
}

// Media button actions
if (btnPlayPause) {
  btnPlayPause.addEventListener('click', () => {
    if (client && client.player) {
      if (isPlaying) {
        client.player.pause().catch(e => console.warn(e));
        updatePlayIcon(false);
      } else {
        client.player.resume().catch(e => console.warn(e));
        updatePlayIcon(true);
      }
    } else {
      sendAction('media-toggle');
      updatePlayIcon(!isPlaying);
    }
  });
}

if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    if (client && client.player) {
      client.player.skipPrev({ allowSeeking: true }).catch(e => console.warn(e));
    } else {
      sendAction('media-prev');
    }
  });
}

if (btnNext) {
  btnNext.addEventListener('click', () => {
    if (client && client.player) {
      client.player.skipNext().catch(e => console.warn(e));
    } else {
      sendAction('media-next');
    }
  });
}

// Touch Macro buttons
document.querySelectorAll('.macro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    if (action) sendAction(action);
  });
});

// Hardware Inputs: Rotary Wheel / Dial & Physical Presets
let wheelDebounce = null;
window.addEventListener('wheel', event => {
  // Use horizontal deltaX or deltaY from rotary dial
  const delta = event.deltaX || event.deltaY || 0;
  clearTimeout(wheelDebounce);
  wheelDebounce = setTimeout(() => {
    if (delta > 0) {
      showToast('Dial: Volume +');
      sendAction('volume-up');
    } else if (delta < 0) {
      showToast('Dial: Volume -');
      sendAction('volume-down');
    }
  }, 40);
});

// Hardware Keydown: Top Presets 1-4, Dial Click (Enter), Back (Escape), Mode (m)
window.addEventListener('keydown', event => {
  switch (event.key) {
    case '1':
      sendAction('mute-mic');
      break;
    case '2':
      sendAction('open-terminal');
      break;
    case '3':
      sendAction('workspace');
      break;
    case '4':
      sendAction('git-status');
      break;
    case 'Enter':
      // Rotary dial click -> Toggle Play/Pause
      if (btnPlayPause) btnPlayPause.click();
      break;
    case 'm':
      showToast('Launcher Menu');
      break;
    case 'Escape':
      showToast('Back');
      break;
  }
});

// Live Clock & Date
function updateClock() {
  const d = new Date();
  const hours = d.getHours();
  const minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const digitsEl = document.getElementById('clock-digits');
  const periodEl = document.getElementById('clock-period');
  const dateEl = document.getElementById('clock-date');

  if (digitsEl) digitsEl.textContent = `${h12}:${minutes}`;
  if (periodEl) periodEl.textContent = ampm;
  if (dateEl) dateEl.textContent = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

// Weather descriptions mapping from WMO codes
const weatherCodes = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  80: 'Slight Showers',
  81: 'Moderate Showers',
  82: 'Violent Showers',
  95: 'Thunderstorm'
};

// Live Weather (Brooklyn, NY)
function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=40.6844&longitude=-73.9788&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.current) return;
      const temp = Math.round(data.current.temperature_2m);
      const code = data.current.weather_code;
      const desc = weatherCodes[code] || 'Clear';
      const max = Math.round(data.daily.temperature_2m_max[0]);
      const min = Math.round(data.daily.temperature_2m_min[0]);

      const tempEl = document.getElementById('weather-temp');
      const descEl = document.getElementById('weather-desc');
      const hiloEl = document.getElementById('weather-hilo');

      if (tempEl) tempEl.textContent = `${temp}°`;
      if (descEl) descEl.textContent = desc;
      if (hiloEl) hiloEl.textContent = `H: ${max}° L: ${min}°`;
    })
    .catch(err => {
      console.warn('Weather fetch error:', err);
    });
}

// Start timers
updateClock();
setInterval(updateClock, 1000);

fetchWeather();
setInterval(fetchWeather, 5 * 60 * 1000);

// Initialize client
initBridgeThing();
