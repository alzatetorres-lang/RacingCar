import * as THREE from 'three';

/**
 * Creates an authentic 80s low-poly flat-shaded wedge supercar (F40 / Countach)
 * @param {Object} options
 * @param {string} options.bodyColor
 * @param {string} options.stripeColor
 * @param {string} options.plateText
 * @param {boolean} options.isPlayer
 * @returns {THREE.Group}
 */
export function createRetroCar(options = {}) {
  const {
    bodyColor = 0xc81d25,
    stripeColor = 0xffffff,
    plateText = 'APEX-88',
    isPlayer = false
  } = options;

  const carGroup = new THREE.Group();
  carGroup.name = isPlayer ? 'PlayerCar' : 'RivalCar';

  // Materials with flatShading: true
  const bodyMat = new THREE.MeshLambertMaterial({
    color: bodyColor,
    flatShading: true
  });

  const stripeMat = new THREE.MeshLambertMaterial({
    color: stripeColor,
    flatShading: true
  });

  const darkTrimMat = new THREE.MeshLambertMaterial({
    color: 0x1a1c23,
    flatShading: true
  });

  const windowMat = new THREE.MeshLambertMaterial({
    color: 0x111318,
    flatShading: true
  });

  const rimMat = new THREE.MeshLambertMaterial({
    color: 0xcccccc,
    flatShading: true
  });

  const tireMat = new THREE.MeshLambertMaterial({
    color: 0x222225,
    flatShading: true
  });

  const headlightMat = new THREE.MeshBasicMaterial({
    color: 0xccf2ff
  });

  const taillightMat = new THREE.MeshBasicMaterial({
    color: 0xff2a2a
  });

  const exhaustMat = new THREE.MeshLambertMaterial({
    color: 0x888888,
    flatShading: true
  });

  // Main chassis (lower wedge body)
  const chassisGeom = new THREE.BoxGeometry(2.0, 0.45, 4.4);
  const chassis = new THREE.Mesh(chassisGeom, bodyMat);
  chassis.position.y = 0.45;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  carGroup.add(chassis);

  // Front wedge nose
  const noseGeom = new THREE.BoxGeometry(1.95, 0.25, 1.2);
  const nose = new THREE.Mesh(noseGeom, bodyMat);
  nose.position.set(0, 0.35, -2.1);
  nose.rotation.x = 0.15;
  nose.castShadow = true;
  carGroup.add(nose);

  // Front splitter
  const splitterGeom = new THREE.BoxGeometry(2.05, 0.08, 0.6);
  const splitter = new THREE.Mesh(splitterGeom, darkTrimMat);
  splitter.position.set(0, 0.18, -2.4);
  carGroup.add(splitter);

  // Cabin / Greenhouse
  const cabinGeom = new THREE.BoxGeometry(1.6, 0.48, 2.1);
  const cabin = new THREE.Mesh(cabinGeom, windowMat);
  cabin.position.set(0, 0.82, 0.0);
  cabin.castShadow = true;
  carGroup.add(cabin);

  // Roof cap
  const roofGeom = new THREE.BoxGeometry(1.5, 0.08, 1.5);
  const roof = new THREE.Mesh(roofGeom, bodyMat);
  roof.position.set(0, 1.08, 0.0);
  carGroup.add(roof);

  // Windshield slant (front)
  const windshieldGeom = new THREE.BoxGeometry(1.55, 0.45, 0.8);
  const windshield = new THREE.Mesh(windshieldGeom, windowMat);
  windshield.position.set(0, 0.72, -1.0);
  windshield.rotation.x = -0.55;
  carGroup.add(windshield);

  // Rear window slant (engine cover slats)
  const rearGlassGeom = new THREE.BoxGeometry(1.55, 0.42, 0.9);
  const rearGlass = new THREE.Mesh(rearGlassGeom, darkTrimMat);
  rearGlass.position.set(0, 0.72, 1.15);
  rearGlass.rotation.x = 0.45;
  carGroup.add(rearGlass);

  // Twin white racing stripes (hood, roof, rear)
  const stripeWidth = 0.18;
  const stripeGap = 0.12;

  [-stripeGap, stripeGap].forEach(xOffset => {
    // Front stripe
    const frontStripeGeom = new THREE.PlaneGeometry(stripeWidth, 1.8);
    const frontStripe = new THREE.Mesh(frontStripeGeom, stripeMat);
    frontStripe.rotation.x = -Math.PI / 2 + 0.12;
    frontStripe.position.set(xOffset, 0.69, -1.4);
    carGroup.add(frontStripe);

    // Roof stripe
    const roofStripeGeom = new THREE.PlaneGeometry(stripeWidth, 1.5);
    const roofStripe = new THREE.Mesh(roofStripeGeom, stripeMat);
    roofStripe.rotation.x = -Math.PI / 2;
    roofStripe.position.set(xOffset, 1.13, 0.0);
    carGroup.add(roofStripe);

    // Rear engine cover stripe
    const rearStripeGeom = new THREE.PlaneGeometry(stripeWidth, 1.0);
    const rearStripe = new THREE.Mesh(rearStripeGeom, stripeMat);
    rearStripe.rotation.x = -Math.PI / 2 - 0.4;
    rearStripe.position.set(xOffset, 0.85, 1.25);
    carGroup.add(rearStripe);
  });

  // Side air intakes (Countach / F40 style NACA ducts)
  [-1.01, 1.01].forEach(x => {
    const ductGeom = new THREE.BoxGeometry(0.08, 0.35, 0.9);
    const duct = new THREE.Mesh(ductGeom, darkTrimMat);
    duct.position.set(x, 0.52, 0.7);
    carGroup.add(duct);
  });

  // Rear Wing Spoiler
  const spoilerWingGeom = new THREE.BoxGeometry(2.1, 0.08, 0.5);
  const spoilerWing = new THREE.Mesh(spoilerWingGeom, bodyMat);
  spoilerWing.position.set(0, 1.02, 2.1);
  spoilerWing.castShadow = true;
  carGroup.add(spoilerWing);

  // Wing uprights
  [-0.75, 0.75].forEach(x => {
    const postGeom = new THREE.BoxGeometry(0.08, 0.42, 0.3);
    const post = new THREE.Mesh(postGeom, bodyMat);
    post.position.set(x, 0.82, 2.1);
    carGroup.add(post);
  });

  // Headlights (rectangular pop-up style)
  [-0.65, 0.65].forEach(x => {
    const lightGeom = new THREE.BoxGeometry(0.35, 0.14, 0.05);
    const light = new THREE.Mesh(lightGeom, headlightMat);
    light.position.set(x, 0.42, -2.22);
    carGroup.add(light);
  });

  // Taillights (quad circular / rectangular red glowing pods)
  [-0.7, -0.4, 0.4, 0.7].forEach(x => {
    const tailGeom = new THREE.BoxGeometry(0.2, 0.16, 0.05);
    const tail = new THREE.Mesh(tailGeom, taillightMat);
    tail.position.set(x, 0.52, 2.21);
    carGroup.add(tail);
  });

  // License Plate: "APEX-88" on player, or custom
  const plateCanvas = document.createElement('canvas');
  plateCanvas.width = 128;
  plateCanvas.height = 48;
  const ctx = plateCanvas.getContext('2d');
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, 128, 48);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 44);
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plateText, 64, 25);

  const plateTex = new THREE.CanvasTexture(plateCanvas);
  const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });
  const plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), plateMat);
  plateMesh.position.set(0, 0.45, 2.22);
  carGroup.add(plateMesh);

  // Quad exhaust pipes
  const exhausts = [];
  [-0.45, -0.32, 0.32, 0.45].forEach(x => {
    const pipeGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
    pipeGeom.rotateX(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeom, exhaustMat);
    pipe.position.set(x, 0.28, 2.25);
    carGroup.add(pipe);
    exhausts.push(new THREE.Vector3(x, 0.28, 2.35));
  });
  carGroup.userData.exhaustPoints = exhausts;

  // Wheels (4 low-poly wheels with rims)
  const wheelGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 10);
  wheelGeom.rotateZ(Math.PI / 2);

  const rimGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.32, 5);
  rimGeom.rotateZ(Math.PI / 2);

  const wheels = [];
  const wheelPositions = [
    { x: -1.02, y: 0.38, z: -1.35, isFront: true, isLeft: true },  // Front Left
    { x: 1.02, y: 0.38, z: -1.35, isFront: true, isLeft: false },  // Front Right
    { x: -1.05, y: 0.38, z: 1.35, isFront: false, isLeft: true },   // Rear Left
    { x: 1.05, y: 0.38, z: 1.35, isFront: false, isLeft: false }    // Rear Right
  ];

  wheelPositions.forEach(wp => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wp.x, wp.y, wp.z);

    const tire = new THREE.Mesh(wheelGeom, tireMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rim = new THREE.Mesh(rimGeom, rimMat);
    wheelGroup.add(rim);

    wheelGroup.userData = wp;
    carGroup.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  carGroup.userData.wheels = wheels;

  // Headlight spot/point lights for night/sunset feel
  if (isPlayer) {
    const headPointL = new THREE.PointLight(0xccf2ff, 1.2, 35);
    headPointL.position.set(-0.65, 0.5, -2.4);
    carGroup.add(headPointL);

    const headPointR = new THREE.PointLight(0xccf2ff, 1.2, 35);
    headPointR.position.set(0.65, 0.5, -2.4);
    carGroup.add(headPointR);
  }

  return carGroup;
}
