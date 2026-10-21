import * as THREE from 'three';

export class CameraManager {
  constructor(camera) {
    this.camera = camera;
    this.mode = 'chase'; // 'chase' | 'aerial' | 'front'
    this.modes = ['chase', 'aerial', 'front'];
    this.modeIndex = 0;

    // Smoothed target tracking
    this.currentPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
  }

  setMode(mode) {
    if (this.modes.includes(mode)) {
      this.mode = mode;
      this.modeIndex = this.modes.indexOf(mode);
    }
  }

  cycleMode() {
    this.modeIndex = (this.modeIndex + 1) % this.modes.length;
    this.mode = this.modes[this.modeIndex];
    return this.mode;
  }

  update(playerVehicle, dt) {
    const carPos = playerVehicle.mesh.position;
    const heading = playerVehicle.heading;
    const isDrifting = playerVehicle.isDrifting;

    const forwardDir = new THREE.Vector3(
      -Math.sin(heading),
      0,
      -Math.cos(heading)
    );
    const sideDir = new THREE.Vector3(
      Math.cos(heading),
      0,
      -Math.sin(heading)
    );

    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (this.mode === 'chase') {
      // Third person low rear view (FOV 65)
      this.camera.fov = 65;
      const camDist = 6.8 + (playerVehicle.speedKmh / 235) * 1.5;
      const camHeight = 2.4;

      targetCamPos.copy(carPos)
        .addScaledVector(forwardDir, -camDist)
        .add(new THREE.Vector3(0, camHeight, 0));

      // Drift dynamic offset
      if (isDrifting) {
        targetCamPos.addScaledVector(sideDir, playerVehicle.lateralVelocity * 0.04);
      }

      targetLookAt.copy(carPos).add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(forwardDir, 5.0);

    } else if (this.mode === 'aerial') {
      // Isometric / drone view
      this.camera.fov = 55;
      targetCamPos.copy(carPos).add(new THREE.Vector3(-18, 22, -18));
      targetLookAt.copy(carPos).add(new THREE.Vector3(0, 1.0, 0));

    } else if (this.mode === 'front') {
      // Front camera looking at car nose / dramatic hood view
      this.camera.fov = 70;
      targetCamPos.copy(carPos)
        .addScaledVector(forwardDir, 6.0)
        .add(new THREE.Vector3(0, 1.5, 0));

      targetLookAt.copy(carPos).add(new THREE.Vector3(0, 0.9, 0));
    }

    // Smooth camera lag
    const lerpFactor = this.mode === 'aerial' ? 0.08 : 0.22;
    this.currentPos.lerp(targetCamPos, lerpFactor);
    this.currentLookAt.lerp(targetLookAt, 0.25);

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
    this.camera.updateProjectionMatrix();
  }
}
