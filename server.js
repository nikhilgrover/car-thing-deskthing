import express from 'express';
import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'web-kiosk')));

function runAppleScript(script) {
  return new Promise((resolve, reject) => {
    exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

// Macro & Media Actions Handler
app.post('/api/action', async (req, res) => {
  const { action, value } = req.body;
  console.log(`[ACTION TRIGGERED] ${action}`, value || '');

  try {
    switch (action) {
      case 'media-toggle':
        await runAppleScript('tell application "Spotify" to playpause');
        break;
      case 'media-next':
        await runAppleScript('tell application "Spotify" to next track');
        break;
      case 'media-prev':
        await runAppleScript('tell application "Spotify" to previous track');
        break;
      case 'volume-up':
        await runAppleScript('set volume output volume ((output volume of (get volume settings)) + 5)');
        break;
      case 'volume-down':
        await runAppleScript('set volume output volume ((output volume of (get volume settings)) - 5)');
        break;
      case 'mute-mic':
        await runAppleScript('set volume input volume (if (input volume of (get volume settings)) > 0 then 0 else 100)');
        break;
      case 'open-terminal':
        await runAppleScript('tell application "Terminal" to activate');
        break;
      case 'workspace':
        exec('open /Users/nikhil/workspace');
        break;
      case 'git-status':
        exec('osascript -e \'display notification "Checking workspace git status..." with title "DeskThing Macro"\'');
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
    res.json({ success: true, action });
  } catch (error) {
    console.error('Action failed:', error);
    res.status(500).json({ error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(`🚗 Car Thing DeskThing Web Kiosk Running on port ${port}!`);
  console.log(`🌐 Local URL: http://localhost:${port}`);
  console.log(`======================================================\n`);
});
