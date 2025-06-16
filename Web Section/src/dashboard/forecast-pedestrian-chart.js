/**
 * dashboard/forecast-pedestrian-chart.js
 * ---------------------------------------
 * This script fetches the forecasted number of pedestrians
 * from Firebase Realtime Database and displays it as a Line Chart.
 * Assumes global Firebase has already been initialized (firebase.js).
 */

// --- 1. Access Existing Firebase DB Instance ---
const db = window.firebaseDb; // כבר מאותחל מראש

// --- 2. Chart Setup ---

const ctx = document.getElementById("forecast-pedestrian-chart").getContext("2d");
const color = "#3b82f6";

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],  // Will be updated dynamically
    datasets: [{
      label: "Forecasted Pedestrians",
      data: [],
      borderColor: color,
      backgroundColor: color,
      fill: false,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 6
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Pedestrians Forecast",
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Pedestrians" }
      },
      x: {
        title: { display: true, text: "Time" }
      }
    }
  }
});

// --- 3. Fetch Data from Firebase ---

function fetchPedestrianForecast() {
  db.ref("Web_Data/padestrian_forecast").once("value")
    .then(snapshot => {
      const forecast = snapshot.val();
      if (!forecast || typeof forecast !== "object") return;

      
      const sortedHours = Object.keys(forecast).sort((a, b) => {
        const toMinutes = str => {
          const [h, m] = str.split(":").map(Number);
          return h * 60 + m;
        };
        const adjust = mins => (mins < 240 ? mins + 1440 : mins);  
        return adjust(toMinutes(a)) - adjust(toMinutes(b));
      });

      const labels = sortedHours;
      const values = sortedHours.map(hour => forecast[hour]);

      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.update();
    })
    .catch(error => {
      console.error("❌ Error fetching pedestrian forecast:", error);
    });
}


// --- 4. Initial Load & Refresh Every Hour ---
fetchPedestrianForecast();
setInterval(fetchPedestrianForecast, 3600000);
