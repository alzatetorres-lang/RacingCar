import * as THREE from 'three';

export const TRACK_CONFIGS = [
  {
    id: 'sunset_coast',
    name: 'EMERALD GROVE & METRO COAST',
    shortName: 'METRO COAST',
    theme: 'sunset',
    difficulty: 'NORMAL',
    desc: 'Circuito costero con puente colgante sobre el océano, salto de cresta, túnel de montaña y travesía por el centro urbano.',
    trackWidth: 18,
    roadColor: 0x333538,
    kerbColors: [0xc81d25, 0xffffff], // Red & White
    centerLineColor: 0xffffff,
    groundColor: 0x2d5a27,
    fogColor: 0x5a3b76,
    fogDensity: 0.0012,
    skyColor: 0x5a3b76,
    sunColor: 0xffd580,
    sunPosition: [-200, 120, -300],
    features: {
      bridge: { startU: 0.12, endU: 0.28, color: 0xc81d25 },
      jump: { u: 0.38, launchVel: 12.0 },
      tunnel: { startU: 0.52, endU: 0.68, lightColor: 0x00ff88 },
      city: { startU: 0.78, endU: 0.96 }
    },
    points: [
      new THREE.Vector3(0, 0, 0),         // Start Line
      new THREE.Vector3(0, 0, 160),       // Main straightaway
      new THREE.Vector3(50, 4, 300),      // Bridge approach
      new THREE.Vector3(140, 8, 420),     // Ocean Bridge Span
      new THREE.Vector3(260, 10, 450),    // Bridge exit
      new THREE.Vector3(380, 18, 380),    // Climb to jump ramp
      new THREE.Vector3(450, 14, 250),    // Jump crest launch & landing
      new THREE.Vector3(390, 16, 120),    // Mountain Ridge
      new THREE.Vector3(470, 16, 0),      // Tunnel Entry
      new THREE.Vector3(480, 12, -140),   // Tunnel interior
      new THREE.Vector3(400, 8, -280),    // Tunnel Exit / Hairpin
      new THREE.Vector3(260, 4, -350),    // Descent into City
      new THREE.Vector3(120, 2, -320),    // Downtown Boulevard
      new THREE.Vector3(-40, 0, -220),    // City Square Curves
      new THREE.Vector3(-60, 0, -90)      // Final straight entrance
    ]
  },
  {
    id: 'cyber_city',
    name: 'NEON CYBER CITY (TOKYO EXPRESSWAY)',
    shortName: 'CYBER CITY',
    theme: 'cyber',
    difficulty: 'HARD',
    desc: 'Metrópolis futurista con viaducto elevado, túnel cibernético hexagonal, rascacielos iluminados y rampa de salto.',
    trackWidth: 20,
    roadColor: 0x24283b,
    kerbColors: [0x00f0ff, 0xff007f], // Cyan & Electric Magenta
    centerLineColor: 0x00ffff,
    groundColor: 0x161824,
    fogColor: 0x241147,
    fogDensity: 0.0010,
    skyColor: 0x1b0838,
    sunColor: 0x00f0ff,
    sunPosition: [100, 160, -350],
    features: {
      bridge: { startU: 0.08, endU: 0.25, color: 0x00f0ff },
      jump: { u: 0.45, launchVel: 14.0 },
      tunnel: { startU: 0.60, endU: 0.78, lightColor: 0xff007f },
      city: { startU: 0.0, endU: 1.0 } // Entire track in the city!
    },
    points: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 200),
      new THREE.Vector3(-80, 5, 360),
      new THREE.Vector3(-220, 9, 420),
      new THREE.Vector3(-380, 12, 340),
      new THREE.Vector3(-420, 14, 160),
      new THREE.Vector3(-320, 8, 0),
      new THREE.Vector3(-240, 10, -160),
      new THREE.Vector3(-140, 14, -320),
      new THREE.Vector3(60, 10, -400),
      new THREE.Vector3(220, 6, -320),
      new THREE.Vector3(260, 3, -140),
      new THREE.Vector3(180, 0, -40)
    ]
  },
  {
    id: 'desert_canyon',
    name: 'MOJAVE DESERT CANYON',
    shortName: 'MOJAVE CANYON',
    theme: 'desert',
    difficulty: 'FAST',
    desc: 'Cañón de arenisca roja con puente sobre el desfiladero, túnel tallado en la roca y rampa de duna.',
    trackWidth: 19,
    roadColor: 0x483e35,
    kerbColors: [0xffb703, 0x222222], // Amber & Dark Grey
    centerLineColor: 0xffd166,
    groundColor: 0xc87d3b,
    fogColor: 0xc87d3b,
    fogDensity: 0.0010,
    skyColor: 0xe67e22,
    sunColor: 0xffe066,
    sunPosition: [-350, 140, -250],
    features: {
      bridge: { startU: 0.20, endU: 0.35, color: 0xd97736 },
      jump: { u: 0.50, launchVel: 13.0 },
      tunnel: { startU: 0.65, endU: 0.82, lightColor: 0xffb703 },
      city: { startU: 0.88, endU: 0.98 }
    },
    points: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 240),
      new THREE.Vector3(120, 3, 400),
      new THREE.Vector3(280, 6, 480),
      new THREE.Vector3(440, 10, 420),
      new THREE.Vector3(520, 16, 260),
      new THREE.Vector3(420, 12, 100),
      new THREE.Vector3(340, 8, -60),
      new THREE.Vector3(420, 6, -220),
      new THREE.Vector3(360, 3, -380),
      new THREE.Vector3(180, 2, -440),
      new THREE.Vector3(20, 0, -340),
      new THREE.Vector3(-60, 0, -180)
    ]
  },
  {
    id: 'frost_summit',
    name: 'NORDIC FROST SUMMIT',
    shortName: 'FROST SUMMIT',
    theme: 'snow',
    difficulty: 'EXPERT',
    desc: 'Cumbre alpina con túnel de hielo, puente sobre abismo helado y salto acrobático.',
    trackWidth: 18,
    roadColor: 0x2d3445,
    kerbColors: [0x48cae4, 0xffffff], // Ice Blue & Snow White
    centerLineColor: 0xffffff,
    groundColor: 0xdde5ed,
    fogColor: 0x5b7288,
    fogDensity: 0.0010,
    skyColor: 0x34495e,
    sunColor: 0xffffff,
    sunPosition: [-250, 150, 280],
    features: {
      bridge: { startU: 0.18, endU: 0.32, color: 0x48cae4 },
      jump: { u: 0.44, launchVel: 15.0 },
      tunnel: { startU: 0.62, endU: 0.76, lightColor: 0x70d6ff },
      city: { startU: 0.85, endU: 0.97 }
    },
    points: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 2, 180),
      new THREE.Vector3(80, 8, 320),
      new THREE.Vector3(200, 14, 380),
      new THREE.Vector3(320, 20, 300),
      new THREE.Vector3(280, 16, 140),
      new THREE.Vector3(160, 12, 40),
      new THREE.Vector3(180, 10, -100),
      new THREE.Vector3(300, 8, -200),
      new THREE.Vector3(340, 5, -340),
      new THREE.Vector3(220, 2, -420),
      new THREE.Vector3(80, 1, -360),
      new THREE.Vector3(-40, 0, -200)
    ]
  }
];

