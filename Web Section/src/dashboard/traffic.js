/* dashboard/traffic.js
   – Displays the current traffic density forecast
     by retrieving data from Firebase Realtime Database.
*/

const db   = window.firebaseDb;  // Firebase DB reference injected globally

// Safety check: Ensure Firebase is loaded
if (!db) {
  console.error('firebaseDb is undefined – check firebase.js load order');
}

/* ---------- DOM ELEMENT REFERENCES ---------- */
const currentEl  = document.getElementById('traffic-current');   // Current traffic density element
const updatedEl  = document.getElementById('traffic-updated');   // "Last updated" time element

/**
 * Updates the traffic density card on the dashboard
 * using a colored dot for severity.
 *
 * @param {string} level - The current traffic level (e.g., "low", "medium", "high").
 */
function updateTrafficCard(level) {
  if (!currentEl || !updatedEl) return;

  const normalized = (level || 'unknown').toLowerCase();
  currentEl.innerHTML = renderWithDot(normalized);

  const now = new Date();
  updatedEl.textContent = `Last updated: ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

/**
 * Renders a textual traffic level (e.g., "Low") along with
 * a colored dot indicator (green/yellow/red) based on severity.
 *
 * @param {string} level - The traffic level ("low", "medium", "high").
 * @returns {string} - HTML string containing a colored dot and label.
 */
function renderWithDot(level) {
  const safe = ['low', 'medium', 'high'];
  if (!safe.includes(level)) return '—';

  const dotClass = `status-dot status-${level}`;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return `<span class="${dotClass}"></span>${label}`;
}

/**
 * Fetches traffic forecast data from Firebase and updates the UI.
 */
function fetchTrafficData() {
  if (!db) return;

  db.ref('Web_Data/density_forecast').once('value')
    .then(snapshot => {
      const forecastObj = snapshot.val();
      if (!forecastObj || typeof forecastObj !== 'object') {
        console.warn('No forecast data available');
        return;
      }

      
      const sortedKeys = Object.keys(forecastObj).sort((a, b) => {
        const parseTime = timeStr => {
          const [h, m] = timeStr.split(':').map(Number);
          return h * 60 + m;
        };

        const adjust = mins => (mins < 240 ? mins + 1440 : mins);  
        return adjust(parseTime(a)) - adjust(parseTime(b));
      });

      const currentHour = sortedKeys[0];  
      const currentForecast = forecastObj[currentHour];

      updateTrafficCard(currentForecast);
    })
    .catch(err => console.error('Firebase traffic forecast fetch error:', err));
}


// Initial load
fetchTrafficData();

// Re-fetch data every 10 seconds
setInterval(fetchTrafficData, 10_000);
