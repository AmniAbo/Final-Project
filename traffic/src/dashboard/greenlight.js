// dashboard/greenlight.js
// Retrieves the currently active (green) traffic light from Firebase
// and updates the UI element with ID #green-light-info accordingly.

const db = window.firebaseDb; // Firebase reference injected globally
const ROOT = '/data';             // Root path in Realtime Database

/**
 * Updates the "Current Green Light" card on the dashboard
 * based on the live traffic light states from Firebase.
 * 
 * @param {Object} data - The latest snapshot from the database.
 */
function updateGreenLightCard(data) {
  const lightKeys = [
    'traffic_light_lane_1',
    'traffic_light_lane_2',
    'traffic_light_lane_3',
    'traffic_light_lane_4',
    'traffic_light_pedestrian'
  ];

  const greenText = {
    traffic_light_lane_1: 'Lane 1',
    traffic_light_lane_2: 'Lane 2',
    traffic_light_lane_3: 'Lane 3',
    traffic_light_lane_4: 'Lane 4',
    traffic_light_pedestrian: 'Pedestrian Crossing'
  };

 
  const greenKey = lightKeys.find(key => data[key] === 'green');
  const greenInfoEl = document.getElementById('green-light-info');
  if (greenInfoEl) {
    greenInfoEl.textContent = greenKey ? greenText[greenKey] : 'None';
  }


  lightKeys.forEach(key => {
    const dotId = `dot-${key}`;
    const dotEl = document.getElementById(dotId);
    if (!dotEl) return;

    const status = data[key];
    dotEl.classList.remove('bg-red-500', 'bg-green-500', 'bg-gray-400');
    if (status === 'green') {
      dotEl.classList.add('bg-green-500');
    } else if (status === 'red') {
      dotEl.classList.add('bg-red-500');
    } else {
      dotEl.classList.add('bg-gray-400');
    }
  });


  const updatedEl = document.getElementById('greenlight-updated');
  if (updatedEl) {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    updatedEl.textContent = `Last updated: ${formattedTime}`;
  }
}

/**
 * Fetches the latest traffic light status from Firebase and updates the card.
 */
function fetchGreenLight() {
  if (!db) return;

  db.ref(ROOT).once('value')
    .then(snapshot => {
      const d = snapshot.val();
      if (!d) return;
      updateGreenLightCard(d);
    })
    .catch(err => console.error('Firebase green light fetch error:', err));
}

// Initial fetch
fetchGreenLight();

// Re-fetch every 10 seconds to keep the card updated
setInterval(fetchGreenLight, 10_000);

// Update the "last updated" timestamp on the card
const updatedEl = document.getElementById('greenlight-updated');
if (updatedEl) {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  updatedEl.textContent = `Last updated: ${formattedTime}`;
} else {
  console.warn("⚠️ greenlight-updated element not found");
}