export class CircuitTrack {
  constructor(scene, circuitId = 'sunset_coast') {
    this.scene = scene;
    this.currentConfig = TRACK_CONFIGS.find(c => c.id === circuitId) || TRACK_CONFIGS[0];
    this.trackWidth = this.currentConfig.trackWidth;
    this.curve = null;
    this.totalLength = 0;
    this.checkpoints = [];

    // Scene group for all track meshes
    this.trackGroup = new THREE.Group();
    this.scene.add(this.trackGroup);

    this.buildCurrentTrack();
  }

  loadCircuit(circuitId) {
    const cfg = TRACK_CONFIGS.find(c => c.id === circuitId);
    if (!cfg) return false;

    this.currentConfig = cfg;
    this.trackWidth = cfg.trackWidth;

    // Dispose old geometries cleanly
    this.trackGroup.traverse(child => {
      if (child.isMesh && child.geometry) {
        child.geometry.dispose();
      }
    });
    this.trackGroup.clear();

    this.buildCurrentTrack();
    return true;
  }

  buildCurrentTrack() {
    this.createSpline();
    this.createAsphalt();
    this.createKerbsAndMarkings();
    this.createStartFinishArch();
    this.createEnvironment();
    this.createTrackSpecialFeatures();
  }

  createSpline() {
    this.curve = new THREE.CatmullRomCurve3(this.currentConfig.points, true, 'catmullrom', 0.2);
    this.totalLength = this.curve.getLength();

    this.checkpoints = [];
    const numCheckpoints = 60;
    for (let i = 0; i < numCheckpoints; i++) {
      const u = i / numCheckpoints;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      this.checkpoints.push({ index: i, u, position: pt, tangent });
    }
  }

