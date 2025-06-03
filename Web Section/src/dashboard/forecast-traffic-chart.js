/**
 * @file forecast-traffic-line.js
 * @description Displays a bar chart representing traffic forecast levels.
 * Data is fetched from the 'forecast_traffic' array in Firebase.
 * The chart updates automatically every hour (3600000 ms).
 */

// === 1. Data Source and Canvas Setup ===

/** Reference to the Firebase Realtime Database, assumed to be initialized globally. */
const db = window.firebaseDb;

/** Canvas context for rendering the traffic forecast chart. */
const ctx = document.getElementById('forecast-traffic-chart').getContext('2d');

// === 2. Conversions Between Strings and Numeric Levels ===

/**
 * Converts a textual traffic level ('low', 'medium', 'high') to a numeric value.
 * This is used to represent the values on the Y-axis.
 *
 * @param {string} level - Traffic level as a string.
 * @returns {number} Corresponding numeric value: 1 for 'low', 2 for 'medium', 3 for 'high', 0 otherwise.
 */
const trafficToNumber = level =>
  level === 'low' ? 1 : level === 'medium' ? 2 : level === 'high' ? 3 : 0;

/**
 * Converts a textual traffic level to a bar color.
 *
 * @param {string} level - Traffic level as a string.
 * @returns {string} Corresponding background color.
 */
const trafficToColor = level =>
  level === 'low' ? 'rgba(34, 197, 94, 0.7)' :      // Green
  level === 'medium' ? 'rgba(234, 179, 8, 0.7)' :   // Yellow
  level === 'high' ? 'rgba(239, 68, 68, 0.7)' :     // Red
  'rgba(107, 114, 128, 0.7)';                       // Gray fallback

/**
 * Mapping from numeric values to readable labels for the Y-axis ticks.
 * Used to display 'Low', 'Medium', or 'High' on the chart.
 */
const numberToLabel = {
  1: 'Low',
  2: 'Medium',
  3: 'High'
};

// === 3. Chart Creation ===

/**
 * Initializes a bar chart using Chart.js to display forecasted traffic levels.
 */
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: Array.from({ length: 5 }, (_, i) => `Hour ${i + 1}`),
    datasets: [{
      label: 'Forecasted Traffic',
      data: [],             // Will be updated with numeric values
      backgroundColor: [],  // Will be updated dynamically
      borderColor: [],      // Will be set to match the background color
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Traffic Forecast',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          stepSize: 1,
          callback: value => numberToLabel[value] || ''
        },
        title: {
          display: true,
          text: 'Traffic Level'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  }
});

// === 4. Firebase Data Fetching and Chart Update ===

/**
 * Fetches traffic forecast data from Firebase and updates the chart accordingly.
 * It updates both the data and the colors of the bars.
 */
function fetchTrafficForecast() {
  db.ref('Web_Data/density_forecast').once('value')
    .then(snapshot => {
      const obj = snapshot.val();
      if (!obj || typeof obj !== 'object') return;

     
      const sortedHours = Object.keys(obj).sort();

   
      const labels = sortedHours; 
      const levels = sortedHours.map(hour => obj[hour]); 
      const numericData = levels.map(trafficToNumber);
      const backgroundColors = levels.map(trafficToColor);
      const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

    
      chart.data.labels = labels;
      chart.data.datasets[0].data = numericData;
      chart.data.datasets[0].backgroundColor = backgroundColors;
      chart.data.datasets[0].borderColor = borderColors;
      chart.update();
    })
    .catch(err => console.error('❌ Traffic forecast fetch error:', err));
}


// Initial fetch and periodic refresh
fetchTrafficForecast();
setInterval(fetchTrafficForecast, 3600000);  // Refresh every hour
