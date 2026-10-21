import * as THREE from 'three';
import { CircuitTrack } from './game/track.js';
import { ParticleSystem } from './game/particles.js';
import { PlayerVehicle } from './game/vehicle.js';
import { AIRivalManager } from './game/aiRivals.js';
import { CameraManager } from './game/cameraManager.js';
import { Minimap } from './game/minimap.js';
import { audio } from './game/audio.js';
import {
  obtenerPerfilYDificultad,
  sumarVictoria,
  obtenerRankingTop10
} from './services/supabaseClient.js';

class ApexRacingGame {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.state = 'INTRO'; // INTRO, TITLE, GARAGE, COUNTDOWN, RACING, PAUSED, VICTORY, LEADERBOARD
    this.pilotName = 'APEX-88';
    this.pilotProfile = null;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Game Modules
    this.track = null;
    this.particles = null;
    this.player = null;
    this.rivals = null;
    this.cameraManager = null;
    this.minimap = null;

    // Race loop variables
    this.clock = new THREE.Clock();
    this.countdownTimer = 0;
    this.countdownStage = 0; // 3, 2, 1, 0 (GO)
    this.gearRotation = 0;

    // UI Cache
    this.ui = {
      viewIntro: document.getElementById('view-intro'),
      viewTitle: document.getElementById('view-title'),
      viewGarage: document.getElementById('view-garage'),
      viewPause: document.getElementById('view-pause'),
      viewVictory: document.getElementById('view-victory'),
      viewLeaderboard: document.getElementById('view-leaderboard'),
      hud: document.getElementById('hud-overlay'),
      hudPos: document.getElementById('hud-pos'),
      hudLap: document.getElementById('hud-lap'),
      hudBanner: document.getElementById('hud-banner'),
      hudSpeed: document.getElementById('hud-speed'),
      hudGear: document.getElementById('hud-gear'),
      hudCamBadge: document.getElementById('hud-camera-badge'),
      pilotInput: document.getElementById('pilot-name-input'),
      garageName: document.getElementById('garage-pilot-name'),
      garageWins: document.getElementById('garage-pilot-wins'),
      garageLeague: document.getElementById('garage-pilot-league'),
      garageAiSpeed: document.getElementById('garage-ai-speed'),
      garageAiSkill: document.getElementById('garage-ai-skill'),
      garageAiRubber: document.getElementById('garage-ai-rubber'),
      victoryWins: document.getElementById('victory-total-wins'),
      victoryLeague: document.getElementById('victory-league'),
      leaderboardTbody: document.getElementById('leaderboard-tbody')
    };

    this.initThree();
    this.initModules();
    this.initEventListeners();
    this.setupTouchControls();

    // Start in INTRO mode
    this.playIntroVideo();

