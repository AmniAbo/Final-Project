/* dashboard/pedestrians.js
   – Displays the current number of pedestrians
     by retrieving data from Firebase Realtime Database.
*/

const db = window.firebaseDb; // Firebase database reference

/* ---------- DOM ELEMENT REFERENCES ---------- */
const currentEl = document.getElementById('pedestrian-current');   // Element for live pedestrian count
const updatedEl = document.getElementById('pedestrian-updated');   // Timestamp display element

/**
 * Updates the pedestrian card on the dashboard using data fetched from Firebase.
 *
 * @param {number|null|undefined} count - Number of pedestrians detected.
 */
function updatePedestrianCard(count) {
  if (!currentEl || !updatedEl) return;

  const current = count ?? 0;
  currentEl.textContent = `${current}`;

  const now = new Date();
  updatedEl.textContent = `Last updated: ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

/**
 * Fetches pedestrian data from Firebase and updates the UI.
 */
function fetchPedestrianData() {
  if (!db) return;

  db.ref('Web_Data').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;

      const count = data.Ped_Num;
      updatePedestrianCard(count);
    })
    .catch(err => console.error('Firebase pedestrian fetch error:', err));
}

// Initial fetch
fetchPedestrianData();

// Refresh data every 10 seconds
setInterval(fetchPedestrianData, 10_000);
