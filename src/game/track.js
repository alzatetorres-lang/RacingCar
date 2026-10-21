import * as THREE from 'three';

/**
 * Builds the circuit spline, extruded track mesh, curbs, dashed lines, biomes, and scenery.
 */
export class CircuitTrack {
  constructor(scene) {
    this.scene = scene;
    this.trackWidth = 18;
    this.curve = null;
    this.trackMesh = null;
    this.centerLineMesh = null;
    this.kerbs = [];
    this.checkpoints = [];
    this.totalLength = 0;
    this.trees = [];

    this.createSpline();
    this.createAsphalt();
    this.createKerbsAndMarkings();
    this.createStartFinishArch();
    this.createEnvironment();
  }

  createSpline() {
    // Exact winding layout inspired by Emerald Grove & Sunset Coast reference
    const rawPoints = [
      new THREE.Vector3(0, 0, 0),         // Start line
      new THREE.Vector3(0, 0, 160),       // Long straightaway
      new THREE.Vector3(50, 4, 300),      // Coast curve entry
      new THREE.Vector3(140, 8, 420),     // Ocean sweep
      new THREE.Vector3(260, 12, 450),    // South curve
      new THREE.Vector3(380, 16, 380),    // Rise into Emerald Grove
      new THREE.Vector3(450, 22, 250),    // S-curve 1 entry
      new THREE.Vector3(390, 20, 120),    // S-curve chicane
      new THREE.Vector3(470, 18, 0),      // S-curve exit
      new THREE.Vector3(480, 14, -140),   // High forest straight
      new THREE.Vector3(400, 10, -280),   // Grove hairpin apex
      new THREE.Vector3(260, 6, -350),    // Descent back
      new THREE.Vector3(120, 2, -320),    // Coastal approach
      new THREE.Vector3(-40, 0, -220),    // Final turn entry
      new THREE.Vector3(-60, 0, -90)      // Final turn exit into main straight
    ];

    this.curve = new THREE.CatmullRomCurve3(rawPoints, true, 'catmullrom', 0.2);
    this.totalLength = this.curve.getLength();

    // Generate checkpoints (50 checkpoints around the loop)
    const numCheckpoints = 60;
    for (let i = 0; i < numCheckpoints; i++) {
      const u = i / numCheckpoints;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      this.checkpoints.push({
        index: i,
        u,
        position: pt,
        tangent
      });
    }
  }