    // Start main render loop
    this.animate();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x5a3b76, 0.0018); // Atmospheric twilight haze

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.2, 2000);
    this.cameraManager = new CameraManager(this.camera);

    // Renderer with retro flat look
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Hard 90s arcade shadows

    // Lighting: Warm Sunset & Ambient Twilight
    const ambientLight = new THREE.AmbientLight(0xffb088, 0.75);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffd580, 1.6);
    sunLight.position.set(-200, 120, -300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 800;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // Skybox: Panoramic Sunset Cylinder
    const skyGeom = new THREE.CylinderGeometry(900, 900, 450, 32, 1, true);
    skyGeom.scale(-1, 1, 1);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/images/skybox-sunset.jpg', tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.set(2, 1);
      const skyMat = new THREE.MeshBasicMaterial({ map: tex });
      const sky = new THREE.Mesh(skyGeom, skyMat);
      sky.position.y = 80;
      this.scene.add(sky);
    });

    // Giant Flat Low-Poly Sun on Horizon
    const sunGeom = new THREE.CircleGeometry(75, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.position.set(-600, 70, -600);
    sunMesh.lookAt(0, 70, 0);
    this.scene.add(sunMesh);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initModules() {
    this.track = new CircuitTrack(this.scene);
    this.particles = new ParticleSystem(this.scene, 350);
    this.player = new PlayerVehicle(this.scene, this.track, this.particles);
    this.rivals = new AIRivalManager(this.scene, this.track, this.particles);

    const minimapCanvas = document.getElementById('minimap-canvas');
    this.minimap = new Minimap(minimapCanvas, this.track);
  }

  playIntroVideo() {
    const video = document.getElementById('intro-video');
    if (video) {
      video.play().catch(() => {
        console.log('Video autoplay prevented, waiting for user interaction');
      });
    }
  }

  switchState(newState) {
    this.state = newState;

    // Hide all views first
    this.ui.viewIntro.classList.add('hidden');
    this.ui.viewTitle.classList.add('hidden');
    this.ui.viewGarage.classList.add('hidden');
    this.ui.viewPause.classList.add('hidden');
    this.ui.viewVictory.classList.add('hidden');
    this.ui.viewLeaderboard.classList.add('hidden');
    this.ui.hud.classList.add('hidden');

    if (newState === 'INTRO') {
      this.ui.viewIntro.classList.remove('hidden');
    } else if (newState === 'TITLE') {
      this.ui.viewTitle.classList.remove('hidden');
      const vid = document.getElementById('intro-video');
      if (vid) vid.pause();
    } else if (newState === 'GARAGE') {
      this.ui.viewGarage.classList.remove('hidden');
      this.loadPilotProfile();
    } else if (newState === 'COUNTDOWN') {
      this.ui.hud.classList.remove('hidden');
      this.startCountdown();
    } else if (newState === 'RACING') {
      this.ui.hud.classList.remove('hidden');
    } else if (newState === 'PAUSED') {
      this.ui.viewPause.classList.remove('hidden');
      this.ui.hud.classList.remove('hidden');
      audio.stopEngine();
    } else if (newState === 'VICTORY') {
      this.ui.viewVictory.classList.remove('hidden');
      this.handleVictory();
    } else if (newState === 'LEADERBOARD') {
      this.ui.viewLeaderboard.classList.remove('hidden');
      this.loadLeaderboard();
    }
  }

  async loadPilotProfile() {
    this.pilotProfile = await obtenerPerfilYDificultad(this.pilotName);
    this.ui.garageName.textContent = this.pilotProfile.nombre;
    this.ui.garageWins.textContent = this.pilotProfile.victorias;

    // Badge styling
    this.ui.garageLeague.className = `league-badge league-${this.pilotProfile.league.toLowerCase()}`;
    this.ui.garageLeague.textContent = this.pilotProfile.league;

    this.ui.garageAiSpeed.textContent = `${this.pilotProfile.aiSpeedMultiplier.toFixed(2)}x`;
    this.ui.garageAiSkill.textContent = `${Math.round(this.pilotProfile.aiCorneringSkill * 100)}%`;
    this.ui.garageAiRubber.textContent = `${Math.round(this.pilotProfile.rubberBandingFactor * 100)}%`;

    // Apply to rivals
    this.rivals.applyDifficulty(this.pilotProfile);
  }

  startCountdown() {
    this.player.resetToStart(7);
    this.rivals.resetGrid();
    this.countdownStage = 3;
    this.countdownTimer = 0;
    this.track.setTrafficLight(1);

    this.ui.hudBanner.textContent = '3...';
    this.ui.hudBanner.className = 'hud-banner countdown';
    audio.playCountdownBeep(false);
  }

  updateCountdown(dt) {
    this.countdownTimer += dt;

    if (this.countdownStage === 3 && this.countdownTimer >= 1.0) {
      this.countdownStage = 2;
      this.countdownTimer = 0;
      this.ui.hudBanner.textContent = '2...';
      this.track.setTrafficLight(2);
      audio.playCountdownBeep(false);
    } else if (this.countdownStage === 2 && this.countdownTimer >= 1.0) {
      this.countdownStage = 1;
      this.countdownTimer = 0;
      this.ui.hudBanner.textContent = '1... READY!';
      this.track.setTrafficLight(2);
      audio.playCountdownBeep(false);
    } else if (this.countdownStage === 1 && this.countdownTimer >= 1.0) {
      this.countdownStage = 0;
      this.countdownTimer = 0;
      this.ui.hudBanner.textContent = '★ GO! ★';
      this.ui.hudBanner.style.color = '#00ff66';
      this.track.setTrafficLight(3);
      audio.playCountdownBeep(true);
      this.state = 'RACING';

      // Switch banner to zone name after 2 seconds
      setTimeout(() => {
        if (this.state === 'RACING') {
          this.ui.hudBanner.textContent = 'EMERALD GROVE';
          this.ui.hudBanner.className = 'hud-banner';
          this.ui.hudBanner.style.color = '#fff';
        }
      }, 2500);
    }
  }

  async handleVictory() {
    audio.stopEngine();
    audio.playVictoryFanfare();
    this.cameraManager.setMode('front');

    try {
      const newWins = await sumarVictoria(this.pilotName);
      this.ui.victoryWins.textContent = `TOTAL WINS: ${newWins}`;

      let league = 'BRONZE';
      if (newWins >= 16) league = 'PLATINUM';
      else if (newWins >= 8) league = 'GOLD';
      else if (newWins >= 3) league = 'SILVER';
      this.ui.victoryLeague.textContent = `LEAGUE: ${league}`;
    } catch (err) {
      console.error('Error saving victory:', err);
    }
  }

  async loadLeaderboard() {
    this.ui.leaderboardTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">LOADING PILOTS...</td></tr>';
    const pilots = await obtenerRankingTop10();

    this.ui.leaderboardTbody.innerHTML = '';
    pilots.forEach(p => {
      const tr = document.createElement('tr');
      if (p.nombre === this.pilotName.toUpperCase()) {
        tr.className = 'player-highlight';
      }
      tr.innerHTML = `
        <td>${p.rank}</td>
        <td>${p.nombre}</td>
        <td>${p.carreras_ganadas} WINS</td>
        <td><span class="league-badge league-${(p.league || 'bronze').toLowerCase()}">${p.league || 'BRONZE'}</span></td>
      `;
      this.ui.leaderboardTbody.appendChild(tr);
    });
  }

  initEventListeners() {
    // Audio activation & Intro skip
    const triggerStart = () => {
      audio.init();
      audio.playClick();
      this.switchState('TITLE');
    };

    document.getElementById('btn-skip-intro').addEventListener('click', triggerStart);
    this.ui.viewIntro.addEventListener('click', triggerStart);

    // Title Start
    document.getElementById('btn-title-start').addEventListener('click', () => {
      audio.init();
      audio.playClick();
      const val = this.ui.pilotInput.value.trim();
      this.pilotName = val.length >= 2 ? val.toUpperCase().slice(0, 15) : 'APEX-88';
      this.player.mesh.name = this.pilotName;
      this.switchState('GARAGE');
    });

    this.ui.pilotInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        document.getElementById('btn-title-start').click();
      }
    });

    // Garage buttons
    document.getElementById('btn-race-now').addEventListener('click', () => {
      audio.init();
      audio.playClick();
      this.switchState('COUNTDOWN');
    });

    document.getElementById('btn-open-leaderboard').addEventListener('click', () => {
      audio.playClick();
      this.switchState('LEADERBOARD');
    });

    // Pause screen buttons
    document.getElementById('btn-resume-race').addEventListener('click', () => {
      audio.playClick();
      this.switchState('RACING');
    });

    document.getElementById('btn-restart-race').addEventListener('click', () => {
      audio.playClick();
      this.switchState('COUNTDOWN');
    });

    document.getElementById('btn-exit-garage').addEventListener('click', () => {
      audio.playClick();
      this.switchState('GARAGE');
    });

    // Volume Slider
    const volSlider = document.getElementById('volume-slider');
    volSlider.addEventListener('input', e => {
      audio.setVolume(parseFloat(e.target.value));
    });

    // Camera toggle in pause menu
    const updateCamButtons = activeMode => {
      ['chase', 'aerial', 'front'].forEach(m => {
        const btn = document.getElementById(`btn-cam-${m}`);
        if (btn) {
          if (m === activeMode) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });
      this.ui.hudCamBadge.textContent = `CAM: ${activeMode.toUpperCase()} [C]`;
    };

    ['chase', 'aerial', 'front'].forEach(m => {
      document.getElementById(`btn-cam-${m}`).addEventListener('click', () => {
        audio.playClick();
        this.cameraManager.setMode(m);
        updateCamButtons(m);
      });
    });

    // Victory screen buttons
    document.getElementById('btn-victory-next').addEventListener('click', () => {
      audio.playClick();
      this.cameraManager.setMode('chase');
      updateCamButtons('chase');
      this.switchState('COUNTDOWN');
    });

    document.getElementById('btn-victory-leaderboard').addEventListener('click', () => {
      audio.playClick();
      this.switchState('LEADERBOARD');
    });

    // Leaderboard Back
    document.getElementById('btn-leaderboard-back').addEventListener('click', () => {
      audio.playClick();
      this.switchState('GARAGE');
    });

    // Keyboard Controls
    window.addEventListener('keydown', e => {
      if (this.state === 'INTRO') {
        triggerStart();
        return;
      }

      if (e.code === 'KeyC') {
        const nextMode = this.cameraManager.cycleMode();
        updateCamButtons(nextMode);
        audio.playClick();
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'RACING') {
          this.switchState('PAUSED');
        } else if (this.state === 'PAUSED') {
          this.switchState('RACING');
        }
      }

      this.handleKey(e.code, true);
    });

    window.addEventListener('keyup', e => {
      this.handleKey(e.code, false);
    });
  }

  handleKey(code, isPressed) {
    if (!this.player) return;
    const inp = this.player.inputs;
    switch (code) {
      case 'ArrowUp':
      case 'KeyW':
        inp.forward = isPressed;
        break;
      case 'ArrowDown':
      case 'KeyS':
        inp.backward = isPressed;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        inp.left = isPressed;
        break;
      case 'ArrowRight':
      case 'KeyD':
        inp.right = isPressed;
        break;
      case 'Space':
        inp.drift = isPressed;
        break;
    }
  }

  setupTouchControls() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileDiv = document.getElementById('mobile-controls');
    if (isTouch && mobileDiv) {
      mobileDiv.style.display = 'flex';
    }

    const bindTouch = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', e => {
        e.preventDefault();
        this.player.inputs[key] = true;
      });
      el.addEventListener('touchend', e => {
        e.preventDefault();
        this.player.inputs[key] = false;
      });
    };

    bindTouch('touch-left', 'left');
    bindTouch('touch-right', 'right');
    bindTouch('touch-gas', 'forward');
    bindTouch('touch-brake', 'backward');
    bindTouch('touch-drift', 'drift');
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'COUNTDOWN') {
      this.updateCountdown(dt);
      this.player.update(dt, false);
      this.rivals.update(dt, this.player, false);
      this.cameraManager.update(this.player, dt);
      this.minimap.render(this.player, this.rivals);
    } else if (this.state === 'RACING') {
      this.player.update(dt, true);
      this.rivals.update(dt, this.player, true);
      this.particles.update(dt);
      this.cameraManager.update(this.player, dt);
      this.minimap.render(this.player, this.rivals);

      // Update HUD
      this.updateHUD();

      // Check race finish
      if (this.player.isFinished) {
        const standings = this.rivals.getStandings(this.player);
        const playerPos = standings.find(s => s.isPlayer)?.position || 1;
        if (playerPos === 1) {
          this.switchState('VICTORY');
        } else {
          this.ui.hudBanner.textContent = `FINISHED ${playerPos}/8`;
          setTimeout(() => this.switchState('GARAGE'), 3000);
        }
      }
    } else {
      // In menus, slight idle camera track
      if (this.player && this.cameraManager) {
        this.cameraManager.update(this.player, dt);
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  updateHUD() {
    const mph = this.player.getSpeedMph();
    this.ui.hudSpeed.textContent = `${mph} MPH`;

    // Rotate spinning gear icon
    this.gearRotation += (mph / 20) * 0.1;
    this.ui.hudGear.style.transform = `rotate(${this.gearRotation}rad)`;

    // Update Standings Position (POS X/8)
    const standings = this.rivals.getStandings(this.player);
    const myPos = standings.find(s => s.isPlayer)?.position || 8;
    this.ui.hudPos.textContent = `${myPos}/8`;

    // Update Lap counter
    this.ui.hudLap.textContent = `${this.player.currentLap}/3`;

    // Dynamic Zone Banner indicator
    if (this.state === 'RACING' && this.countdownStage === 0) {
      if (this.player.currentLap === 3) {
        this.ui.hudBanner.textContent = '★ FINAL LAP! ★';
        this.ui.hudBanner.style.color = 'var(--arcade-yellow)';
      } else if (this.player.currentU > 0.45 && this.player.currentU < 0.85) {
        this.ui.hudBanner.textContent = 'EMERALD GROVE';
        this.ui.hudBanner.style.color = '#fff';
      } else {
        this.ui.hudBanner.textContent = 'SUNSET COAST';
        this.ui.hudBanner.style.color = '#fff';
      }
    }
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  new ApexRacingGame();
});
