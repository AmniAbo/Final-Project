/* dashboard/weather.js
   – Retrieves "severe weather" status and current temperature
     from Firebase Realtime Database and updates the weather card.
*/

const db   = window.firebaseDb;  // Firebase reference injected globally
const ROOT = 'Web_Data/weather'; 

// Safety check: Log if Firebase is not defined
if (!db) {
  console.error('firebaseDb is undefined – check firebase.js load order');
}

/* ---------- DOM ELEMENT REFERENCES ---------- */
const statusEl   = document.getElementById('weather-status');     // Weather status text
const tempEl     = document.getElementById('weather-temp');       // Temperature display
const updatedEl  = document.getElementById('weather-updated');    // "Last updated" timestamp
const iconBox    = document.getElementById('weather-icon');       // Optional visual icon box (for color)

/**
 * Updates the weather card based on the latest data
 * pulled from Firebase. Displays whether conditions are
 * severe or good and shows the temperature.
 *
 * @param {Object} data - Realtime data snapshot from Firebase.
 */
function updateCard(data) {
  if (!statusEl || !tempEl || !updatedEl || !iconBox) return;

  const severe = data.severe_weather === "true";  // ✅ use string comparison if stored as string
  const temp   = data.temp ?? '--';               // ✅ field is now "temp" not "temperature"

  // Determine status level and label
  const level = severe ? 'high' : 'low';
  const label = severe ? 'Severe weather' : 'Good';

  // Render colored dot and status label
  statusEl.innerHTML = `<span class="status-dot status-${level}"></span>${label}`;

  // Optional background or icon box class
  iconBox.classList.remove('green', 'red');
  iconBox.classList.add(severe ? 'red' : 'green');

  // Update temperature display
  tempEl.textContent = `${temp}°C`;

  // Update "Last updated" timestamp
  const now = new Date();
  updatedEl.textContent =
    `Last updated: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

/* ---------- FETCH WEATHER DATA ---------- */
function fetchWeather() {
  if (!db) return;

  db.ref(ROOT).once('value')
    .then(snap => {
      const weatherData = snap.val();
      if (!weatherData) return;
      updateCard(weatherData);
    })
    .catch(err => console.error('Firebase weather fetch error:', err));
}

// Initial data fetch
fetchWeather();

// Auto-refresh every 10 seconds
setInterval(fetchWeather, 10_000);
