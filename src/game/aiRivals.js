import * as THREE from 'three';
import { createRetroCar } from './carModel.js';

const RIVAL_CONFIGS = [
  { name: 'SLICK', color: 0x00d2d3, stripe: 0xffffff, plate: 'SLICK-01', baseSpeed: 215, lineOffset: -3.0 },
  { name: 'ZEPHYR', color: 0xffd32a, stripe: 0x111111, plate: 'ZEPH-02', baseSpeed: 210, lineOffset: 2.5 },
  { name: 'CHASE', color: 0x3c40c6, stripe: 0xffa801, plate: 'CHSE-03', baseSpeed: 205, lineOffset: -1.5 },
  { name: 'TURBO-T', color: 0x05c46b, stripe: 0xffffff, plate: 'TRBO-04', baseSpeed: 200, lineOffset: 1.8 },
  { name: 'VIPER', color: 0xff5e57, stripe: 0x222222, plate: 'VIPR-05', baseSpeed: 195, lineOffset: -2.2 },
  { name: 'PHOENIX', color: 0x9b59b6, stripe: 0xf1c40f, plate: 'PHNX-06', baseSpeed: 190, lineOffset: 3.2 },
  { name: 'BLAZE', color: 0xf5f6fa, stripe: 0xc81d25, plate: 'BLZE-07', baseSpeed: 185, lineOffset: 0.0 }
];

export class AIRivalManager {
  constructor(scene, circuitTrack, particleSystem) {
    this.scene = scene;
    this.track = circuitTrack;
    this.particles = particleSystem;
    this.rivals = [];
    this.smokeTimer = 0;

    this.createRivals();
  }

  createRivals() {
    RIVAL_CONFIGS.forEach((cfg, idx) => {
      const mesh = createRetroCar({
        bodyColor: cfg.color,
        stripeColor: cfg.stripe,
        plateText: cfg.plate,
        isPlayer: false
      });
      this.scene.add(mesh);

      const rival = {
        id: idx + 1,
        name: cfg.name,
        mesh,
        cfg,
        u: 0,
        speedKmh: 0,
        targetSpeedKmh: cfg.baseSpeed,
        lineOffset: cfg.lineOffset,
        currentLap: 1,
        maxLaps: 3,
        hasCrossedHalfway: false,
        nearFinish: false,
        totalDistance: 0,
        isFinished: false
      };

      this.rivals.push(rival);
    });

    this.resetGrid();
  }

  setTrack(newTrack) {
    this.track = newTrack;
    this.resetGrid();
  }

  resetGrid() {
    // Rivals take grid positions 1 through 7 (indices 0 to 6)
    this.rivals.forEach((r, idx) => {
      r.speedKmh = 0;
      r.currentLap = 1;
      r.hasCrossedHalfway = false;
      r.nearFinish = false;
      r.isFinished = false;

      // Stagger on start grid
      const gridDistU = 0.005 - (idx * 0.0035);
      const u = (gridDistU + 1.0) % 1.0;
      r.u = u;

      const pt = this.track.curve.getPointAt(u);
      const tangent = this.track.curve.getTangentAt(u);
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const lateralSlot = (idx % 2 === 0 ? 3.5 : -3.5);
      const pos = new THREE.Vector3().copy(pt).addScaledVector(side, lateralSlot);
      pos.y += 0.2;

      r.mesh.position.copy(pos);
      const heading = Math.atan2(-tangent.x, -tangent.z);
      r.mesh.rotation.set(0, heading, 0);

      r.totalDistance = r.currentLap + r.u;
    });
  }

  applyDifficulty(difficultySettings) {
    const { aiSpeedMultiplier = 1.0, aiCorneringSkill = 0.8, rubberBandingFactor = 0 } = difficultySettings;
    this.speedMultiplier = aiSpeedMultiplier;
    this.corneringSkill = aiCorneringSkill;
    this.rubberBanding = rubberBandingFactor;
  }

