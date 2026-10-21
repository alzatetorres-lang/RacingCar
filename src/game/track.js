import * as THREE from 'three';

export const TRACK_CONFIGS = [
  {
    id: 'sunset_coast',
    name: 'EMERALD GROVE & SUNSET COAST',
    shortName: 'EMERALD GROVE',
    theme: 'sunset',
    difficulty: 'NORMAL',
    desc: 'Atardecer costero con curvas abiertas en S, palmeras y frondosos pinares.',
    trackWidth: 18,
    roadColor: 0x333538,
    kerbColors: [0xc81d25, 0xffffff], // Red & White
    centerLineColor: 0xffffff,
    groundColor: 0x2d5a27,
    fogColor: 0x5a3b76,
    fogDensity: 0.0018,
    skyTexture: '/assets/images/skybox-sunset.jpg',
    sunColor: 0xffd580,
    sunPosition: [-200, 120, -300],
    points: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 160),
      new THREE.Vector3(50, 4, 300),
      new THREE.Vector3(140, 8, 420),
      new THREE.Vector3(260, 12, 450),
      new THREE.Vector3(380, 16, 380),
      new THREE.Vector3(450, 22, 250),
      new THREE.Vector3(390, 20, 120),
      new THREE.Vector3(470, 18, 0),
      new THREE.Vector3(480, 14, -140),
      new THREE.Vector3(400, 10, -280),
      new THREE.Vector3(260, 6, -350),
      new THREE.Vector3(120, 2, -320),
      new THREE.Vector3(-40, 0, -220),
      new THREE.Vector3(-60, 0, -90)
    ]
  },
  {
    id: 'cyber_city',
    name: 'NEON CYBER CITY (TOKYO EXPRESSWAY)',
    shortName: 'CYBER CITY',
    theme: 'cyber',
    difficulty: 'HARD',
    desc: 'Autopista nocturna elevada entre rascacielos iluminados, bordillos neón y curvas técnicas de 90°.',
    trackWidth: 20,
    roadColor: 0x15161e,
    kerbColors: [0x00d2d3, 0xff007f], // Cyan & Electric Magenta
    centerLineColor: 0x00ffff,
    groundColor: 0x0a0c14,
    fogColor: 0x120826,
    fogDensity: 0.0022,
    skyColor: 0x070514,
    sunColor: 0x9b59b6,
    sunPosition: [100, 150, -400],
    points: [
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(0, 5, 200),
      new THREE.Vector3(-80, 10, 360),
      new THREE.Vector3(-220, 15, 420),
      new THREE.Vector3(-380, 15, 340),
      new THREE.Vector3(-420, 12, 160),
      new THREE.Vector3(-320, 8, 0),
      new THREE.Vector3(-240, 14, -160),
      new THREE.Vector3(-140, 18, -320),
      new THREE.Vector3(60, 14, -400),
      new THREE.Vector3(220, 10, -320),
      new THREE.Vector3(260, 6, -140),
      new THREE.Vector3(180, 5, -40)
    ]
  },
  {
    id: 'desert_canyon',
    name: 'MOJAVE DESERT CANYON',
    shortName: 'MOJAVE CANYON',
    theme: 'desert',
    difficulty: 'FAST',
    desc: 'Pista rápida a través de cañones de arenisca roja, mesetas y rectas de máxima velocidad.',
    trackWidth: 19,
    roadColor: 0x3d352e,
    kerbColors: [0xffb703, 0x222222], // Amber & Dark Grey
    centerLineColor: 0xffd166,
    groundColor: 0xbc6c25, // Sandstone ochre
    fogColor: 0x8a3e14,
    fogDensity: 0.0016,
    skyColor: 0xff7b00,
    sunColor: 0xffe66d,
    sunPosition: [-400, 100, -200],
    points: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 240),
      new THREE.Vector3(120, -4, 400),
      new THREE.Vector3(280, -6, 480),
      new THREE.Vector3(440, 2, 420),
      new THREE.Vector3(520, 12, 260),
      new THREE.Vector3(420, 16, 100),
      new THREE.Vector3(340, 10, -60),
      new THREE.Vector3(420, 4, -220),
      new THREE.Vector3(360, -2, -380),
      new THREE.Vector3(180, -4, -440),
      new THREE.Vector3(20, -2, -340),
      new THREE.Vector3(-60, 0, -180)
    ]
  },
  {
    id: 'frost_summit',
    name: 'NORDIC FROST SUMMIT',
    shortName: 'FROST SUMMIT',
    theme: 'snow',
    difficulty: 'EXPERT',
    desc: 'Paso montañoso nevado con horquillas cerradas, bordillos gélidos y aurora boreal.',
    trackWidth: 18,
    roadColor: 0x252a36,
    kerbColors: [0x48cae4, 0xffffff], // Ice Blue & Snow White
    centerLineColor: 0xffffff,
    groundColor: 0xd8e2dc, // Snow white
    fogColor: 0x3a506b,
    fogDensity: 0.002,
    skyColor: 0x1b263b,
    sunColor: 0xcaf0f8,
    sunPosition: [-300, 140, 300],
    points: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 4, 180),
      new THREE.Vector3(80, 14, 320),
      new THREE.Vector3(200, 26, 380),
      new THREE.Vector3(320, 38, 300),
      new THREE.Vector3(280, 34, 140),
      new THREE.Vector3(160, 28, 40),
      new THREE.Vector3(180, 22, -100),
      new THREE.Vector3(300, 18, -200),
      new THREE.Vector3(340, 12, -340),
      new THREE.Vector3(220, 6, -420),
      new THREE.Vector3(80, 2, -360),
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

    // Scene group for this track so we can rebuild/switch smoothly
    this.trackGroup = new THREE.Group();
    this.scene.add(this.trackGroup);

    this.buildCurrentTrack();
  }

  loadCircuit(circuitId) {
    const cfg = TRACK_CONFIGS.find(c => c.id === circuitId);
    if (!cfg) return false;

    this.currentConfig = cfg;
    this.trackWidth = cfg.trackWidth;

    // Clear old track elements
    while (this.trackGroup.children.length > 0) {
      const obj = this.trackGroup.children[0];
      this.trackGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    this.buildCurrentTrack();
    return true;
  }

  buildCurrentTrack() {
    this.createSpline();
    this.createAsphalt();
    this.createKerbsAndMarkings();
    this.createStartFinishArch();
    this.createEnvironment();
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

  createEnvironment() {
    const theme = this.currentConfig.theme;

    // 1. Terrain Ground Mesh
    const groundGeom = new THREE.PlaneGeometry(1800, 1800, 32, 32);
    groundGeom.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshLambertMaterial({
      color: this.currentConfig.groundColor,
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    this.trackGroup.add(ground);

    // 2. Theme-Specific Props
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
    // Ocean on the left
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

    // Mountains
    const mGeom = new THREE.ConeGeometry(70, 140, 5);
    const mMat = new THREE.MeshLambertMaterial({ color: 0x3d2645, flatShading: true });
    for (let i = 0; i < 20; i++) {
      const m = new THREE.Mesh(mGeom, mMat);
      const angle = (i / 20) * Math.PI * 2;
      m.position.set(Math.cos(angle) * 700, 60, Math.sin(angle) * 700);
      m.scale.set(1.2, 1.0, 1.2);
      this.trackGroup.add(m);
    }

    // Trees
    this.scatterTrees(0x1b4332, 0x2d6a4f, true);
  }

  createCyberCityEnvironment() {
    // Futuristic low-poly skyscrapers
    const buildingColors = [0x121420, 0x1a1e2e, 0x252a3d, 0x11131a];
    const neonColors = [0x00d2d3, 0xff007f, 0xffd32a, 0x3c40c6];

    for (let i = 0; i < 90; i++) {
      const u = Math.random();
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u);
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const offsetDist = (this.trackWidth / 2) + 12 + Math.random() * 80;
      const isLeft = Math.random() > 0.5;
      const pos = new THREE.Vector3().copy(pt).addScaledVector(side, isLeft ? -offsetDist : offsetDist);

      const w = 15 + Math.random() * 25;
      const d = 15 + Math.random() * 25;
      const h = 40 + Math.random() * 120;

      const bGeom = new THREE.BoxGeometry(w, h, d);
      const bMat = new THREE.MeshLambertMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        flatShading: true
      });
      const building = new THREE.Mesh(bGeom, bMat);
      building.position.set(pos.x, h / 2, pos.z);
      this.trackGroup.add(building);

      // Neon rooftop spire or billboard
      if (Math.random() > 0.4) {
        const beaconGeom = new THREE.BoxGeometry(w * 0.7, 3, 2);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
        const beacon = new THREE.Mesh(beaconGeom, beaconMat);
        beacon.position.set(pos.x, h + 1.5, pos.z);
        this.trackGroup.add(beacon);
      }
    }
  }

  createDesertEnvironment() {
    // Sandstone Buttes & Cacti
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

    // Cacti
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
    // Snowy mountains
    const peakGeom = new THREE.ConeGeometry(80, 160, 5);
    const peakMat = new THREE.MeshLambertMaterial({ color: 0xe0e6ed, flatShading: true });

    for (let i = 0; i < 24; i++) {
      const p = new THREE.Mesh(peakGeom, peakMat);
      const angle = (i / 24) * Math.PI * 2;
      p.position.set(Math.cos(angle) * 720, 70, Math.sin(angle) * 720);
      p.scale.set(1.3, 1.2, 1.3);
      this.trackGroup.add(p);
    }

    // Snow covered pine trees
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

    const numTrees = 200;
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