  createAsphalt() {
    const divisions = 600;
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
      color: this.currentConfig.roadColor,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geom, asphaltMat);
    mesh.receiveShadow = true;
    this.trackGroup.add(mesh);
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

    const col1 = new THREE.Color(this.currentConfig.kerbColors[0]);
    const col2 = new THREE.Color(this.currentConfig.kerbColors[1]);

    for (let i = 0; i <= divisions; i++) {
      const u = i / divisions;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const stripePattern = Math.floor(i / 4) % 2 === 0;
      const color = stripePattern ? col1 : col2;

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
    this.trackGroup.add(meshL);
    this.trackGroup.add(meshR);

    // Center Dashed Line
    const dashGeom = new THREE.BoxGeometry(0.35, 0.02, 3.5);
    const dashMat = new THREE.MeshBasicMaterial({ color: this.currentConfig.centerLineColor });
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
    this.trackGroup.add(dashInst);
  }

  createStartFinishArch() {
    const archGroup = new THREE.Group();
    const startPt = this.curve.getPointAt(0);
    const tangent = this.curve.getTangentAt(0);
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

    const beam = new THREE.Mesh(new THREE.BoxGeometry(span, 1.6, 1.2), bannerMat);
    beam.position.set(0, postH - 0.8, 0);
    archGroup.add(beam);

    // Checkered banner
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 512, 128);

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
    ctx.fillText('★ ' + this.currentConfig.shortName + ' ★', 256, 64);

