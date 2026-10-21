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

    // Balanced Arcade Physics parameters
    this.speedKmh = 0;
    this.baseMaxSpeed = 230; // ~143 MPH
    this.boostMaxSpeed = 265; // ~165 MPH with drift boost
    this.acceleration = 65; // km/h per sec
    this.braking = 140;
    this.friction = 24;

    // Smooth lateral lane steering
    this.lateralOffset = 0; // meters from centerline
    this.steerAngle = 0; // Visual & physical steer angle (-1 to +1)
    this.heading = 0;

    // Drift mechanics
    this.isDrifting = false;
    this.driftIntensity = 0;
    this.driftAngle = 0; // Visual slip angle in radians
    this.driftBoostTimer = 0;

    // Track progression
    this.currentU = 0;
    this.currentLap = 1;
    this.maxLaps = 3;
    this.hasCrossedHalfway = false;
    this.nearFinish = false;
    this.totalDistance = 0;
    this.isFinished = false;

    // Controls state
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
    this.steerAngle = 0;
    this.isDrifting = false;
    this.driftIntensity = 0;
    this.driftAngle = 0;
    this.driftBoostTimer = 0;
    this.currentLap = 1;
    this.hasCrossedHalfway = false;
    this.nearFinish = false;
    this.isFinished = false;

    // Player starts at back of grid (slot 7)
    const startU = 0.005 - (gridIndex * 0.0035);
    this.currentU = (startU + 1.0) % 1.0;
    this.lateralOffset = (gridIndex % 2 === 0 ? -3.5 : 3.5);

    this.updateTransform(0);
    this.totalDistance = this.currentLap + this.currentU;
  }

  update(dt, canMove = true) {
    if (!canMove) {
      this.speedKmh = 0;
      audio.updateEngine(0, this.baseMaxSpeed, false);
      return;
    }

    const { forward, backward, left, right, drift } = this.inputs;

    // Check if offroad (beyond asphalt edge)
    const halfWidth = this.track.trackWidth / 2;
    const isOffroad = Math.abs(this.lateralOffset) > halfWidth;

    // Effective max speed
    let currentMaxSpeed = this.baseMaxSpeed;
    if (this.driftBoostTimer > 0) {
      this.driftBoostTimer -= dt;
      currentMaxSpeed = this.boostMaxSpeed;
    }
    if (isOffroad) {
      currentMaxSpeed = Math.min(currentMaxSpeed, 135); // Gentle speed limit on grass
    }

    // Acceleration & Braking
    if (forward) {
      this.speedKmh = Math.min(this.speedKmh + this.acceleration * dt, currentMaxSpeed);
    } else if (backward) {
      if (this.speedKmh > 0) {
        this.speedKmh = Math.max(0, this.speedKmh - this.braking * dt);
      } else {
        this.speedKmh = Math.max(-45, this.speedKmh - (this.acceleration * 0.6) * dt);
      }
    } else {
      // Natural rolling resistance
      if (this.speedKmh > 0) {
        this.speedKmh = Math.max(0, this.speedKmh - this.friction * dt);
      } else if (this.speedKmh < 0) {
        this.speedKmh = Math.min(0, this.speedKmh + this.friction * dt);
      }
    }

    // Steering input target (-1 to +1)
    let steerTarget = 0;
    if (left) steerTarget -= 1;
    if (right) steerTarget += 1;

    // Smooth progressive steering (eliminates twitchy oversteering)
    const steerResponseSpeed = 7.0; // Smooth response
    this.steerAngle += (steerTarget - this.steerAngle) * steerResponseSpeed * dt;

    // Drift Detection (Space pressed or sharp steering at high speed)
    const wantsDrift = drift || (Math.abs(steerTarget) > 0 && this.speedKmh > 130 && Math.abs(this.steerAngle) > 0.65);
    const wasDrifting = this.isDrifting;
    this.isDrifting = wantsDrift && Math.abs(steerTarget) > 0 && this.speedKmh > 50;

    // Drift handling & reward boost on exit
    if (this.isDrifting) {
      this.driftIntensity = Math.min(this.driftIntensity + dt * 4.0, 1.0);
      const targetDriftAngle = -steerTarget * 0.38; // ~22 degrees slip angle
      this.driftAngle += (targetDriftAngle - this.driftAngle) * 6.0 * dt;
      audio.setDrift(true, this.driftIntensity);
    } else {
      if (wasDrifting && this.driftIntensity > 0.6) {
        // Rewarding drift exit boost!
        this.driftBoostTimer = 1.3;
        this.speedKmh = Math.min(this.speedKmh + 22, this.boostMaxSpeed);
      }
      this.driftIntensity = Math.max(0, this.driftIntensity - dt * 6.0);
      this.driftAngle *= 0.85; // Fast centering
      audio.setDrift(false);
    }

    // Lateral Movement across the road
    // Scales smoothly with forward speed (at 0 speed, car doesn't slide laterally)
    const speedRatio = Math.min(Math.abs(this.speedKmh) / 70, 1.0);
    const lateralSpeedBase = this.isDrifting ? 17.5 : 13.0;
    const lateralDelta = this.steerAngle * lateralSpeedBase * speedRatio * dt;
    this.lateralOffset += lateralDelta;

    // Constrain lateral offset so player doesn't wander infinitely into the abyss
    const maxLateralLimit = halfWidth + 4.5;
    this.lateralOffset = Math.max(-maxLateralLimit, Math.min(maxLateralLimit, this.lateralOffset));

    // Progress along spline
    const speedMps = this.speedKmh / 3.6;
    const deltaU = (speedMps * dt) / this.track.totalLength;
    this.currentU = (this.currentU + deltaU + 1.0) % 1.0;

    // Update 3D Object Transform
    this.updateTransform(dt);

    // Exhaust & Tire Smoke Particles
    this.updateParticles(dt, speedMps, forward);

    // Update Sound Engine
    audio.updateEngine(this.speedKmh, this.baseMaxSpeed, forward);

    // Lap Progression
    this.updateLapProgress();
  }

  updateTransform(dt) {
    const pt = this.track.curve.getPointAt(this.currentU);
    const tangent = this.track.curve.getTangentAt(this.currentU);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    // World position: on spline + lateral lane offset
    const worldPos = new THREE.Vector3().copy(pt).addScaledVector(side, this.lateralOffset);
    worldPos.y = pt.y + 0.15;
    this.mesh.position.copy(worldPos);

    // Orientation: follows road tangent + steering yaw + drift slip angle
    const roadHeading = Math.atan2(-tangent.x, -tangent.z);
    const chassisYaw = roadHeading + (this.steerAngle * 0.18) + (this.isDrifting ? this.driftAngle : 0);
    this.heading = chassisYaw;

    this.mesh.rotation.y = chassisYaw;
    this.mesh.rotation.z = -this.steerAngle * (this.isDrifting ? 0.08 : 0.035); // Body lean

    // Wheel spin and front wheel steering
    if (this.mesh.userData.wheels) {
      const speedMps = this.speedKmh / 3.6;
      const wheelRotSpeed = (speedMps / 0.38) * dt;
      this.mesh.userData.wheels.forEach(w => {
        w.children[0].rotation.x += wheelRotSpeed;
        w.children[1].rotation.x += wheelRotSpeed;
        if (w.userData.isFront) {
          w.rotation.y = this.steerAngle * 0.42;
        }
      });
    }
  }

  updateParticles(dt, speedMps, isAccelerating) {
    this.smokeTimer += dt;
    if (this.smokeTimer >= 0.035) {
      this.smokeTimer = 0;

      // Tire smoke during drift or burnout
      if (this.isDrifting || (isAccelerating && this.speedKmh < 45)) {
        const rearWheelL = this.mesh.localToWorld(new THREE.Vector3(-1.0, 0.1, 1.4));
        const rearWheelR = this.mesh.localToWorld(new THREE.Vector3(1.0, 0.1, 1.4));
        this.particles.emit(rearWheelL, new THREE.Vector3(0, 0.8, 0), 0.5, 0.35);
        this.particles.emit(rearWheelR, new THREE.Vector3(0, 0.8, 0), 0.5, 0.35);
      }

      // Exhaust pipe smoke
      if (isAccelerating && this.mesh.userData.exhaustPoints) {
        const forwardDir = new THREE.Vector3(-Math.sin(this.heading), 0, -Math.cos(this.heading));
        this.mesh.userData.exhaustPoints.forEach(pt => {
          const worldExhaust = this.mesh.localToWorld(pt.clone());
          this.particles.emit(worldExhaust, forwardDir.clone().negate().multiplyScalar(2.0), 0.28, 0.14);
        });
      }
    }
  }

  updateLapProgress() {
    if (this.isFinished) return;

    const u = this.currentU;
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
