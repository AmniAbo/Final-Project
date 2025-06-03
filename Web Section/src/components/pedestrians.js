// src/pedestrians.js
// -------------------------------------------------------------
// Pedestrian rendering and movement system for the intersection
// Includes logic to spawn animated pedestrian models (3D groups)
// and to animate their walk cycle depending on the traffic light
// -------------------------------------------------------------

import { currentLightIndex } from './lights.js';

/**
 * Spawns a given number of pedestrian models into the scene.
 * Each pedestrian is a 3D group consisting of body, head, and legs.
 *
 * @param {THREE.Scene} scene - The scene to add pedestrians to
 * @param {Object} THREE      - The Three.js namespace
 * @param {number} count      - Number of pedestrians to create (default = 4)
 * @returns {Array} Array of pedestrian objects with animation state
 */
export function spawnPedestrians(scene, THREE, count = 4) {
  const laneWidth = 3.5;
  const roadWidth = laneWidth * 4;
  const sidewalkWidth = 2;
  const startZ = 7;
  const startX_L = -(roadWidth / 2 + sidewalkWidth / 2) - 0.5;

  const palette = [0xea4335, 0x4285f4, 0xfb8c00, 0x34a853, 0xab47bc]; // shirt colors

  const peds = [];

  for (let i = 0; i < count; i++) {
    const g = new THREE.Group();

    // ── BODY ──
    const bodyH = 1.8;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, bodyH, 16),
      new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        metalness: 0.1,
        roughness: 0.8
      })
    );
    body.position.y = bodyH / 2;
    g.add(body);

    // ── HEAD ──
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd1b3 }) // skin tone
    );
    head.position.y = bodyH + 0.22;
    g.add(head);

    // ── LEGS ──
    const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.4, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const lLeg = new THREE.Mesh(legGeo, legMat);
    lLeg.position.set(-0.18, 0.7, 0);
    const rLeg = lLeg.clone();
    rLeg.position.x = 0.18;

    g.add(lLeg, rLeg);

    // ── INITIAL POSITION & ROTATION ──
    g.position.set(startX_L, 0, startZ + (i * 0.8) - 1);
    g.rotation.y = -Math.PI / 2; // facing right

    scene.add(g);

    peds.push({
      mesh: g,
      dir: 1,
      phase: Math.random() * Math.PI * 2, // leg animation offset
      active: true
    });
  }

  return peds;
}

/**
 * Updates pedestrian positions and leg animations.
 * Pedestrians walk only when the pedestrian traffic light is green.
 *
 * @param {Array} peds  - Array of pedestrian objects
 * @param {number} delta - Movement step (default = 0.02)
 */
export function updatePedestrians(peds, delta = 0.02) {
  const laneWidth = 3.5;
  const roadWidth = laneWidth * 4;
  const sidewalkWidth = 2;
  const endX_R = 9; // exit point to the right of scene

  const pedestrianLightIdx = 4;
  const canWalk = (currentLightIndex === pedestrianLightIdx); // only walk if green

  for (const p of peds) {
    if (!p.active) continue;

    // ── Leg animation (simple sinusoidal swing) ──
    p.phase += delta * 8;
    const swing = Math.sin(p.phase) * 0.4;

    p.mesh.children.forEach(ch => {
      if (ch.geometry?.parameters?.height === 1.4) {
        ch.rotation.x = -swing * 0.7; // apply swing to legs only
      }
    });

    // ── Movement ──
    if (canWalk) {
      p.mesh.position.x += p.dir * delta * 1.2;
    }

    // ── Remove from scene if passed beyond crosswalk ──
    if (p.mesh.position.x > endX_R) {
      p.mesh.parent.remove(p.mesh); // remove from scene
      p.active = false;             // mark inactive
    }
  }
}
