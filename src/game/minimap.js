export class Minimap {
  constructor(canvasElement, circuitTrack) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.track = circuitTrack;
    this.width = canvasElement.width;
    this.height = canvasElement.height;

    // Compute bounding box of track curve
    this.bounds = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
    const samples = 150;
    this.trackPoints = [];

    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const pt = this.track.curve.getPointAt(u);
      this.trackPoints.push({ x: pt.x, z: pt.z });

      if (pt.x < this.bounds.minX) this.bounds.minX = pt.x;
      if (pt.x > this.bounds.maxX) this.bounds.maxX = pt.x;
      if (pt.z < this.bounds.minZ) this.bounds.minZ = pt.z;
      if (pt.z > this.bounds.maxZ) this.bounds.maxZ = pt.z;
    }

    // Add margin
    const margin = 50;
    this.bounds.minX -= margin;
    this.bounds.maxX += margin;
    this.bounds.minZ -= margin;
    this.bounds.maxZ += margin;

    this.scaleX = (this.width - 24) / (this.bounds.maxX - this.bounds.minX);
    this.scaleZ = (this.height - 24) / (this.bounds.maxZ - this.bounds.minZ);
    this.scale = Math.min(this.scaleX, this.scaleZ);

    this.offsetX = (this.width - (this.bounds.maxX - this.bounds.minX) * this.scale) / 2;
    this.offsetZ = (this.height - (this.bounds.maxZ - this.bounds.minZ) * this.scale) / 2;
  }

  worldToMap(wx, wz) {
    const mx = this.offsetX + (wx - this.bounds.minX) * this.scale;
    const my = this.offsetZ + (wz - this.bounds.minZ) * this.scale;
    return { x: mx, y: my };
  }

  render(playerVehicle, aiRivalManager) {
    const { ctx, width, height } = this;

    ctx.clearRect(0, 0, width, height);

    // Semi-transparent background
    ctx.fillStyle = 'rgba(12, 14, 20, 0.75)';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Ocean boundary indicator on left side
    ctx.fillStyle = 'rgba(27, 73, 101, 0.35)';
    ctx.fillRect(0, 0, width * 0.28, height);

    // Draw track circuit outline
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#22252a';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.trackPoints.forEach((pt, i) => {
      const mp = this.worldToMap(pt.x, pt.z);
      if (i === 0) ctx.moveTo(mp.x, mp.y);
      else ctx.lineTo(mp.x, mp.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Inner track line (white)
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    this.trackPoints.forEach((pt, i) => {
      const mp = this.worldToMap(pt.x, pt.z);
      if (i === 0) ctx.moveTo(mp.x, mp.y);
      else ctx.lineTo(mp.x, mp.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Start/Finish line marker (gold)
    const startPt = this.trackPoints[0];
    const sPos = this.worldToMap(startPt.x, startPt.z);
    ctx.fillStyle = '#ffe600';
    ctx.beginPath();
    ctx.arc(sPos.x, sPos.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Rival AI dots
    if (aiRivalManager && aiRivalManager.rivals) {
      aiRivalManager.rivals.forEach(r => {
        const rp = this.worldToMap(r.mesh.position.x, r.mesh.position.z);
        ctx.fillStyle = '#' + r.cfg.color.toString(16).padStart(6, '0');
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Player dot (pulsing glowing red/yellow)
    const pp = this.worldToMap(playerVehicle.mesh.position.x, playerVehicle.mesh.position.z);
    ctx.fillStyle = '#ff2222';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(pp.x, pp.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Minimap border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }
}