  createAsphalt() {
    // Generate ribbon geometry along spline
    const divisions = 600;
    const points = this.curve.getPoints(divisions);
    const normals = [];

    const geom = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const indices = [];

    const up = new THREE.Vector3(0, 1, 0);
    const halfW = this.trackWidth / 2;

    for (let i = 0; i <= divisions; i++) {
      const u = i / divisions;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const leftPt = new THREE.Vector3().copy(pt).addScaledVector(side, -halfW);
      const rightPt = new THREE.Vector3().copy(pt).addScaledVector(side, halfW);

      positions.push(leftPt.x, leftPt.y + 0.05, leftPt.z);
      positions.push(rightPt.x, rightPt.y + 0.05, rightPt.z);

      uvs.push(0, u * 50);
      uvs.push(1, u * 50);

      if (i < divisions) {
        const v1 = i * 2;
        const v2 = i * 2 + 1;
        const v3 = (i + 1) * 2;
        const v4 = (i + 1) * 2 + 1;

        indices.push(v1, v2, v3);
        indices.push(v2, v4, v3);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const asphaltMat = new THREE.MeshLambertMaterial({
      color: 0x333538,
      flatShading: true
    });

    this.trackMesh = new THREE.Mesh(geom, asphaltMat);
    this.trackMesh.receiveShadow = true;
    this.scene.add(this.trackMesh);
  }

  createKerbsAndMarkings() {
    const divisions = 600;
    const up = new THREE.Vector3(0, 1, 0);
    const halfW = this.trackWidth / 2;
    const kerbW = 1.4;

    const kerbLeftGeom = new THREE.BufferGeometry();
    const kerbRightGeom = new THREE.BufferGeometry();

    const posL = [];
    const colL = [];
    const idxL = [];

    const posR = [];
    const colR = [];
    const idxR = [];

    const red = new THREE.Color(0xc81d25);
    const white = new THREE.Color(0xffffff);

    for (let i = 0; i <= divisions; i++) {
      const u = i / divisions;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Alternating red and white every few segments
      const stripePattern = Math.floor(i / 4) % 2 === 0;
      const color = stripePattern ? red : white;

      // Left kerb
      const lInner = new THREE.Vector3().copy(pt).addScaledVector(side, -halfW);
      const lOuter = new THREE.Vector3().copy(pt).addScaledVector(side, -halfW - kerbW);
      posL.push(lInner.x, lInner.y + 0.12, lInner.z);
      posL.push(lOuter.x, lOuter.y + 0.04, lOuter.z);
      colL.push(color.r, color.g, color.b);
      colL.push(color.r, color.g, color.b);

      // Right kerb
      const rInner = new THREE.Vector3().copy(pt).addScaledVector(side, halfW);
      const rOuter = new THREE.Vector3().copy(pt).addScaledVector(side, halfW + kerbW);
      posR.push(rInner.x, rInner.y + 0.12, rInner.z);
      posR.push(rOuter.x, rOuter.y + 0.04, rOuter.z);
      colR.push(color.r, color.g, color.b);
      colR.push(color.r, color.g, color.b);

      if (i < divisions) {
        const v1 = i * 2;
        const v2 = i * 2 + 1;
        const v3 = (i + 1) * 2;
        const v4 = (i + 1) * 2 + 1;

        idxL.push(v1, v2, v3, v2, v4, v3);
        idxR.push(v1, v2, v3, v2, v4, v3);
      }
    }

    kerbLeftGeom.setAttribute('position', new THREE.Float32BufferAttribute(posL, 3));
    kerbLeftGeom.setAttribute('color', new THREE.Float32BufferAttribute(colL, 3));
    kerbLeftGeom.setIndex(idxL);
    kerbLeftGeom.computeVertexNormals();

    kerbRightGeom.setAttribute('position', new THREE.Float32BufferAttribute(posR, 3));
    kerbRightGeom.setAttribute('color', new THREE.Float32BufferAttribute(colR, 3));
    kerbRightGeom.setIndex(idxR);
    kerbRightGeom.computeVertexNormals();

    const kerbMat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true
    });

    const meshL = new THREE.Mesh(kerbLeftGeom, kerbMat);
    const meshR = new THREE.Mesh(kerbRightGeom, kerbMat);
    meshL.receiveShadow = true;
    meshR.receiveShadow = true;
    this.scene.add(meshL);
    this.scene.add(meshR);

    // Dashed center line
    const dashGeom = new THREE.BoxGeometry(0.35, 0.02, 3.5);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dashInst = new THREE.InstancedMesh(dashGeom, dashMat, 120);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < 120; i++) {
      const u = i / 120;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      dummy.position.copy(pt).add(new THREE.Vector3(0, 0.08, 0));
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      dummy.updateMatrix();
      dashInst.setMatrixAt(i, dummy.matrix);
    }
    dashInst.instanceMatrix.needsUpdate = true;
    this.scene.add(dashInst);
  }

  createStartFinishArch() {
    const archGroup = new THREE.Group();
    const startPt = this.curve.getPointAt(0);
    const tangent = this.curve.getTangentAt(0);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    // Arch pillars
    const postMat = new THREE.MeshLambertMaterial({ color: 0x22252a, flatShading: true });
    const bannerMat = new THREE.MeshLambertMaterial({ color: 0x111318, flatShading: true });

    const postH = 8.5;
    const span = this.trackWidth + 4;

    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.8, postH, 0.8), postMat);
    leftPost.position.set(-span / 2, postH / 2, 0);
    archGroup.add(leftPost);

    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.8, postH, 0.8), postMat);
    rightPost.position.set(span / 2, postH / 2, 0);
    archGroup.add(rightPost);

    // Crossbeam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(span, 1.6, 1.2), bannerMat);
    beam.position.set(0, postH - 0.8, 0);
    archGroup.add(beam);

    // Checkered finish banner texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 512, 128);

    // Checkers
    const sqSize = 32;
    for (let x = 0; x < 512; x += sqSize) {
      for (let y = 0; y < 128; y += sqSize) {
        if (((x / sqSize) + (y / sqSize)) % 2 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, sqSize, sqSize);
        }
      }
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(30, 20, 452, 88);
    ctx.fillStyle = '#ffe600';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ START / FINISH ★', 256, 64);

    const bannerTex = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(span * 0.8, 1.4), signMat);
    sign.position.set(0, postH - 0.8, -0.62);
    archGroup.add(sign);

    // Gantry traffic lights
    const lightFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 0.4), postMat);
    lightFrame.position.set(0, postH - 2.0, 0);
    archGroup.add(lightFrame);

    const colors = [0xff2222, 0xffbb00, 0x00ff66];
    this.trafficLights = [];
    colors.forEach((col, idx) => {
      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.1, 10),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
      );
      lamp.rotation.x = Math.PI / 2;
      lamp.position.set(-1.4 + idx * 1.4, postH - 2.0, -0.22);
      archGroup.add(lamp);
      this.trafficLights.push(lamp);
    });

    // Orient arch along start line
    archGroup.position.copy(startPt);
    archGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
    this.scene.add(archGroup);
  }

  setTrafficLight(stage) {
    // stage: 0=off, 1=red, 2=yellow, 3=green
    if (!this.trafficLights) return;
    const activeColors = [0xff2222, 0xffbb00, 0x00ff66];
    this.trafficLights.forEach((lamp, idx) => {
      if (stage === 1 && idx === 0) {
        lamp.material.color.setHex(activeColors[0]);
      } else if (stage === 2 && (idx === 0 || idx === 1)) {
        lamp.material.color.setHex(activeColors[idx]);
      } else if (stage === 3 && idx === 2) {
        lamp.material.color.setHex(activeColors[2]);
      } else {
        lamp.material.color.setHex(0x222222);
      }
    });
  }

  createEnvironment() {
    // 1. Terrain Ground mesh with facet low-poly geometry
    const groundGeom = new THREE.PlaneGeometry(1600, 1600, 48, 48);
    groundGeom.rotateX(-Math.PI / 2);

    // Perturb vertices slightly for low-poly rolling hills
    const pos = groundGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);

      // Low terrain in the ocean region (west: x < 0), higher in Emerald Grove (x > 200)
      let vy = 0;
      if (vx < -50) {
        vy = -3.5; // Ocean water bed
      } else if (vx > 180 && vz > -150 && vz < 450) {
        vy = Math.sin(vx * 0.015) * 8 + Math.cos(vz * 0.015) * 6;
      }
      pos.setY(i, vy);
    }
    groundGeom.computeVertexNormals();

    const groundMat = new THREE.MeshLambertMaterial({
      color: 0x2d5a27, // Emerald green
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Low-Poly Ocean (Sunset Coast Biome)
    const oceanGeom = new THREE.PlaneGeometry(900, 1600, 32, 32);
    oceanGeom.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshLambertMaterial({
      color: 0x1b4965,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });
    const ocean = new THREE.Mesh(oceanGeom, oceanMat);
    ocean.position.set(-450, -1.2, 0);
    this.scene.add(ocean);

    // 3. Low-Poly Distant Mountain Silhouettes
    const mountainGeom = new THREE.ConeGeometry(70, 140, 5);
    const mountainMat = new THREE.MeshLambertMaterial({
      color: 0x3d2645, // Deep violet purple silhouette
      flatShading: true
    });

    for (let i = 0; i < 22; i++) {
      const m = new THREE.Mesh(mountainGeom, mountainMat);
      const angle = (i / 22) * Math.PI * 2;
      const dist = 650 + Math.sin(i * 3) * 60;
      m.position.set(Math.cos(angle) * dist, 60 + Math.random() * 30, Math.sin(angle) * dist);
      m.scale.set(1 + Math.random() * 0.6, 0.8 + Math.random() * 0.7, 1 + Math.random() * 0.6);
      this.scene.add(m);
    }

    // 4. Low-poly Pine Trees (Emerald Grove) & Palm Trees (Sunset Coast)
    this.populateTrees();
  }

  populateTrees() {
    const pineTrunkGeom = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 5);
    const pineCone1 = new THREE.ConeGeometry(2.4, 4.0, 5);
    const pineCone2 = new THREE.ConeGeometry(1.8, 3.2, 5);
    const pineCone3 = new THREE.ConeGeometry(1.2, 2.5, 5);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18, flatShading: true });
    const pineMat = new THREE.MeshLambertMaterial({ color: 0x1b4332, flatShading: true });
    const palmLeafMat = new THREE.MeshLambertMaterial({ color: 0x2d6a4f, flatShading: true });

    const numDecorations = 250;
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < numDecorations; i++) {
      const u = Math.random();
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Place to left or right, beyond track width
      const isLeft = Math.random() > 0.5;
      const offsetDist = (this.trackWidth / 2) + 6 + Math.random() * 55;
      const pos = new THREE.Vector3().copy(pt).addScaledVector(side, isLeft ? -offsetDist : offsetDist);

      // Biome selection: Near ocean / lower X -> Palm tree; Higher X -> Pine tree
      if (pos.x < 120 && isLeft) {
        // Palm tree on the coast
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(pineTrunkGeom, trunkMat);
        trunk.position.y = 2.0;
        trunk.rotation.z = (Math.random() - 0.5) * 0.2;
        treeGroup.add(trunk);

        // Palm fronds
        for (let f = 0; f < 5; f++) {
          const frond = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.4, 4), palmLeafMat);
          frond.position.set(0, 4.0, 0);
          frond.rotation.y = (f / 5) * Math.PI * 2;
          frond.rotation.z = 0.6;
          treeGroup.add(frond);
        }

        treeGroup.position.set(pos.x, pt.y - 0.2, pos.z);
        const s = 1.0 + Math.random() * 0.6;
        treeGroup.scale.set(s, s, s);
        this.scene.add(treeGroup);
      } else {
        // Pine tree in Emerald Grove
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(pineTrunkGeom, trunkMat);
        trunk.position.y = 1.75;
        treeGroup.add(trunk);

        const c1 = new THREE.Mesh(pineCone1, pineMat);
        c1.position.y = 4.2;
        treeGroup.add(c1);

        const c2 = new THREE.Mesh(pineCone2, pineMat);
        c2.position.y = 6.0;
        treeGroup.add(c2);

        const c3 = new THREE.Mesh(pineCone3, pineMat);
        c3.position.y = 7.5;
        treeGroup.add(c3);

        treeGroup.position.set(pos.x, pt.y - 0.2, pos.z);
        const s = 0.8 + Math.random() * 0.7;
        treeGroup.scale.set(s, s, s);
        this.scene.add(treeGroup);
      }
    }
  }

  /**
   * Find closest point on spline and normalized progress (0.0 to 1.0)
   */
  getTrackProgress(worldPos) {
    let bestU = 0;
    let minDistSq = Infinity;
    const samples = 120;

    for (let i = 0; i < samples; i++) {
      const u = i / samples;
      const pt = this.curve.getPointAt(u);
      const distSq = pt.distanceToSquared(worldPos);
      if (distSq < minDistSq) {
        minDistSq = distSq;
        bestU = u;
      }
    }

    // Fine-tune around bestU
    const step = 1 / (samples * 8);
    for (let delta = -4; delta <= 4; delta++) {
      let u = (bestU + delta * step + 1.0) % 1.0;
      const pt = this.curve.getPointAt(u);
      const distSq = pt.distanceToSquared(worldPos);
      if (distSq < minDistSq) {
        minDistSq = distSq;
        bestU = u;
      }
    }

    const tangent = this.curve.getTangentAt(bestU);
    const centerPt = this.curve.getPointAt(bestU);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const diff = new THREE.Vector3().subVectors(worldPos, centerPt);
    const lateralDist = diff.dot(side);

    return {
      u: bestU,
      centerPt,
      tangent,
      lateralDist,
      isOffroad: Math.abs(lateralDist) > (this.trackWidth / 2 + 1.2)
    };
  }
}
