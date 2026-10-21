import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene, maxParticles = 300) {
    this.scene = scene;
    this.maxParticles = maxParticles;
    this.particles = [];

    const geom = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85
    });

    this.instancedMesh = new THREE.InstancedMesh(geom, mat, maxParticles);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.instancedMesh);

    this.dummy = new THREE.Object3D();

    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        scale: 0.1,
        life: 0,
        maxLife: 1.0,
        rotSpeed: Math.random() * 2 - 1
      });
      // Hide initially
      this.dummy.position.set(0, -999, 0);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  emit(position, velocity, life = 0.65, initialScale = 0.3) {
    // Find inactive particle
    const p = this.particles.find(part => !part.active);
    if (!p) return;

    p.active = true;
    p.pos.copy(position);
    p.vel.copy(velocity).add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.4,
      Math.random() * 0.3 + 0.1,
      (Math.random() - 0.5) * 0.4
    ));
    p.life = 0;
    p.maxLife = life;
    p.scale = initialScale;
  }

  update(dt) {
    let needsUpdate = false;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        this.dummy.position.set(0, -999, 0);
        this.dummy.scale.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        needsUpdate = true;
        continue;
      }

      // Physics: rise and expand
      p.pos.addScaledVector(p.vel, dt);
      const progress = p.life / p.maxLife;
      const currentScale = p.scale * (1.0 + progress * 2.2);

      this.dummy.position.copy(p.pos);
      this.dummy.scale.set(currentScale, currentScale, currentScale);
      this.dummy.rotation.x += p.rotSpeed * dt;
      this.dummy.rotation.y += p.rotSpeed * dt;
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
  }
}
