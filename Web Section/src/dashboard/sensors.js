// dashboard/sensors.js
// Monitors the connection status of ultrasonic sensors and the pedestrian camera
// by checking if relevant keys exist in the Firebase Realtime Database.

const db = window.firebaseDb;  // Global Firebase database reference

/**
 * Updates the "Sensors Status" card on the dashboard,
 * showing whether all ultrasonic sensors and the pedestrian camera
 * are currently reporting data.
 *
 * @param {Object} carDetection - Object containing ultrasonic sensor states.
 * @param {number|null|undefined} pedNum - Number of detected pedestrians (simulates face presence).
 */
function updateSensorCard(carDetection, pedNum) {
  // Check whether all ultrasonic sensor keys exist and are defined
  const requiredUltras = ['ultra1', 'ultra2', 'ultra3', 'ultra4'];
  const ultraOK = requiredUltras.every(k => carDetection && k in carDetection);

  // Check if pedestrian data exists
  const faceOK = pedNum !== undefined && pedNum !== null;

  // DOM references to display statuses
  const ultraEl = document.getElementById('sensor-ultras');
  const faceEl  = document.getElementById('sensor-face');
  const updatedEl = document.getElementById('sensors-updated');

  // Update ultrasonic sensor status
  if (ultraEl) {
    ultraEl.textContent = ultraOK ? '✅ Connected' : '❌ Disconnected';
    ultraEl.classList.toggle('text-green-600', ultraOK);
    ultraEl.classList.toggle('text-red-600', !ultraOK);
  }

  // Update pedestrian camera status
  if (faceEl) {
    faceEl.textContent = faceOK ? '✅ Connected' : '❌ Disconnected';
    faceEl.classList.toggle('text-green-600', faceOK);
    faceEl.classList.toggle('text-red-600', !faceOK);
  }

  // Update "Last checked" timestamp
  if (updatedEl) {
    const now = new Date();
    updatedEl.textContent = `Last checked: ${now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }
}

/**
 * Fetches the current sensor status from Firebase and updates the card.
 */
function fetchSensorStatus() {
  if (!db) return;

  db.ref('Web_Data').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;

      const carDetection = data.Car_Detection || {};
      const pedNum = data.Ped_Num;

      updateSensorCard(carDetection, pedNum);
    })
    .catch(err => console.error('Sensor check error:', err));
}

// Initial check on page load
fetchSensorStatus();

// Re-check every 10 seconds
setInterval(fetchSensorStatus, 10_000);
