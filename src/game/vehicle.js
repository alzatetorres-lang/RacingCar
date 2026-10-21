import * as THREE from 'three';
import { createRetroCar } from './carModel.js';
import { audio } from './audio.js';

export class PlayerVehicle {
  constructor(scene, circuitTrack, particleSystem) {
    this.scene = scene;
    this.track = circuitTrack;
    this.particles = particleSystem;

    this.mesh = createRetroCar({
      bodyColor: 0xc81d25,
      stripeColor: 0xffffff,
      plateText: 'APEX-88',
      isPlayer: true
    });
    this.scene.add(this.mesh);

    // Responsive Arcade Physics parameters
    this.speedKmh = 0;
    this.baseMaxSpeed = 230; // ~143 MPH
    this.boostMaxSpeed = 260; // ~162 MPH with drift boost
    this.acceleration = 68;
    this.braking = 135;
    this.friction = 24;

    // Direct 3D Heading & Steering
    this.heading = 0; // Absolute world yaw angle
    this.steerInputSmoothed = 0;
    this.lateralSlide = 0; // Sideways slip velocity

    // Drift mechanics
    this.isDrifting = false;
    this.driftIntensity = 0;
    this.driftSlipAngle = 0;
    this.driftBoostTimer = 0;

    // Track progression
    this.currentU = 0;
    this.currentLap = 1;
    this.maxLaps = 3;
    this.hasCrossedHalfway = false;
    this.nearFinish = false;
    this.totalDistance = 0;
    this.isFinished = false;

    // Inputs
    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      drift: false
    };

