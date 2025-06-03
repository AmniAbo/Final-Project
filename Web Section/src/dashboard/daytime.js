/**
 * dashboard/daytime.js
 * ---------------------
 * This script fetches and displays the current day of the week
 * and the current time from Firebase Realtime Database.
 *
 * It updates the dashboard card with the latest values
 * every 10 seconds and displays a "Last updated" timestamp.
 */

// Reference to the Firebase Realtime Database (injected globally)
const db = window.firebaseDb;

// DOM Elements – elements inside the "Day & Time" dashboard card
const dayEl      = document.getElementById("daytime-day");      // Element for displaying current day
const timeEl     = document.getElementById("daytime-time");     // Element for displaying current time
const updatedEl  = document.getElementById("daytime-updated");  // Timestamp showing last update

/**
 * Updates the content of the "Day & Time" card using data from Firebase.
 *
 * @param {Object} data - Object containing 'day' and 'time' fields.
 */
function updateDayTimeCard(data) {
  if (!data || !dayEl || !timeEl || !updatedEl) return;

  const day  = data.day  ?? "—";
  const time = data.time ?? "—";

  // Capitalize first letter of the day
  dayEl.textContent = day.charAt(0).toUpperCase() + day.slice(1);
  timeEl.textContent = time;

  // Show last updated time
  const now = new Date();
  updatedEl.textContent = `Last updated: ${now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

/**
 * Fetches the current 'day' and 'time' values from Firebase.
 * This function is executed once on page load and then every 10 seconds.
 */
function fetchDayTimeData() {
  if (!db) return;

  db.ref('Web_Data/Date').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      updateDayTimeCard(data);
    })
    .catch(err => console.error("❌ Firebase daytime fetch error:", err));
}

// Initial fetch
fetchDayTimeData();

// Refresh every 10 seconds
setInterval(fetchDayTimeData, 10_000);
