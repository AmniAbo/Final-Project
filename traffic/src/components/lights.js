// lights.js

/**
 * Traffic Light Management for 3D Scene
 * ------------------------------------------------------------------
 * This module creates and controls traffic lights in the Three.js scene.
 * 
 * Exports:
 * - currentLightIndex: The index of the currently green traffic light.
 * - trafficLights: An array of all traffic light objects.
 * - createTrafficLights(scene, THREE): Initializes and adds lights to scene.
 * - applyLightStates(states): Updates light colors according to given states.
 */

export let currentLightIndex = 0;         // Currently green light index (0-4)
export let trafficLights = [];            // All traffic light objects (group + lamps)

/**
 * Creates traffic lights and adds them to the given Three.js scene.
 * @param {THREE.Scene} scene - The scene to which the lights will be added.
 * @param {typeof THREE} THREE - The THREE module instance.
 */
export function createTrafficLights(scene, THREE) {
  const laneWidth = 3.5;
  const roadWidth = laneWidth * 4;
  const sidewalkWidth = 2;
  const edge = roadWidth / 2 + sidewalkWidth / 2;
  const offset = 0.6;

  /**
   * Constructs a single traffic light object (pole + red/yellow/green lamps).
   * @returns {{ group: THREE.Group, red: THREE.Mesh, yellow: THREE.Mesh, green: THREE.Mesh }}
   */
  function buildTrafficLight() {
    const g = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    base.position.y = 0.2;
    g.add(base);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 7, 32),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    pole.position.y = 3.5;
    g.add(pole);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 2.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    box.position.y = 7;
    g.add(box);

    /**
     * Creates a colored lamp for the light box.
     * @param {number} color - Hex color value (e.g., 0xff0000).
     * @param {number} dy - Y offset from center of box.
     * @returns {THREE.Mesh}
     */
    function makeLamp(color, dy) {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 32, 32),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.1 })
      );
      lamp.position.set(0, 7 + dy, 0.35);
      g.add(lamp);
      return lamp;
    }

    const red    = makeLamp(0xff0000,  0.8);
    const yellow = makeLamp(0xffff00,  0.0);
    const green  = makeLamp(0x00ff00, -0.8);

    return { group: g, red, yellow, green };
  }

  // Predefined positions for 4 vehicle lanes + 1 pedestrian light
  const cfgs = [
    { x:  edge + offset,  z:  laneWidth - 11,        rot:  Math.PI / 2 },
    { x: -(edge + offset), z: -laneWidth + 11,       rot: -Math.PI / 2 },
    { x: -laneWidth / 2 + 9.5, z:  edge + offset + 2, rot: 0 },
    { x:  laneWidth / 2 - 9.5, z: -(edge + offset),   rot: Math.PI },
    { x: 9, z: 8, rot: -Math.PI / 2 } // Pedestrian crossing
  ];

  cfgs.forEach(c => {
    const tl = buildTrafficLight();
    tl.group.position.set(c.x, 0, c.z);
    tl.group.rotation.y = c.rot;
    scene.add(tl.group);
    trafficLights.push(tl);
  });

  activateLight(0); // Initial green light
}

/**
 * Activates one traffic light by index and deactivates others.
 * @param {number} idx - Index of light to activate.
 */
function activateLight(idx) {
  trafficLights.forEach((tl, i) => {
    const isOn = i === idx;
    tl.green.material.emissiveIntensity  = isOn ? 5 : 0.001;
    tl.red.material.emissiveIntensity    = isOn ? 0.001 : 5;
    tl.yellow.material.emissiveIntensity = 0.001;
  });
  currentLightIndex = idx;
}

/**
 * Updates the traffic lights to match external system state.
 * Accepts an array of strings ["red" | "green"] for each light.
 * @param {Array<string>} states - Array of 5 strings indicating the color of each light.
 */
export function applyLightStates(states) {
  states.forEach((state, i) => {
    const tl = trafficLights[i];
    const isGreen = state === "green";
    tl.green.material.emissiveIntensity  = isGreen ? 5 : 0.001;
    tl.red.material.emissiveIntensity    = isGreen ? 0.001 : 5;
    tl.yellow.material.emissiveIntensity = 0.001;

    if (isGreen) currentLightIndex = i;
  });
}