  update(dt, playerVehicle, canMove = true) {
    if (!canMove) {
      this.rivals.forEach(r => {
        r.speedKmh = 0;
      });
      return;
    }

    const up = new THREE.Vector3(0, 1, 0);
    this.smokeTimer += dt;

    this.rivals.forEach(r => {
      if (r.isFinished) {
        // Slow down after finishing
        r.speedKmh = Math.max(r.speedKmh - dt * 30, 40);
      } else {
        // Base target speed with difficulty multiplier
        let target = r.cfg.baseSpeed * (this.speedMultiplier || 1.0);

        // Rubber-banding: if player is ahead, AI speeds up slightly; if AI is way ahead, eases up slightly
        if (this.rubberBanding > 0) {
          const distDiff = playerVehicle.totalDistance - r.totalDistance;
          if (distDiff > 0.05) {
            target *= (1.0 + Math.min(this.rubberBanding * 1.5, 0.18));
          } else if (distDiff < -0.15) {
            target *= (1.0 - Math.min(this.rubberBanding * 0.8, 0.12));
          }
        }

        // Acceleration towards target
        if (r.speedKmh < target) {
          r.speedKmh = Math.min(r.speedKmh + dt * 55, target);
        } else {
          r.speedKmh = Math.max(r.speedKmh - dt * 40, target);
        }
      }

      // Advance along spline
      const speedMps = r.speedKmh / 3.6;
      const deltaU = (speedMps * dt) / this.track.totalLength;
      r.u = (r.u + deltaU) % 1.0;

      // Position along spline with lateral offset
      const pt = this.track.curve.getPointAt(r.u);
      const tangent = this.track.curve.getTangentAt(r.u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const pos = new THREE.Vector3().copy(pt).addScaledVector(side, r.lineOffset);
      pos.y = pt.y + 0.15;
      r.mesh.position.copy(pos);

      // Orientation
      const heading = Math.atan2(-tangent.x, -tangent.z);
      r.mesh.rotation.set(0, heading, 0);

      // Wheel spin
      if (r.mesh.userData.wheels) {
        const wheelRotSpeed = (speedMps / 0.38) * dt;
        r.mesh.userData.wheels.forEach(w => {
          w.children[0].rotation.x += wheelRotSpeed;
          w.children[1].rotation.x += wheelRotSpeed;
        });
      }

      // Exhaust smoke
      if (this.smokeTimer >= 0.08 && r.mesh.userData.exhaustPoints && r.speedKmh > 20) {
        const forwardDir = new THREE.Vector3(-Math.sin(heading), 0, -Math.cos(heading));
        const p1 = r.mesh.localToWorld(r.mesh.userData.exhaustPoints[0].clone());
        this.particles.emit(p1, forwardDir.clone().negate().multiplyScalar(1.5), 0.25, 0.12);
      }

      // Lap tracking for AI
      if (r.u > 0.45 && r.u < 0.65) r.hasCrossedHalfway = true;
      if (r.hasCrossedHalfway && r.u > 0.96) r.nearFinish = true;
      if (r.nearFinish && r.u < 0.08) {
        r.currentLap += 1;
        r.hasCrossedHalfway = false;
        r.nearFinish = false;
        if (r.currentLap > r.maxLaps) {
          r.currentLap = r.maxLaps;
          r.isFinished = true;
        }
      }

      r.totalDistance = (r.currentLap - 1) + r.u;
    });

    if (this.smokeTimer >= 0.08) {
      this.smokeTimer = 0;
    }

    // Arcade Car-to-Car Collision Check (Player vs Rivals)
    this.handleCollisions(playerVehicle);
  }

  handleCollisions(player) {
    const playerPos = player.mesh.position;
    const minCarDist = 2.6;

    this.rivals.forEach(r => {
      const dist = playerPos.distanceTo(r.mesh.position);
      if (dist < minCarDist) {
        // Elastic lateral bump between cars
        const deltaOffset = player.lateralOffset - r.lineOffset;
        const pushDir = deltaOffset >= 0 ? 1 : -1;
        player.lateralOffset += pushDir * 0.45;
        r.lineOffset -= pushDir * 0.35;

        // Arcade speed impact
        player.speedKmh *= 0.94;
        r.speedKmh *= 0.95;
      }
    });
  }

  /**
   * Returns current race rankings: array of { isPlayer, name, totalDistance, lap }
   */
  getStandings(playerVehicle) {
    const list = [
      {
        isPlayer: true,
        name: playerVehicle.mesh.name || 'YOU',
        totalDistance: playerVehicle.totalDistance,
        lap: playerVehicle.currentLap,
        speedMph: playerVehicle.getSpeedMph()
      },
      ...this.rivals.map(r => ({
        isPlayer: false,
        name: r.name,
        totalDistance: r.totalDistance,
        lap: r.currentLap,
        speedMph: Math.round(r.speedKmh * 0.621371)
      }))
    ];

    list.sort((a, b) => b.totalDistance - a.totalDistance);

    list.forEach((entry, idx) => {
      entry.position = idx + 1;
    });

    return list;
  }
}
