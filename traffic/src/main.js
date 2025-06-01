// main.js
// Controls the 3D simulation of traffic lights, vehicles, and pedestrians
// using Firebase Realtime Database (v8). Adjusted to read from distinct Firebase paths.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js';

import { createRoad } from './components/road.js';
import { spawnCar, updateCars } from './components/cars.js';
import { spawnPedestrians, updatePedestrians } from './components/pedestrians.js';
import * as LightModule from './components/lights.js';
const { createTrafficLights, applyLightStates } = LightModule;

/* ---------- SCENE SETUP ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1020, 500);
document.getElementById('traffic-intersection-app').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(50, 50, 50);
scene.add(sun);

/* ---------- SCENE OBJECTS ---------- */
createRoad(scene, THREE);
createTrafficLights(scene, THREE);

const cars = [];
let peds = [];
let trafficState = {};

/* ---------- FIREBASE INTEGRATION ---------- */
const db = window.firebaseDb;

/**
 * Fetches data from multiple Firebase branches:
 * - Traffic lights from "data"
 * - Ultrasonic sensors from "Web_Data/Car_Detection"
 * - Pedestrian count from "Web_Data/Ped_Num"
 */
function fetchTraffic() {
  if (!db) {
    console.error('firebaseDb undefined');
    return;
  }
  const refLights = db.ref("data");
  const refUltras = db.ref("Web_Data/Car_Detection");
  const refPedNum = db.ref("Web_Data/Ped_Num");
  Promise.all([
    refLights.once('value'),
    refUltras.once('value'),
    refPedNum.once('value')
  ])
    .then(([snapLights, snapUltras, snapPed]) => {
      const lights = snapLights.val();
      const ultras = snapUltras.val();
      const face = snapPed.val();
      if (!lights || !ultras || face === null) return;
      // Traffic light state from /data
      trafficState = {
        traffic_light_lane_1: lights.traffic_light_lane_1,
        traffic_light_lane_2: lights.traffic_light_lane_2,
        traffic_light_lane_3: lights.traffic_light_lane_3,
        traffic_light_lane_4: lights.traffic_light_lane_4,
        traffic_light_pedestrian: lights.traffic_light_pedestrian
      };
      applyLightStates([
        trafficState.traffic_light_lane_4,
        trafficState.traffic_light_lane_2,
        trafficState.traffic_light_lane_3,
        trafficState.traffic_light_lane_1,
        trafficState.traffic_light_pedestrian
      ]);
      // Car logic based on /Web_Data/Car_Detection
      const ultraVals = [ultras.ultra1, ultras.ultra3, ultras.ultra2, ultras.ultra4];
      ultraVals.forEach((val, laneIdx) => {
        const laneCars = cars.filter(c => c.active && c.lane === laneIdx);

        if (val === 1) {
          if (laneCars.length === 0)
            cars.push(spawnCar(scene, THREE, laneIdx));
        } else {
          laneCars.forEach(c => {
            c.active = false;
            scene.remove(c.mesh);
          });
        }
      });
      // Pedestrian logic based on /Web_Data/Ped_Num
      peds.forEach(p => { if (p.active) scene.remove(p.mesh); });
      peds = [];
      if (face > 0) {
        const count = Math.min(Math.max(face, 1), 6);
        peds = spawnPedestrians(scene, THREE, count);
      }
    })
    .catch(err => console.error('Firebase error:', err));
}

// Initial data fetch
fetchTraffic();
setInterval(fetchTraffic, 10000);

/* ---------- ANIMATION LOOP ---------- */
function animate() {
  requestAnimationFrame(animate);

  // Vehicles now check the current trafficState for logic
  updateCars(cars, trafficState, 0.25);
  updatePedestrians(peds, 0.02);

  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ---------- RESPONSIVE RESIZING ---------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
});
window.addEventListener("DOMContentLoaded", () => {
  const helpBtn = document.getElementById("help-btn");
  const helpModal = document.getElementById("help-modal");
  const helpContent = document.getElementById("help-content");
  const helpClose = document.getElementById("help-close");

const getCurrentSection = () => {
  return document.getElementById("dashboard").classList.contains("hidden") ? "intersection" : "dashboard";
};

const helpTexts = {
  dashboard: `
    <p><strong>👀 What am I seeing?</strong><br>
    This is the main Dashboard screen. It shows real-time data about the traffic system using various sensors and forecasts.</p>

    <ul class="list-disc list-inside text-sm space-y-1 mt-2">
      <li><strong>Weather</strong>: Displays current weather and temperature. If extreme weather is detected (e.g., heavy rain or heat), it will be indicated clearly.</li>
      <li><strong>Traffic Density</strong>: Shows whether there is high, medium, or low vehicle congestion in real-time.</li>
      <li><strong>Pedestrians</strong>: Indicates the number of pedestrians currently detected at the intersection.</li>
      <li><strong>Sensors</strong>: Displays the connection and activity status of ultrasonic sensors and the pedestrian camera. If a sensor is offline, it will be marked.</li>
      <li><strong>Day & Time</strong>: Shows the current local day and time, used for time-aware decision logic.</li>
      <li><strong>Green Light</strong>: Highlights which traffic light is currently green. A green dot appears next to the active direction.</li>
      <li><strong>Traffic Forecast Chart</strong>: A line graph predicting traffic congestion for the next 5 hours, updated every hour.</li>
      <li><strong>Pedestrian Forecast Chart</strong>: A forecast graph estimating pedestrian flow for the next 5 hours, updated every hour.</li>
    </ul>

    <p class="mt-3"><strong>🔄 Update Frequency:</strong><br>
    All cards update automatically every <strong>10 seconds</strong>. Forecast charts update once every <strong>hour</strong>.</p>

    <p class="mt-3"><strong>ℹ️ General Help:</strong><br>
    Ensure your internet connection is active. Data is fetched in real-time from Firebase. If something looks wrong, try refreshing the page.</p>
  `,

  intersection: `
    <p><strong>👀 What am I seeing?</strong><br>
    This is a 3D simulation of a traffic intersection. It visualizes vehicle and pedestrian movement based on live sensor data.</p>

    <p><strong>🖱️ How to use it?</strong><br>
    You don't need to interact manually — the simulation updates automatically every 10 seconds based on real data. Traffic lights change state according to the system's logic.</p>

    <p><strong>⚠️ Troubleshooting:</strong><br>
    If the simulation does not display correctly, check your internet connection or reload the page. Ensure your browser supports WebGL.</p>
  `
};

helpBtn.addEventListener("click", () => {
  const section = getCurrentSection();
  helpContent.innerHTML = helpTexts[section];
  helpModal.classList.remove("hidden");
});

helpClose.addEventListener("click", () => {
  helpModal.classList.add("hidden");
});

});