    const bannerTex = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(span * 0.8, 1.4), signMat);
    sign.position.set(0, postH - 0.8, -0.62);
    archGroup.add(sign);

    // Traffic lights
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

    archGroup.position.copy(startPt);
    archGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
    this.trackGroup.add(archGroup);
  }

  setTrafficLight(stage) {
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

  // ==========================================
  // SPECIAL FEATURES: TUNNELS, BRIDGES, JUMPS & CITY
  // ==========================================
  createTrackSpecialFeatures() {
    const f = this.currentConfig.features;
    if (!f) return;

    if (f.bridge) this.buildBridge(f.bridge.startU, f.bridge.endU, f.bridge.color);
    if (f.jump) this.buildJumpRamp(f.jump.u);
    if (f.tunnel) this.buildTunnel(f.tunnel.startU, f.tunnel.endU, f.tunnel.lightColor);
    if (f.city) this.buildCityDistrict(f.city.startU, f.city.endU);
  }

  /**
   * 3D Suspension / Truss Bridge with support pillars and steel beams
   */
  buildBridge(startU, endU, bridgeColor = 0xc81d25) {
    const bridgeGroup = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);
    const steps = 30;
    const uSpan = (endU - startU + 1.0) % 1.0;
    const halfW = (this.trackWidth / 2) + 0.8;

    const steelMat = new THREE.MeshLambertMaterial({ color: bridgeColor, flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1b1c22, flatShading: true });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });

    // Bridge road barriers and underside pillars
    for (let i = 0; i <= steps; i++) {
      const u = (startU + (i / steps) * uSpan) % 1.0;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Underside concrete pillars down to ground every 5 steps
      if (i % 6 === 0) {
        const pillarGeom = new THREE.CylinderGeometry(1.2, 1.5, Math.max(pt.y + 2, 4), 6);
        const pillar = new THREE.Mesh(pillarGeom, darkMat);
        pillar.position.set(pt.x, (pt.y - 0.5) / 2, pt.z);
        bridgeGroup.add(pillar);
      }

      // Left & Right bridge safety railings / steel trusses
      [-halfW, halfW].forEach(offset => {
        const pos = new THREE.Vector3().copy(pt).addScaledVector(side, offset);
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.5), steelMat);
        post.position.set(pos.x, pt.y + 1.1, pos.z);
        bridgeGroup.add(post);
      });
    }

    // Suspension Towers at bridge center
    const midU = (startU + uSpan * 0.5) % 1.0;
    const midPt = this.curve.getPointAt(midU);
    const midTangent = this.curve.getTangentAt(midU);
    const midSide = new THREE.Vector3().crossVectors(midTangent, up).normalize();

    [-halfW - 0.5, halfW + 0.5].forEach(offset => {
      const towerBase = new THREE.Vector3().copy(midPt).addScaledVector(midSide, offset);
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 26, 1.6), steelMat);
      tower.position.set(towerBase.x, midPt.y + 13, towerBase.z);
      bridgeGroup.add(tower);

      // Suspension cable lines
      const cableGeom = new THREE.CylinderGeometry(0.08, 0.08, 35, 4);
      cableGeom.rotateZ(Math.PI / 4);
      const cable = new THREE.Mesh(cableGeom, cableMat);
      cable.position.set(towerBase.x, midPt.y + 12, towerBase.z);
      bridgeGroup.add(cable);
    });

    this.trackGroup.add(bridgeGroup);
  }

  /**
   * 3D Jump Ramp with launch markers and airborne crest
   */
  buildJumpRamp(u) {
    const pt = this.curve.getPointAt(u);
    const tangent = this.curve.getTangentAt(u);
    const up = new THREE.Vector3(0, 1, 0);

    const rampGroup = new THREE.Group();
    rampGroup.position.copy(pt);
    rampGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

    // Hazard ramp wedge
    const rampGeom = new THREE.BoxGeometry(this.trackWidth * 0.9, 1.4, 12);
    rampGeom.rotateX(0.12);

    const rampMat = new THREE.MeshLambertMaterial({
      color: 0xffcc00,
      flatShading: true
    });
    const ramp = new THREE.Mesh(rampGeom, rampMat);
    ramp.position.set(0, 0.45, 0);
    rampGroup.add(ramp);

    // Chevron hazard signs on sides
    [-this.trackWidth / 2 - 0.5, this.trackWidth / 2 + 0.5].forEach(x => {
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 3.5, 3.5),
        new THREE.MeshBasicMaterial({ color: 0xff2222 })
      );
      sign.position.set(x, 1.8, 0);
      rampGroup.add(sign);
    });

    this.trackGroup.add(rampGroup);
  }

  /**
   * 3D Mountain / Cyber Tunnel with arched entrance and neon ceiling ribs
   */
  buildTunnel(startU, endU, neonColor = 0x00ff88) {
    const tunnelGroup = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);
    const steps = 35;
    const uSpan = (endU - startU + 1.0) % 1.0;
    const span = this.trackWidth + 3.5;
    const tunnelH = 8.5;

    const concreteMat = new THREE.MeshLambertMaterial({ color: 0x1f232b, flatShading: true });
    const neonMat = new THREE.MeshBasicMaterial({ color: neonColor });

    // Portal entrance & exit arches
    [startU, endU].forEach(u => {
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);

      const portal = new THREE.Group();
      portal.position.copy(pt);
      portal.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

      const archL = new THREE.Mesh(new THREE.BoxGeometry(1.8, tunnelH, 2.5), concreteMat);
      archL.position.set(-span / 2, tunnelH / 2, 0);
      portal.add(archL);

      const archR = new THREE.Mesh(new THREE.BoxGeometry(1.8, tunnelH, 2.5), concreteMat);
      archR.position.set(span / 2, tunnelH / 2, 0);
      portal.add(archR);

      const archTop = new THREE.Mesh(new THREE.BoxGeometry(span + 2, 2.2, 2.5), concreteMat);
      archTop.position.set(0, tunnelH, 0);
      portal.add(archTop);

      // Neon sign on portal
      const sign = new THREE.Mesh(new THREE.BoxGeometry(span * 0.7, 1.2, 0.4), neonMat);
      sign.position.set(0, tunnelH - 0.2, 1.3);
      portal.add(sign);

      tunnelGroup.add(portal);
    });

    // Rib arches along the tunnel
    for (let i = 1; i < steps; i++) {
      const u = (startU + (i / steps) * uSpan) % 1.0;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);

      const rib = new THREE.Group();
      rib.position.copy(pt);
      rib.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

      // Left & Right walls
      const wallL = new THREE.Mesh(new THREE.BoxGeometry(1.2, tunnelH, 1.2), concreteMat);
      wallL.position.set(-span / 2, tunnelH / 2, 0);
      rib.add(wallL);

      const wallR = new THREE.Mesh(new THREE.BoxGeometry(1.2, tunnelH, 1.2), concreteMat);
      wallR.position.set(span / 2, tunnelH / 2, 0);
      rib.add(wallR);

      // Roof beam
      const roof = new THREE.Mesh(new THREE.BoxGeometry(span, 1.2, 1.2), concreteMat);
      roof.position.set(0, tunnelH, 0);
      rib.add(roof);

      // Glowing ceiling neon strip
      const strip = new THREE.Mesh(new THREE.BoxGeometry(span * 0.5, 0.3, 0.8), neonMat);
      strip.position.set(0, tunnelH - 0.5, 0);
      rib.add(strip);

      tunnelGroup.add(rib);
    }

    this.trackGroup.add(tunnelGroup);
  }

  /**
   * Downtown City District with dense skyscrapers and overhead gantries
   */
  buildCityDistrict(startU, endU) {
    const cityGroup = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);
    const steps = 24;
    const uSpan = (endU - startU + 1.0) % 1.0;

    const buildingColors = [0x1c2333, 0x222a3f, 0x2b344e, 0x181e2b];
    const neonColors = [0x00f0ff, 0xff007f, 0xffe600, 0x00ff66];

    for (let i = 0; i <= steps; i++) {
      const u = (startU + (i / steps) * uSpan) % 1.0;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Buildings on both sides, closer to road curbs
      [-1, 1].forEach(dir => {
        const dist = (this.trackWidth / 2) + 6 + Math.random() * 25;
        const pos = new THREE.Vector3().copy(pt).addScaledVector(side, dir * dist);

        const w = 18 + Math.random() * 20;
        const d = 18 + Math.random() * 20;
        const h = 50 + Math.random() * 110;

        const bGeom = new THREE.BoxGeometry(w, h, d);
        const bMat = new THREE.MeshLambertMaterial({
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
          flatShading: true
        });
        const building = new THREE.Mesh(bGeom, bMat);
        building.position.set(pos.x, h / 2, pos.z);
        cityGroup.add(building);

        // Lit rooftop neon sign
        if (Math.random() > 0.4) {
          const signGeom = new THREE.BoxGeometry(w * 0.75, 4, 2);
          const signMat = new THREE.MeshBasicMaterial({
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
          });
          const sign = new THREE.Mesh(signGeom, signMat);
          sign.position.set(pos.x, h + 2, pos.z);
          cityGroup.add(sign);
        }
      });

      // Overhead highway billboard gantry every 8 steps
      if (i % 8 === 0) {
        const gantry = new THREE.Group();
        gantry.position.copy(pt);
        gantry.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        const postH = 8.5;
        const span = this.trackWidth + 3;

        const postL = new THREE.Mesh(new THREE.BoxGeometry(0.8, postH, 0.8), new THREE.MeshLambertMaterial({ color: 0x22252a }));
        postL.position.set(-span / 2, postH / 2, 0);
        gantry.add(postL);

        const postR = new THREE.Mesh(new THREE.BoxGeometry(0.8, postH, 0.8), new THREE.MeshLambertMaterial({ color: 0x22252a }));
        postR.position.set(span / 2, postH / 2, 0);
        gantry.add(postR);

        const board = new THREE.Mesh(
          new THREE.BoxGeometry(span, 2.2, 0.8),
          new THREE.MeshBasicMaterial({ color: 0x00d2d3 })
        );
        board.position.set(0, postH - 0.5, 0);
        gantry.add(board);

        cityGroup.add(gantry);
      }
    }

    this.trackGroup.add(cityGroup);
  }

  createEnvironment() {
    const theme = this.currentConfig.theme;

    // Terrain Ground Mesh (always at y = -0.35, under all road points)
    const groundGeom = new THREE.PlaneGeometry(2000, 2000, 32, 32);
    groundGeom.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshLambertMaterial({
      color: this.currentConfig.groundColor,
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.y = -0.35;
    ground.receiveShadow = true;
    this.trackGroup.add(ground);

    if (theme === 'sunset') {
      this.createSunsetEnvironment();
    } else if (theme === 'cyber') {
      this.createCyberCityEnvironment();
    } else if (theme === 'desert') {
      this.createDesertEnvironment();
    } else if (theme === 'snow') {
      this.createSnowEnvironment();
    }
  }

  createSunsetEnvironment() {
    const oceanGeom = new THREE.PlaneGeometry(900, 1800, 24, 24);
    oceanGeom.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshLambertMaterial({
      color: 0x1b4965,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });
    const ocean = new THREE.Mesh(oceanGeom, oceanMat);
    ocean.position.set(-450, -1.2, 0);
    this.trackGroup.add(ocean);

    const mGeom = new THREE.ConeGeometry(70, 140, 5);
    const mMat = new THREE.MeshLambertMaterial({ color: 0x3d2645, flatShading: true });
    for (let i = 0; i < 20; i++) {
      const m = new THREE.Mesh(mGeom, mMat);
      const angle = (i / 20) * Math.PI * 2;
      m.position.set(Math.cos(angle) * 700, 60, Math.sin(angle) * 700);
      m.scale.set(1.2, 1.0, 1.2);
      this.trackGroup.add(m);
    }

    this.scatterTrees(0x1b4332, 0x2d6a4f, true);
  }

  createCyberCityEnvironment() {
    // Cyber City skyscrapers already populated by features.city!
  }

  createDesertEnvironment() {
    const butteGeom = new THREE.CylinderGeometry(20, 45, 60, 6);
    const butteMat = new THREE.MeshLambertMaterial({ color: 0x934b1e, flatShading: true });

    for (let i = 0; i < 28; i++) {
      const b = new THREE.Mesh(butteGeom, butteMat);
      const u = (i / 28);
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const dist = (this.trackWidth / 2) + 25 + Math.random() * 90;
      const isLeft = i % 2 === 0;
      const pos = new THREE.Vector3().copy(pt).addScaledVector(side, isLeft ? -dist : dist);

      b.position.set(pos.x, 25, pos.z);
      const s = 0.8 + Math.random() * 0.8;
      b.scale.set(s, s * 0.9, s);
      this.trackGroup.add(b);
    }

    const cactusMat = new THREE.MeshLambertMaterial({ color: 0x386641, flatShading: true });
    const stemGeom = new THREE.CylinderGeometry(0.4, 0.5, 7, 6);
    for (let i = 0; i < 110; i++) {
      const u = Math.random();
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const dist = (this.trackWidth / 2) + 5 + Math.random() * 45;
      const pos = new THREE.Vector3().copy(pt).addScaledVector(side, Math.random() > 0.5 ? -dist : dist);

      const cactus = new THREE.Mesh(stemGeom, cactusMat);
      cactus.position.set(pos.x, pt.y + 3.5, pos.z);
      this.trackGroup.add(cactus);
    }
  }

  createSnowEnvironment() {
    const peakGeom = new THREE.ConeGeometry(80, 160, 5);
    const peakMat = new THREE.MeshLambertMaterial({ color: 0xe0e6ed, flatShading: true });

    for (let i = 0; i < 24; i++) {
      const p = new THREE.Mesh(peakGeom, peakMat);
      const angle = (i / 24) * Math.PI * 2;
      p.position.set(Math.cos(angle) * 720, 70, Math.sin(angle) * 720);
      p.scale.set(1.3, 1.2, 1.3);
      this.trackGroup.add(p);
    }

    this.scatterTrees(0xedf2f4, 0x8d99ae, false);
  }

  scatterTrees(color1, color2, allowPalms = true) {
    const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 5);
    const cone1 = new THREE.ConeGeometry(2.4, 4.0, 5);
    const cone2 = new THREE.ConeGeometry(1.8, 3.2, 5);
    const cone3 = new THREE.ConeGeometry(1.2, 2.5, 5);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18, flatShading: true });
    const leafMat = new THREE.MeshLambertMaterial({ color: color1, flatShading: true });
    const palmMat = new THREE.MeshLambertMaterial({ color: color2, flatShading: true });

    const numTrees = 180;
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < numTrees; i++) {
      const u = Math.random();
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const isLeft = Math.random() > 0.5;
      const offsetDist = (this.trackWidth / 2) + 6 + Math.random() * 55;
      const pos = new THREE.Vector3().copy(pt).addScaledVector(side, isLeft ? -offsetDist : offsetDist);

      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 1.75;
      treeGroup.add(trunk);

      if (allowPalms && pos.x < 120 && isLeft) {
        for (let f = 0; f < 5; f++) {
          const frond = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.4, 4), palmMat);
          frond.position.set(0, 4.0, 0);
          frond.rotation.y = (f / 5) * Math.PI * 2;
          frond.rotation.z = 0.6;
          treeGroup.add(frond);
        }
      } else {
        const c1 = new THREE.Mesh(cone1, leafMat);
        c1.position.y = 4.2;
        treeGroup.add(c1);

        const c2 = new THREE.Mesh(cone2, leafMat);
        c2.position.y = 6.0;
        treeGroup.add(c2);

        const c3 = new THREE.Mesh(cone3, leafMat);
        c3.position.y = 7.5;
        treeGroup.add(c3);
      }

      treeGroup.position.set(pos.x, pt.y - 0.2, pos.z);
      const s = 0.8 + Math.random() * 0.6;
      treeGroup.scale.set(s, s, s);
      this.trackGroup.add(treeGroup);
    }
  }

  getTrackProgress(worldPos) {
    let bestU = 0;
    let minDistSq = Infinity;
    const samples = 100;

    for (let i = 0; i < samples; i++) {
      const u = i / samples;
      const pt = this.curve.getPointAt(u);
      const distSq = pt.distanceToSquared(worldPos);
      if (distSq < minDistSq) {
        minDistSq = distSq;
        bestU = u;
      }
    }

    const step = 1 / (samples * 6);
    for (let delta = -3; delta <= 3; delta++) {
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
      side,
      lateralDist,
      isOffroad: Math.abs(lateralDist) > (this.trackWidth / 2)
    };
  }
}
