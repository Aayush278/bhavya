/* ==========================================================================
   MINIMALIST LOGIC & AUDIO ENGINE
   Features:
   - Subtle Generative Ambient Pad (Warm emotional chords, lowpass filtered)
   - Real-time Organic Smoke Canvas Simulation
   - Natural Breath / Blow Detection via Microphone
   - Refined Minimalist Ember Sparks & Golden Stardust Particle Engine
   - Clean Drawer Accordions
   - Polaroid Image Upload & LocalStorage Persistence
   - Dynamic Name Customization & URL Params (?to=Alex&from=Sam)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. STATE & STORAGE
  // -------------------------------------------------------------
  const state = {
    isCandleLit: true,
    audioPlaying: false,
    micListening: false,
    broName: 'Bro',
    senderName: 'Your Brother For Life',
    audioCtx: null,
    ambientTimer: null
  };

  const urlParams = new URLSearchParams(window.location.search);
  const paramTo = urlParams.get('to');
  const paramFrom = urlParams.get('from');

  let storedBroName = localStorage.getItem('bro_birthday_to');
  let storedSenderName = localStorage.getItem('bro_birthday_from');
  let storedGoal = localStorage.getItem('bro_birthday_goal');
  let storedPhoto = localStorage.getItem('bro_birthday_photo');

  // Purge any test values (like "idk" or "test") from local storage
  if (storedGoal && ['idk', 'test', 'undefined', 'null'].includes(storedGoal.trim().toLowerCase())) {
    localStorage.removeItem('bro_birthday_goal');
    storedGoal = null;
  }
  if (storedBroName && ['idk', 'test', 'undefined', 'null'].includes(storedBroName.trim().toLowerCase())) {
    localStorage.removeItem('bro_birthday_to');
    storedBroName = null;
  }
  if (storedSenderName && ['idk', 'test', 'undefined', 'null'].includes(storedSenderName.trim().toLowerCase())) {
    localStorage.removeItem('bro_birthday_from');
    storedSenderName = null;
  }

  if (paramTo) {
    state.broName = paramTo;
  } else if (storedBroName) {
    state.broName = storedBroName;
  }

  if (paramFrom) {
    state.senderName = paramFrom;
  } else if (storedSenderName) {
    state.senderName = storedSenderName;
  }

  // -------------------------------------------------------------
  // 2. DOM REFERENCES
  // -------------------------------------------------------------
  const candleSection = document.getElementById('candle-interactive-zone');
  const candleAssembly = document.getElementById('candle-assembly');
  const flameWrapper = document.getElementById('flame-wrapper');
  const blowBtn = document.getElementById('blow-btn');
  const micBlowBtn = document.getElementById('mic-blow-btn');
  const wishUnlockedCard = document.getElementById('wish-unlocked-card');
  const relightBtn = document.getElementById('relight-btn');
  const ritualInstruction = document.getElementById('ritual-instruction');

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const personalizeBtn = document.getElementById('personalize-btn');
  const personalizeModal = document.getElementById('personalize-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const personalizeForm = document.getElementById('personalize-form');
  const broNameInput = document.getElementById('bro-name-input');
  const senderNameInput = document.getElementById('sender-name-input');
  const resetNamesBtn = document.getElementById('reset-names-btn');

  const polaroidFrame = document.getElementById('polaroid-frame');
  const photoUploadInput = document.getElementById('photo-upload-input');
  const customPhotoPreview = document.getElementById('custom-photo-preview');
  const defaultIllustration = document.querySelector('.default-illustration');

  const goalForm = document.getElementById('goal-form');
  const goalInput = document.getElementById('goal-input');
  const savedGoalBox = document.getElementById('saved-goal-box');
  const savedGoalText = document.getElementById('saved-goal-text');

  // Update Names in DOM
  function updateNameDisplays() {
    document.querySelectorAll('.bro-name-target').forEach(el => {
      el.textContent = state.broName;
    });
    document.querySelectorAll('.sender-name-target').forEach(el => {
      el.textContent = state.senderName;
    });
    broNameInput.value = state.broName;
    senderNameInput.value = state.senderName;
  }
  updateNameDisplays();

  // Restore Photo
  if (storedPhoto) {
    customPhotoPreview.src = storedPhoto;
    customPhotoPreview.classList.remove('hidden');
    defaultIllustration.classList.add('hidden');
  }

  // Restore Goal
  if (storedGoal) {
    savedGoalText.textContent = `"${storedGoal}"`;
    savedGoalBox.classList.remove('hidden');
    goalInput.value = storedGoal;
  }

  // -------------------------------------------------------------
  // 3. WEB AUDIO ENGINE (Minimalist Ambient & SFX)
  // -------------------------------------------------------------
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  // Soft breath puff sound
  function playPuffSound() {
    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();
      noiseNode.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio SFX error:', e);
    }
  }

  // Subtle warm tone chime
  function playCelebrationChimes() {
    try {
      const ctx = getAudioContext();
      const freqs = [293.66, 369.99, 440.00, 554.37]; // D4, F#4, A4, C#5 (warm subtle maj7)

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.045, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 2.3);
      });
    } catch (e) {
      console.warn('Audio Chime error:', e);
    }
  }

  // Warm minimalist ambient pad
  function startAmbientMusic() {
    const ctx = getAudioContext();
    state.audioPlaying = true;
    audioToggleBtn.classList.add('audio-active');

    const chords = [
      [146.83, 220.00, 277.18, 369.99], // Dmaj7
      [123.47, 185.00, 220.00, 293.66], // Bm7
      [98.00, 146.83, 220.00, 293.66],  // Gmaj7
      [110.00, 164.81, 220.00, 277.18]  // A
    ];

    let currentChordIdx = 0;

    function playNextChord() {
      if (!state.audioPlaying) return;

      const chord = chords[currentChordIdx];
      currentChordIdx = (currentChordIdx + 1) % chords.length;

      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 2.0);
        gain.gain.setValueAtTime(0.018, ctx.currentTime + 3.8);
        gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 5.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 5.6);
      });

      state.ambientTimer = setTimeout(playNextChord, 4800);
    }

    playNextChord();
  }

  function stopAmbientMusic() {
    state.audioPlaying = false;
    audioToggleBtn.classList.remove('audio-active');
    if (state.ambientTimer) clearTimeout(state.ambientTimer);
  }

  audioToggleBtn.addEventListener('click', () => {
    if (state.audioPlaying) {
      stopAmbientMusic();
    } else {
      startAmbientMusic();
    }
  });

  // -------------------------------------------------------------
  // 4. REALISTIC CANDLE SMOKE SIMULATION (Canvas 2D)
  // -------------------------------------------------------------
  const smokeCanvas = document.getElementById('smoke-canvas');
  const smokeCtx = smokeCanvas.getContext('2d');
  let smokeParticles = [];
  let smokeAnimId = null;

  class SmokeParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = smokeCanvas.width / 2 + (Math.random() * 2 - 1);
      this.y = smokeCanvas.height - 12;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(0.7 + Math.random() * 1.0);
      this.radius = 2.5 + Math.random() * 2;
      this.alpha = 0.5 + Math.random() * 0.2;
      this.decay = 0.005 + Math.random() * 0.004;
      this.curl = (Math.random() - 0.5) * 0.04;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += this.curl;
      this.radius += 0.18;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.beginPath();
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      grad.addColorStop(0, `rgba(215, 218, 225, ${this.alpha * 0.35})`);
      grad.addColorStop(1, 'rgba(180, 185, 195, 0)');
      ctx.fillStyle = grad;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function startSmokeEmitter() {
    smokeParticles = [];
    let birthCounter = 0;
    const maxParticles = 50;
    let durationFrames = 220;

    function loop() {
      smokeCtx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);

      if (durationFrames > 0) {
        durationFrames--;
        birthCounter++;
        if (birthCounter % 3 === 0 && smokeParticles.length < maxParticles) {
          smokeParticles.push(new SmokeParticle());
        }
      }

      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.update();
        p.draw(smokeCtx);
        if (p.alpha <= 0 || p.y < 0) {
          smokeParticles.splice(i, 1);
        }
      }

      if (smokeParticles.length > 0 || durationFrames > 0) {
        smokeAnimId = requestAnimationFrame(loop);
      } else {
        smokeCtx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
      }
    }

    if (smokeAnimId) cancelAnimationFrame(smokeAnimId);
    loop();
  }

  // -------------------------------------------------------------
  // 5. CANDLE BLOWOUT LOGIC & CELEBRATION
  // -------------------------------------------------------------
  function extinguishCandle() {
    if (!state.isCandleLit) return;
    state.isCandleLit = false;

    candleSection.classList.add('candle-extinguished');
    playPuffSound();
    startSmokeEmitter();

    setTimeout(() => {
      playCelebrationChimes();
      triggerMinimalEmbers();
      wishUnlockedCard.classList.remove('hidden');
      ritualInstruction.textContent = "Flame extinguished. Your silent wish is locked in.";
      blowBtn.classList.add('hidden');
      micBlowBtn.classList.add('hidden');
    }, 550);
  }

  function relightCandle() {
    state.isCandleLit = true;
    candleSection.classList.remove('candle-extinguished');
    wishUnlockedCard.classList.add('hidden');
    blowBtn.classList.remove('hidden');
    micBlowBtn.classList.remove('hidden');
    ritualInstruction.textContent = "Make a silent wish for age 20. Then tap the flame to blow it out.";
  }

  candleAssembly.addEventListener('click', extinguishCandle);
  blowBtn.addEventListener('click', extinguishCandle);
  relightBtn.addEventListener('click', relightCandle);

  // -------------------------------------------------------------
  // 6. MICROPHONE BREATH / BLOW DETECTION
  // -------------------------------------------------------------
  let micStream = null;
  let micAudioCtx = null;
  let micAnalyser = null;
  let micAnimId = null;

  async function toggleMicBlow() {
    if (state.micListening) {
      stopMicListening();
      return;
    }

    try {
      micBlowBtn.querySelector('span').textContent = "Listening... Blow now";
      micBlowBtn.style.borderColor = "var(--flame-amber)";

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStream = stream;
      state.micListening = true;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      micAudioCtx = new AudioCtx();
      const source = micAudioCtx.createMediaStreamSource(stream);
      micAnalyser = micAudioCtx.createAnalyser();
      micAnalyser.fftSize = 512;
      source.connect(micAnalyser);

      const bufferLength = micAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let blowStreak = 0;

      function detectBlow() {
        if (!state.micListening || !state.isCandleLit) {
          stopMicListening();
          return;
        }

        micAnalyser.getByteFrequencyData(dataArray);

        let lowEnergy = 0;
        for (let i = 2; i < 16; i++) {
          lowEnergy += dataArray[i];
        }
        const avgLowEnergy = lowEnergy / 14;

        if (avgLowEnergy > 85) {
          blowStreak++;
          if (blowStreak >= 3) {
            extinguishCandle();
            stopMicListening();
            return;
          }
        } else {
          blowStreak = Math.max(0, blowStreak - 1);
        }

        micAnimId = requestAnimationFrame(detectBlow);
      }

      detectBlow();
    } catch (err) {
      console.warn('Microphone error:', err);
      alert('Microphone access was not permitted. You can simply tap the candle to blow it out!');
      stopMicListening();
    }
  }

  function stopMicListening() {
    state.micListening = false;
    micBlowBtn.querySelector('span').textContent = "🎙️ Blow with Breath";
    micBlowBtn.style.borderColor = "";

    if (micAnimId) cancelAnimationFrame(micAnimId);
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    if (micAudioCtx) {
      micAudioCtx.close();
      micAudioCtx = null;
    }
  }

  micBlowBtn.addEventListener('click', toggleMicBlow);

  // -------------------------------------------------------------
  // 7. MINIMALIST GOLDEN EMBERS & STARDUST ENGINE
  // -------------------------------------------------------------
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confCtx = confettiCanvas.getContext('2d');
  let embers = [];
  let emberAnimId = null;

  function resizeEmbers() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeEmbers);
  resizeEmbers();

  const emberPalette = ['#f59e0b', '#fbbf24', '#ffffff', '#e4e4e7', '#d97706'];

  class MinimalEmber {
    constructor() {
      this.x = window.innerWidth / 2 + (Math.random() - 0.5) * 80;
      this.y = window.innerHeight * 0.42;
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 2.5;
      this.radius = 1.2 + Math.random() * 2.5;
      this.color = emberPalette[Math.floor(Math.random() * emberPalette.length)];
      this.alpha = 0.9;
      this.decay = 0.008 + Math.random() * 0.008;
      this.gravity = 0.08;
      this.drag = 0.97;
    }

    update() {
      this.vx *= this.drag;
      this.vy = this.vy * this.drag + this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fill();
      ctx.restore();
    }
  }

  function triggerMinimalEmbers() {
    for (let i = 0; i < 90; i++) {
      embers.push(new MinimalEmber());
    }
    if (!emberAnimId) animateEmbers();
  }

  function animateEmbers() {
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.update();
      e.draw(confCtx);
      if (e.alpha <= 0 || e.y > window.innerHeight) {
        embers.splice(i, 1);
      }
    }

    if (embers.length > 0) {
      emberAnimId = requestAnimationFrame(animateEmbers);
    } else {
      emberAnimId = null;
      confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // -------------------------------------------------------------
  // 8. SUBTLE BACKGROUND DUST / STAR PARTICLES
  // -------------------------------------------------------------
  const ambientCanvas = document.getElementById('ambient-canvas');
  const ambCtx = ambientCanvas.getContext('2d');
  let dustParticles = [];

  function resizeAmbient() {
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
    initDust();
  }
  window.addEventListener('resize', resizeAmbient);

  function initDust() {
    dustParticles = [];
    const count = Math.min(45, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < count; i++) {
      dustParticles.push({
        x: Math.random() * ambientCanvas.width,
        y: Math.random() * ambientCanvas.height,
        radius: 0.6 + Math.random() * 1.0,
        alpha: 0.15 + Math.random() * 0.35,
        speed: 0.004 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  resizeAmbient();

  function animateDust() {
    ambCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

    dustParticles.forEach(d => {
      d.phase += d.speed;
      const alpha = d.alpha + Math.sin(d.phase) * 0.15;
      ambCtx.beginPath();
      ambCtx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ambCtx.fillStyle = `rgba(240, 240, 245, ${Math.max(0.04, alpha)})`;
      ambCtx.fill();
    });

    requestAnimationFrame(animateDust);
  }
  animateDust();

  // -------------------------------------------------------------
  // 9. CLEAN ACCORDION DRAWERS
  // -------------------------------------------------------------
  document.querySelectorAll('.drawer-item').forEach(item => {
    const trigger = item.querySelector('.drawer-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.drawer-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const t = other.querySelector('.drawer-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // -------------------------------------------------------------
  // 10. CLEAN MEMORY FRAME & UPLOAD
  // -------------------------------------------------------------
  polaroidFrame.addEventListener('click', () => {
    photoUploadInput.click();
  });

  photoUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        customPhotoPreview.src = base64Data;
        customPhotoPreview.classList.remove('hidden');
        defaultIllustration.classList.add('hidden');
        try {
          localStorage.setItem('bro_birthday_photo', base64Data);
        } catch (err) {
          console.warn('Storage limit exceeded:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // -------------------------------------------------------------
  // 11. GOAL COMMITMENT
  // -------------------------------------------------------------
  goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = goalInput.value.trim();
    if (!val) return;

    localStorage.setItem('bro_birthday_goal', val);
    savedGoalText.textContent = `"${val}"`;
    savedGoalBox.classList.remove('hidden');

    triggerMinimalEmbers();
    playCelebrationChimes();
  });

  const clearGoalBtn = document.getElementById('clear-goal-btn');
  if (clearGoalBtn) {
    clearGoalBtn.addEventListener('click', () => {
      localStorage.removeItem('bro_birthday_goal');
      savedGoalBox.classList.add('hidden');
      goalInput.value = '';
    });
  }

  // -------------------------------------------------------------
  // 12. PERSONALIZE MODAL
  // -------------------------------------------------------------
  personalizeBtn.addEventListener('click', () => {
    personalizeModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    personalizeModal.classList.add('hidden');
  });

  personalizeModal.addEventListener('click', (e) => {
    if (e.target === personalizeModal) {
      personalizeModal.classList.add('hidden');
    }
  });

  personalizeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newBro = broNameInput.value.trim() || 'My Bro';
    const newSender = senderNameInput.value.trim() || 'Your Brother For Life';

    state.broName = newBro;
    state.senderName = newSender;

    localStorage.setItem('bro_birthday_to', newBro);
    localStorage.setItem('bro_birthday_from', newSender);

    updateNameDisplays();
    personalizeModal.classList.add('hidden');
    triggerMinimalEmbers();
  });

  resetNamesBtn.addEventListener('click', () => {
    state.broName = 'Bro';
    state.senderName = 'Your Brother For Life';
    localStorage.removeItem('bro_birthday_to');
    localStorage.removeItem('bro_birthday_from');
    updateNameDisplays();
    personalizeModal.classList.add('hidden');
  });
});
