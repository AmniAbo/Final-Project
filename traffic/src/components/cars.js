// src/cars.js
// 🚗 Dynamic car creation and movement logic using THREE.js
// ✅ Cars now check their traffic light status using the trafficState object instead of relying on a central index

/**
 * Spawns a car in the specified lane and adds it to the 3D scene.
 * Each car has its direction, position, appearance, and associated traffic light.
 *
 * @param {THREE.Scene} scene - The THREE.js scene object
 * @param {typeof THREE} THREE - The THREE.js module
 * @param {number} laneIdx - The index of the lane (0 to 3)
 * @returns {Object} - Car object with mesh, direction, status, lane, and light binding
 */
export function spawnCar(scene, THREE, laneIdx) {
  const laneWidth  = 3.5;
  const roadLength = 100;
  const halfLen    = roadLength / 2;

  // X-position of each lane
  const laneCenters = [ -1.5 * laneWidth, -0.5 * laneWidth, 0.5 * laneWidth, 1.5 * laneWidth ];
  const xPos = laneCenters[laneIdx];

  // Materials for different parts of the car
  const colors     = [0xca2027, 0x207eca, 0x20ca5a, 0xca9920];
  const paintMat   = new THREE.MeshStandardMaterial({ color: colors[laneIdx], metalness: 0.6, roughness: 0.25 });
  const cabinMat   = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.2, roughness: 0.7, transparent: true, opacity: 0.4 });
  const chromeMat  = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0, roughness: 0.1 });
  const tyreMat    = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.9 });
  const rimMat     = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, metalness: 0.8, roughness: 0.3 });
  const lightFront = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 });
  const lightRear  = new THREE.MeshStandardMaterial({ color: 0xff0000,  emissive: 0xff0000,  emissiveIntensity: 1.5 });

  const car = new THREE.Group();

  // Car body and cabin
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 4.2), paintMat);
  chassis.position.y = 0.4;
  car.add(chassis);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.4), paintMat);
  cabin.position.set(0, 0.9, -0.2);
  car.add(cabin);

  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.56, 2.2), cabinMat);
  glass.position.copy(cabin.position);
  car.add(glass);

  // Bumpers
  const bumperF = new THREE.Mesh(new THREE.BoxGeometry(2, 0.25, 0.15), chromeMat);
  bumperF.position.set(0, 0.35, 2.1);
  car.add(bumperF);
  const bumperR = bumperF.clone();
  bumperR.position.z = -2.1;
  car.add(bumperR);

  // Lights (head & tail)
  const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.05), lightFront);
  hl1.position.set(0.5, 0.55, 2.2);
  const hl2 = hl1.clone(); hl2.position.x = -0.5;
  car.add(hl1, hl2);

  const rl1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.05), lightRear);
  rl1.position.set(0.5, 0.55, -2.25);
  const rl2 = rl1.clone(); rl2.position.x = -0.5;
  car.add(rl1, rl2);

  // Wheels & Rims
  const tyreGeo = new THREE.TorusGeometry(0.4, 0.12, 12, 24);
  const rimGeo  = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
  function addWheel(dx, dz) {
    const tyre = new THREE.Mesh(tyreGeo, tyreMat);
    tyre.rotation.x = Math.PI / 2;
    tyre.position.set(dx, 0.4, dz);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(dx, 0.4, dz);
    car.add(tyre, rim);
  }
  addWheel(0.9, 1.4); addWheel(-0.9, 1.4);
  addWheel(0.9, -1.4); addWheel(-0.9, -1.4);

  // Initial direction & traffic light key binding
  let dirX = 0, dirZ = 0, lightIndex = 0, trafficLightKey = '';

  if (laneIdx === 0) {        // South → North
    dirZ = 1;
    car.position.set(xPos + 2, 0, -halfLen);
    lightIndex      = 3;
    trafficLightKey = 'traffic_light_lane_1';
    car.rotation.y  = 0;
  } else if (laneIdx === 1) { // North → South
    dirZ = -1;
    car.position.set(xPos + 5, 0, halfLen);
    lightIndex      = 1;
    trafficLightKey = 'traffic_light_lane_3';
    car.rotation.y  = Math.PI;
  } else if (laneIdx === 2) { // West → East
    dirX = 1;
    car.position.set(-halfLen, 0, xPos);
    lightIndex      = 2;
    trafficLightKey = 'traffic_light_lane_2';
    car.rotation.y  = Math.PI / 2;
  } else if (laneIdx === 3) { // East → West
    dirX = -1;
    car.position.set(halfLen, 0, xPos - 8);
    lightIndex      = 0;
    trafficLightKey = 'traffic_light_lane_4';
    car.rotation.y  = 3 * Math.PI / 2;
  }

  scene.add(car);

  return {
    mesh: car,
    dirX,
    dirZ,
    active: true,
    stopped: false,
    lane: laneIdx,
    lightIndex,
    trafficLightKey
  };
}

/**
 * Updates the position and stop behavior of all cars in the scene.
 * Cars move forward unless approaching a red light.
 *
 * @param {Array} cars - Array of active car objects
 * @param {Object} trafficState - Mapping of traffic light keys to 'green' or 'red'
 * @param {number} delta - Movement step (default is 0.03)
 */
export function updateCars(cars, trafficState, delta = 0.03) {
  const stopSouth = -11, stopNorth = 11, stopWest = -11, stopEast = 11;

  cars.forEach(c => {
    if (!c.active) return;

    const nextX = c.mesh.position.x + c.dirX * delta;
    const nextZ = c.mesh.position.z + c.dirZ * delta;
    let reaching = false;

    // Determine if car is approaching stop line
    if (c.dirZ)
      reaching = (c.dirZ === 1 && c.mesh.position.z < stopSouth && nextZ >= stopSouth) ||
                 (c.dirZ === -1 && c.mesh.position.z > stopNorth && nextZ <= stopNorth);
    if (c.dirX)
      reaching = (c.dirX === 1 && c.mesh.position.x < stopWest && nextX >= stopWest) ||
                 (c.dirX === -1 && c.mesh.position.x > stopEast && nextX <= stopEast);

    // Stop at red light
    if (reaching && trafficState[c.trafficLightKey] !== 'green') {
      c.stopped = true;
      if (c.dirZ) c.mesh.position.z = (c.dirZ === 1 ? stopSouth : stopNorth);
      if (c.dirX) c.mesh.position.x = (c.dirX === 1 ? stopWest  : stopEast);
      return;
    }

    // Stay stopped until light turns green
    if (c.stopped) {
      if (trafficState[c.trafficLightKey] === 'green') c.stopped = false;
      else return;
    }

    // Move forward
    if (c.dirZ) c.mesh.position.z = nextZ;
    if (c.dirX) c.mesh.position.x = nextX;

    // Remove car when out of bounds
    if (Math.abs(c.mesh.position.z) > 55 || Math.abs(c.mesh.position.x) > 55) {
      c.active = false;
      c.mesh.visible = false;
    }
  });
}
