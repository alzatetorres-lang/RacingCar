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

    // Dynamic Physics parameters
    this.speedKmh = 0;
    this.maxSpeedKmh = 235; // ~146 MPH base, boost up to ~165 MPH
    this.acceleration = 70; // km/h per second
    this.braking = 120;
    this.friction = 25;
    this.turnSpeed = 2.4; // rad/s
    this.heading = 0; // Y rotation angle
    this.lateralVelocity = 0;
    this.isDrifting = false;
    this.driftIntensity = 0;
    this.offroadSpeedPenalty = 0.55;

    // Track progression
    this.currentU = 0;
    this.currentLap = 1;
    this.maxLaps = 3;
    this.lastCheckpoint = 0;
    this.hasCrossedHalfway = false;
    this.totalDistance = 0;
    this.isFinished = false;
    this.racePosition = 8; // Start at 8/8

    // Controls state
    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      drift: false
    };

    // Smoke particle timer
    this.smokeTimer = 0;

    this.resetToStart();
  }

  resetToStart(gridIndex = 7) {
    // Player starts at position 8 (index 7, back of the pack)
    this.speedKmh = 0;
    this.lateralVelocity = 0;
    this.isDrifting = false;
    this.currentLap = 1;
    this.lastCheckpoint = 0;
    this.hasCrossedHalfway = false;
    this.isFinished = false;

    // Place at start line, offset slightly back
    const startU = 0.005 - gridIndex * 0.0035;
    const u = (startU + 1.0) % 1.0;
    this.currentU = u;
    const pt = this.track.curve.getPointAt(u);
    const tangent = this.track.curve.getTangentAt(u);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    // Stagger grid slots (left/right)
    const lateralOffset = (gridIndex % 2 === 0 ? -3.5 : 3.5);
    const pos = new THREE.Vector3().copy(pt).addScaledVector(side, lateralOffset);
    pos.y += 0.2;

    this.mesh.position.copy(pos);
    this.heading = Math.atan2(-tangent.x, -tangent.z);
    this.mesh.rotation.set(0, this.heading, 0);

    this.totalDistance = this.currentLap + this.currentU;
  }

  update(dt, canMove = true) {
    if (!canMove) {
      this.speedKmh = 0;
      audio.updateEngine(0, this.maxSpeedKmh, false);
      return;
    }

    const { forward, backward, left, right, drift } = this.inputs;

    // Check track boundaries
    const trackInfo = this.track.getTrackProgress(this.mesh.position);
    this.currentU = trackInfo.u;

    const maxEffectiveSpeed = trackInfo.isOffroad
      ? this.maxSpeedKmh * this.offroadSpeedPenalty
      : this.maxSpeedKmh;

    // Acceleration & Braking
    if (forward) {
      this.speedKmh = Math.min(this.speedKmh + this.acceleration * dt, maxEffectiveSpeed);
    } else if (backward) {
      if (this.speedKmh > 0) {
        this.speedKmh = Math.max(0, this.speedKmh - this.braking * dt);
      } else {
        this.speedKmh = Math.max(-45, this.speedKmh - (this.acceleration * 0.5) * dt);
      }
    } else {
      // Natural deceleration / rolling resistance
      if (this.speedKmh > 0) {
        this.speedKmh = Math.max(0, this.speedKmh - this.friction * dt);
      } else if (this.speedKmh < 0) {
        this.speedKmh = Math.min(0, this.speedKmh + this.friction * dt);
      }
    }

    // Steering & Drift Mechanics
    const speedFactor = Math.min(Math.abs(this.speedKmh) / 60, 1.0);
    let steerInput = 0;
    if (left) steerInput += 1;
    if (right) steerInput -= 1;

    // Handbrake / Drift check
    const wantsDrift = drift || (Math.abs(steerInput) > 0 && this.speedKmh > 110 && Math.abs(trackInfo.lateralDist) > 3.0);
    this.isDrifting = wantsDrift && Math.abs(steerInput) > 0 && this.speedKmh > 40;

    if (this.isDrifting) {
      this.driftIntensity = Math.min(this.driftIntensity + dt * 4.0, 1.0);
      const driftTurnMultiplier = 1.45;
      this.heading += steerInput * this.turnSpeed * driftTurnMultiplier * speedFactor * dt;
      // Lateral slide
      this.lateralVelocity += steerInput * dt * 25.0;
      audio.setDrift(true, this.driftIntensity);
    } else {
      this.driftIntensity = Math.max(0, this.driftIntensity - dt * 5.0);
      this.heading += steerInput * this.turnSpeed * speedFactor * dt;
      this.lateralVelocity *= 0.92; // Damping
      audio.setDrift(false);
    }

    // Update car position from heading and velocity
    const speedMps = (this.speedKmh / 3.6);
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
      .addScaledVector(sideDir, this.lateralVelocity * dt);

    this.mesh.position.add(movement);

    // Keep car conforming to road surface elevation
    this.mesh.position.y = trackInfo.centerPt.y + 0.15;

    // Visual roll and wheel turn
    const visualSteerAngle = -steerInput * (this.isDrifting ? 0.45 : 0.28);
    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.z = -steerInput * (this.isDrifting ? 0.08 : 0.03); // Slight body roll

    // Animate wheels
    if (this.mesh.userData.wheels) {
      const wheelRotSpeed = (speedMps / 0.38) * dt;
      this.mesh.userData.wheels.forEach(w => {
        w.children[0].rotation.x += wheelRotSpeed; // Tire
        w.children[1].rotation.x += wheelRotSpeed; // Rim
        if (w.userData.isFront) {
          w.rotation.y = visualSteerAngle;
        }
      });
    }

    // Smoke particles during drift or hard acceleration
    this.smokeTimer += dt;
    if (this.smokeTimer >= 0.035) {
      this.smokeTimer = 0;
      if (this.isDrifting || (forward && this.speedKmh < 60)) {
        // Emit from rear wheels
        const rearWheelL = this.mesh.localToWorld(new THREE.Vector3(-1.0, 0.1, 1.4));
        const rearWheelR = this.mesh.localToWorld(new THREE.Vector3(1.0, 0.1, 1.4));
        this.particles.emit(rearWheelL, new THREE.Vector3(0, 0.8, 0), 0.5, 0.35);
        this.particles.emit(rearWheelR, new THREE.Vector3(0, 0.8, 0), 0.5, 0.35);
      }
      // Exhaust smoke
      if (forward && this.mesh.userData.exhaustPoints) {
        this.mesh.userData.exhaustPoints.forEach(pt => {
          const worldExhaust = this.mesh.localToWorld(pt.clone());
          this.particles.emit(worldExhaust, forwardDir.clone().negate().multiplyScalar(2.0), 0.3, 0.15);
        });
      }
    }

    // Update sound engine
    audio.updateEngine(this.speedKmh, this.maxSpeedKmh, forward);

    // Lap and Checkpoint Progression
    this.updateLapProgress(trackInfo.u);
  }

  updateLapProgress(u) {
    if (this.isFinished) return;

    // Check halfway mark to prevent cheating
    if (u > 0.45 && u < 0.65) {
      this.hasCrossedHalfway = true;
    }

    // Finish line crossing check
    if (this.hasCrossedHalfway && u > 0.96) {
      this.nearFinish = true;
    }

    if (this.nearFinish && u < 0.08) {
      // Completed a lap!
      this.currentLap += 1;
      this.hasCrossedHalfway = false;
      this.nearFinish = false;
      audio.playCheckpointChime();

      if (this.currentLap > this.maxLaps) {
        this.currentLap = this.maxLaps;
        this.isFinished = true;
      }
    }

    // Calculate monotonic progress for leaderboards
    this.totalDistance = (this.currentLap - 1) + u;
  }

  getSpeedMph() {
    return Math.round(Math.abs(this.speedKmh) * 0.621371);
  }
}