    this.smokeTimer = 0;
    this.resetToStart();
  }

  setTrack(newTrack) {
    this.track = newTrack;
    this.resetToStart();
  }

  resetToStart(gridIndex = 7) {
    this.speedKmh = 0;
    this.steerInputSmoothed = 0;
    this.lateralSlide = 0;
    this.isDrifting = false;
    this.driftIntensity = 0;
    this.driftSlipAngle = 0;
    this.driftBoostTimer = 0;
    this.currentLap = 1;
    this.hasCrossedHalfway = false;
    this.nearFinish = false;
    this.isFinished = false;

    // Position on track start line
    const startU = 0.005 - (gridIndex * 0.0035);
    const u = (startU + 1.0) % 1.0;
    this.currentU = u;

    const pt = this.track.curve.getPointAt(u);
    const tangent = this.track.curve.getTangentAt(u);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const lateralOffset = (gridIndex % 2 === 0 ? -3.5 : 3.5);
    const pos = new THREE.Vector3().copy(pt).addScaledVector(side, lateralOffset);
    pos.y = pt.y + 0.15;

    this.mesh.position.copy(pos);
    this.heading = Math.atan2(-tangent.x, -tangent.z);
    this.mesh.rotation.set(0, this.heading, 0);

    this.totalDistance = this.currentLap + this.currentU;
  }

  update(dt, canMove = true) {
    if (!canMove) {
      this.speedKmh = 0;
      audio.updateEngine(0, this.baseMaxSpeed, false);
      return;
    }

    const { forward, backward, left, right, drift } = this.inputs;

    // Get current track position & road tangent
    const trackInfo = this.track.getTrackProgress(this.mesh.position);
    this.currentU = trackInfo.u;

    // Speed limits & Boost
    let effectiveMaxSpeed = this.baseMaxSpeed;
    if (this.driftBoostTimer > 0) {
      this.driftBoostTimer -= dt;
      effectiveMaxSpeed = this.boostMaxSpeed;
    }
    if (trackInfo.isOffroad) {
      effectiveMaxSpeed = Math.min(effectiveMaxSpeed, 125); // Gentle speed limit on grass
    }

    // Acceleration & Braking
    if (forward) {
      this.speedKmh = Math.min(this.speedKmh + this.acceleration * dt, effectiveMaxSpeed);
    } else if (backward) {
      if (this.speedKmh > 0) {
        this.speedKmh = Math.max(0, this.speedKmh - this.braking * dt);
      } else {
        this.speedKmh = Math.max(-45, this.speedKmh - (this.acceleration * 0.6) * dt);
      }
    } else {
      // Natural rolling deceleration
      if (this.speedKmh > 0) {
        this.speedKmh = Math.max(0, this.speedKmh - this.friction * dt);
      } else if (this.speedKmh < 0) {
        this.speedKmh = Math.min(0, this.speedKmh + this.friction * dt);
      }
    }

    // Steering Input (-1 for left, +1 for right)
    let rawSteer = 0;
    if (left) rawSteer -= 1;
    if (right) rawSteer += 1;

    // Smooth progressive input to eliminate twitchy turns
    this.steerInputSmoothed += (rawSteer - this.steerInputSmoothed) * 9.0 * dt;

    // Drift Detection (Space or sharp turn at high speed)
    const wantsDrift = drift || (Math.abs(rawSteer) > 0 && this.speedKmh > 135 && Math.abs(trackInfo.lateralDist) > 3.0);
    const wasDrifting = this.isDrifting;
    this.isDrifting = wantsDrift && Math.abs(rawSteer) > 0 && this.speedKmh > 50;

    // Turning Physics
    const speedRatio = Math.min(Math.abs(this.speedKmh) / 60, 1.0);
    // Speed damping: at 200 km/h, steering is stable and tight; at 60 km/h, full turning power
    const highSpeedDamping = 1.0 / (1.0 + Math.max(0, (Math.abs(this.speedKmh) - 100) / 190));
    const baseTurnSpeed = 1.25; // Balanced, smooth turn rate (rad/s)
    const driftMultiplier = this.isDrifting ? 1.45 : 1.0;

    // Apply direct heading turn
    this.heading -= this.steerInputSmoothed * baseTurnSpeed * speedRatio * highSpeedDamping * driftMultiplier * dt;

    // Road Camber & Centering Assist (Keeps car aligned with track curves when not steering hard)
    const roadHeading = Math.atan2(-trackInfo.tangent.x, -trackInfo.tangent.z);
    let headingDiff = roadHeading - this.heading;
    while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
    while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;

    if (Math.abs(rawSteer) < 0.25 && Math.abs(this.speedKmh) > 30) {
      // Naturally align with road curve
      this.heading += headingDiff * 2.2 * dt;
    }

    // If deeply offroad, gently steer back toward the road
    if (trackInfo.isOffroad && Math.abs(rawSteer) < 0.3) {
      const returnDir = trackInfo.lateralDist > 0 ? 1 : -1;
      this.heading += returnDir * 0.8 * dt;
    }

    // Drift dynamics & slip angle
    if (this.isDrifting) {
      this.driftIntensity = Math.min(this.driftIntensity + dt * 4.0, 1.0);
      const targetSlip = rawSteer * 0.38; // ~22 degrees visual slide
      this.driftSlipAngle += (targetSlip - this.driftSlipAngle) * 6.0 * dt;
      this.lateralSlide += rawSteer * dt * 14.0;
      audio.setDrift(true, this.driftIntensity);
    } else {
      if (wasDrifting && this.driftIntensity > 0.6) {
        // Reward boost on clean drift exit!
        this.driftBoostTimer = 1.2;
        this.speedKmh = Math.min(this.speedKmh + 22, this.boostMaxSpeed);
      }
      this.driftIntensity = Math.max(0, this.driftIntensity - dt * 6.0);
      this.driftSlipAngle *= 0.82;
      this.lateralSlide *= 0.88; // Quick grip recovery
      audio.setDrift(false);
    }

    // World 3D Motion
    const speedMps = this.speedKmh / 3.6;
    const forwardDir = new THREE.Vector3(
      -Math.sin(this.heading),
      0,
      -Math.cos(this.heading)
    );
    const sideDir = new THREE.Vector3(
      Math.cos(this.heading),
      0,
      -Math.sin(this.heading)
    );

    const movement = new THREE.Vector3()
      .copy(forwardDir)
      .multiplyScalar(speedMps * dt)
      .addScaledVector(sideDir, this.lateralSlide * dt);

    this.mesh.position.add(movement);

    // Conforming to road elevation
    this.mesh.position.y = trackInfo.centerPt.y + 0.15;

    // Visual Mesh Orientation (Chassis Yaw + Drift Slip + Body Roll)
    const visualYaw = this.heading + this.driftSlipAngle;
    this.mesh.rotation.y = visualYaw;
    this.mesh.rotation.z = -this.steerInputSmoothed * (this.isDrifting ? 0.07 : 0.035);

    // Wheel Rotation & Steering Angle
    if (this.mesh.userData.wheels) {
      const wheelRotSpeed = (speedMps / 0.38) * dt;
      this.mesh.userData.wheels.forEach(w => {
        w.children[0].rotation.x += wheelRotSpeed;
        w.children[1].rotation.x += wheelRotSpeed;
        if (w.userData.isFront) {
          w.rotation.y = -this.steerInputSmoothed * 0.45;
        }
      });
    }

    // Particle Emission
    this.updateParticles(dt, forwardDir, forward);

    // Audio Update
    audio.updateEngine(this.speedKmh, this.baseMaxSpeed, forward);

    // Lap Progress Tracking
    this.updateLapProgress(trackInfo.u);
  }

  updateParticles(dt, forwardDir, isAccelerating) {
    this.smokeTimer += dt;
    if (this.smokeTimer >= 0.035) {
      this.smokeTimer = 0;

      // Tire smoke during drift or burnout
      if (this.isDrifting || (isAccelerating && this.speedKmh < 50)) {
        const rearWheelL = this.mesh.localToWorld(new THREE.Vector3(-1.0, 0.1, 1.4));
        const rearWheelR = this.mesh.localToWorld(new THREE.Vector3(1.0, 0.1, 1.4));
        this.particles.emit(rearWheelL, new THREE.Vector3(0, 0.8, 0), 0.5, 0.35);
        this.particles.emit(rearWheelR, new THREE.Vector3(0, 0.8, 0), 0.5, 0.35);
      }

      // Exhaust pipe smoke
      if (isAccelerating && this.mesh.userData.exhaustPoints) {
        this.mesh.userData.exhaustPoints.forEach(pt => {
          const worldExhaust = this.mesh.localToWorld(pt.clone());
          this.particles.emit(worldExhaust, forwardDir.clone().negate().multiplyScalar(2.0), 0.28, 0.14);
        });
      }
    }
  }

  updateLapProgress(u) {
    if (this.isFinished) return;

    if (u > 0.45 && u < 0.65) {
      this.hasCrossedHalfway = true;
    }

    if (this.hasCrossedHalfway && u > 0.95) {
      this.nearFinish = true;
    }

    if (this.nearFinish && u < 0.08) {
      this.currentLap += 1;
      this.hasCrossedHalfway = false;
      this.nearFinish = false;
      audio.playCheckpointChime();

      if (this.currentLap > this.maxLaps) {
        this.currentLap = this.maxLaps;
        this.isFinished = true;
      }
    }

    this.totalDistance = (this.currentLap - 1) + u;
  }

  getSpeedMph() {
    return Math.round(Math.abs(this.speedKmh) * 0.621371);
  }
}
