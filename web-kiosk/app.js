/**
 * Car Thing Kiosk Client
 * Controls media, live clock, weather, and sends macro triggers to Mac server.
 */

function updateClock() {
  var d = new Date();
  var hours = d.getHours();
  var minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  var h12 = hours % 12 || 12;

  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var clockEl = document.getElementById('clock-time');
  var ampmEl = document.getElementById('clock-ampm');
  var dateEl = document.getElementById('date-label');

  if (clockEl) clockEl.textContent = h12 + ':' + minutes;
  if (ampmEl) ampmEl.textContent = ampm;
  if (dateEl) dateEl.textContent = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
}

function fetchWeather() {
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=40.6844&longitude=-73.9788&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto';
  
  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data || !data.current) return;
      var temp = Math.round(data.current.temperature_2m);
      var max = Math.round(data.daily.temperature_2m_max[0]);
      var min = Math.round(data.daily.temperature_2m_min[0]);

      var tEl = document.getElementById('weather-temp');
      var hlEl = document.getElementById('weather-hilo');
      if (tEl) tEl.textContent = temp + '°';
      if (hlEl) hlEl.textContent = 'H: ' + max + '° L: ' + min + '°';
    })
    .catch(function (err) {
      console.warn('Weather fetch error:', err);
    });
}

function sendAction(action) {
  fetch('/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: action })
  }).catch(function (err) {
    console.error('Failed to send action:', err);
  });
}

// Initial calls and intervals
updateClock();
setInterval(updateClock, 1000);

fetchWeather();
setInterval(fetchWeather, 5 * 60 * 1000);
