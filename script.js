/* ═══════════════════════════════════════════════════════
   Valentine's Week — Enhanced Interactive Script v2
   ═══════════════════════════════════════════════════════ */

// ─── State ───
let currentPage = 0;
const totalPages = 5;
let isTransitioning = false;
let starAnimId = null;
let petalAnimId = null;
let shootingStarAnimId = null;

// ─── DOM ───
const pages = document.querySelectorAll('.page');
const dots = document.querySelectorAll('.dot');
const btnBackTop = document.getElementById('btnBackTop');
const progressFill = document.getElementById('progressFill');
const particleCanvas = document.getElementById('particleCanvas');
const particleCtx = particleCanvas.getContext('2d');
const shootCanvas = document.getElementById('shootingStarCanvas');
const shootCtx = shootCanvas.getContext('2d');

// ─── Resize ───
function resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    particleCanvas.width = w;
    particleCanvas.height = h;
    shootCanvas.width = w;
    shootCanvas.height = h;
    const sc = document.getElementById('starCanvas');
    if (sc) { sc.width = w; sc.height = h; }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


/* ═══════════════════════════════════════════════════════
   Typewriter Effect (Layer 1 Title)
   ═══════════════════════════════════════════════════════ */

const typewriterText = "Valentine's\nWeek";
const typewriterEl = document.getElementById('mainTitle');
let typewriterIndex = 0;
let typewriterTimeout = null;

function typeWrite() {
    if (typewriterIndex <= typewriterText.length) {
        const current = typewriterText.substring(0, typewriterIndex);
        typewriterEl.innerHTML = current.replace('\n', '<br>');
        typewriterIndex++;
        const delay = typewriterIndex === 1 ? 200 : (Math.random() * 80 + 60);
        typewriterTimeout = setTimeout(typeWrite, delay);
    }
}

// Start after a short delay
setTimeout(() => typeWrite(), 900);


/* ═══════════════════════════════════════════════════════
   Countdown Timer to Valentine's Day
   ═══════════════════════════════════════════════════════ */

function updateCountdown() {
    const now = new Date();
    const year = now.getFullYear();
    let valentines = new Date(year, 1, 14, 0, 0, 0); // Feb 14

    // If Valentine's has passed this year, count to next year
    if (now > valentines) {
        valentines = new Date(year + 1, 1, 14, 0, 0, 0);
    }

    const diff = valentines - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    updateCountdownUnit('countDays', String(days).padStart(2, '0'));
    updateCountdownUnit('countHours', String(hours).padStart(2, '0'));
    updateCountdownUnit('countMins', String(mins).padStart(2, '0'));
    updateCountdownUnit('countSecs', String(secs).padStart(2, '0'));
}

function updateCountdownUnit(id, value) {
    const el = document.getElementById(id);
    if (el && el.textContent !== value) {
        el.textContent = value;
        el.classList.add('tick');
        setTimeout(() => el.classList.remove('tick'), 400);
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();


/* ═══════════════════════════════════════════════════════
   Page Navigation (Enhanced)
   ═══════════════════════════════════════════════════════ */

function goToPage(index) {
    if (isTransitioning || index === currentPage || index < 0 || index >= totalPages) return;
    isTransitioning = true;

    // Deactivate current
    pages[currentPage].classList.remove('active');
    dots[currentPage].classList.remove('active');

    // Activate new
    currentPage = index;
    pages[currentPage].classList.add('active');
    dots[currentPage].classList.add('active');

    // Update progress bar
    progressFill.style.width = ((currentPage + 1) / totalPages * 100) + '%';

    // Back-to-top on last page
    if (currentPage === totalPages - 1) {
        setTimeout(() => btnBackTop.classList.add('visible'), 1500);
    } else {
        btnBackTop.classList.remove('visible');
    }

    // Layer-specific effects
    if (currentPage === 3) startStarField(); else stopStarField();
    if (currentPage === 4) startLetterSparkles();
    // Flowers run globally now, no stop/start needed per page

    setTimeout(() => { isTransitioning = false; }, 850);
}

// Nav dots
dots.forEach(dot => {
    dot.addEventListener('click', () => goToPage(parseInt(dot.dataset.page)));
});





/* ═══════════════════════════════════════════════════════
/* ═══════════════════════════════════════════════════════
   Global Animated Flower Background
   ═══════════════════════════════════════════════════════ */

let flowers = [];

class Flower {
    constructor() {
        this.reset(true);
    }

    reset(randomY = false) {
        this.x = Math.random() * particleCanvas.width;
        this.y = randomY ? Math.random() * particleCanvas.height : -30;
        this.size = Math.random() * 18 + 10;
        this.speedY = Math.random() * 1 + 0.3;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1.5 - 0.75;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.wobbleAmp = Math.random() * 30 + 10;
        this.wobbleFreq = Math.random() * 0.01 + 0.005;
        this.startX = this.x;
        const types = ['🌸', '🌹', '🌻', '🌷', '🌼', '🌺'];
        this.type = types[Math.floor(Math.random() * types.length)];
    }

    update() {
        this.y += this.speedY;
        this.x = this.startX + Math.sin(this.y * this.wobbleFreq) * this.wobbleAmp;
        this.rotation += this.rotationSpeed;
        if (this.y > particleCanvas.height + 40) this.reset();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.font = `${this.size}px serif`;
        ctx.fillText(this.type, 0, 0);
        ctx.restore();
    }
}

function startFlowers() {
    if (petalAnimId) return;
    flowers = Array.from({ length: 40 }, () => new Flower());
    animateFlowers();
}

// Ensure clean resizing
function resizeFlowers() {
    if (flowers.length === 0) return;
    flowers.forEach(f => {
        if (f.x > particleCanvas.width) f.x = Math.random() * particleCanvas.width;
        if (f.y > particleCanvas.height) f.y = Math.random() * particleCanvas.height;
    });
}

function animateFlowers() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    flowers.forEach(f => { f.update(); f.draw(particleCtx); });
    petalAnimId = requestAnimationFrame(animateFlowers);
}

// Hook into resize
window.addEventListener('resize', resizeFlowers);


/* ═══════════════════════════════════════════════════════
   Shooting Stars (Global, subtle)
   ═══════════════════════════════════════════════════════ */

let shootingStars = [];

class ShootingStar {
    constructor() { this.reset(); this.active = false; }

    reset() {
        this.x = Math.random() * shootCanvas.width * 0.8;
        this.y = Math.random() * shootCanvas.height * 0.3;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 6;
        this.angle = Math.PI / 4 + Math.random() * 0.3 - 0.15;
        this.opacity = 0;
        this.life = 0;
        this.maxLife = Math.random() * 40 + 30;
        this.active = false;
        this.trail = [];
    }

    activate() {
        this.reset();
        this.active = true;
        this.opacity = 1;
    }

    update() {
        if (!this.active) return;
        this.life++;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity = 1 - (this.life / this.maxLife);
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
        if (this.trail.length > 12) this.trail.shift();
        if (this.life >= this.maxLife) this.active = false;
    }

    draw(ctx) {
        if (!this.active || this.trail.length < 2) return;
        for (let i = 1; i < this.trail.length; i++) {
            const t = this.trail[i];
            const prev = this.trail[i - 1];
            const alpha = (i / this.trail.length) * this.opacity * 0.6;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = (i / this.trail.length) * 2;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(t.x, t.y);
            ctx.stroke();
        }

        // Head glow
        const head = this.trail[this.trail.length - 1];
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 6);
        glow.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`);
        glow.addColorStop(1, `rgba(255, 200, 255, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Pool of shooting stars
const starPool = Array.from({ length: 5 }, () => new ShootingStar());

function spawnShootingStar() {
    const inactive = starPool.find(s => !s.active);
    if (inactive) inactive.activate();
}

function animateShootingStars() {
    shootCtx.clearRect(0, 0, shootCanvas.width, shootCanvas.height);
    starPool.forEach(s => { s.update(); s.draw(shootCtx); });
    shootingStarAnimId = requestAnimationFrame(animateShootingStars);
}

// Random shooting stars
setInterval(() => {
    if (Math.random() > 0.4) spawnShootingStar();
}, 3000);

animateShootingStars();


/* ═══════════════════════════════════════════════════════
   Star Field + Fireflies (Layer 4 — Enhanced)
   ═══════════════════════════════════════════════════════ */

let stars = [];
let fireflies = [];

class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.025 + 0.005;
        this.brightness = Math.random();
        this.maxBrightness = Math.random() * 0.7 + 0.3;
    }

    update() {
        this.brightness += this.twinkleSpeed;
        if (this.brightness > this.maxBrightness || this.brightness < 0.05)
            this.twinkleSpeed *= -1;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.size > 1.8) {
            // Cross-shaped twinkle
            ctx.strokeStyle = `rgba(255, 220, 255, ${this.brightness * 0.15})`;
            ctx.lineWidth = 0.5;
            const len = this.size * 4;
            ctx.beginPath();
            ctx.moveTo(this.x - len, this.y);
            ctx.lineTo(this.x + len, this.y);
            ctx.moveTo(this.x, this.y - len);
            ctx.lineTo(this.x, this.y + len);
            ctx.stroke();
        }
    }
}

class Firefly {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = Math.random() * 0.4 - 0.2;
        this.size = Math.random() * 3 + 2;
        this.phase = Math.random() * Math.PI * 2;
        const hues = [330, 340, 350, 40, 50, 280];
        this.hue = hues[Math.floor(Math.random() * hues.length)];
    }

    update() {
        this.phase += 0.018;
        const brightness = (Math.sin(this.phase) + 1) * 0.5;
        this.brightness = brightness;
        this.x += this.vx + Math.sin(this.phase * 0.5) * 0.25;
        this.y += this.vy + Math.cos(this.phase * 0.3) * 0.15;

        if (this.x < -30) this.x = this.canvas.width + 30;
        if (this.x > this.canvas.width + 30) this.x = -30;
        if (this.y < -30) this.y = this.canvas.height + 30;
        if (this.y > this.canvas.height + 30) this.y = -30;
    }

    draw(ctx) {
        const alpha = this.brightness * 0.75;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 7);
        grad.addColorStop(0, `hsla(${this.hue}, 100%, 75%, ${alpha * 0.4})`);
        grad.addColorStop(1, `hsla(${this.hue}, 100%, 75%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${this.hue}, 100%, 88%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function startStarField() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    stars = Array.from({ length: 200 }, () => new Star(canvas));
    fireflies = Array.from({ length: 25 }, () => new Firefly(canvas));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => { s.update(); s.draw(ctx); });
        fireflies.forEach(f => { f.update(); f.draw(ctx); });
        starAnimId = requestAnimationFrame(animate);
    }
    animate();
}

function stopStarField() {
    if (starAnimId) { cancelAnimationFrame(starAnimId); starAnimId = null; }
}


/* ═══════════════════════════════════════════════════════
   Flip Card with Particle Burst
   ═══════════════════════════════════════════════════════ */

function flipCard(card) {
    const wasFlipped = card.classList.contains('flipped');
    card.classList.toggle('flipped');

    if (!wasFlipped) {
        // Particle burst on flip
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        createSparkBurst(cx, cy, 15);
    }
}


/* ═══════════════════════════════════════════════════════
   Envelope & Letter Unfolding (Enhanced)
   ═══════════════════════════════════════════════════════ */

let envelopeOpened = false;

function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    const envelope = document.getElementById('envelope');
    const letterPaper = document.getElementById('letterPaper');

    // Break seal + open flap
    envelope.classList.add('opened');

    // Show letter after envelope animation
    setTimeout(() => {
        letterPaper.classList.add('visible');

        setTimeout(() => {
            letterPaper.classList.add('unfolded');
            // Triple spark burst
            createSparkBurst(window.innerWidth / 2, window.innerHeight / 2 - 50, 25);
            setTimeout(() => createSparkBurst(window.innerWidth / 2 - 60, window.innerHeight / 2, 12), 200);
            setTimeout(() => createSparkBurst(window.innerWidth / 2 + 60, window.innerHeight / 2, 12), 400);
        }, 500);
    }, 1000);
}


/* ═══════════════════════════════════════════════════════
   Sparkle Burst System
   ═══════════════════════════════════════════════════════ */

function createSparkBurst(cx, cy, count) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'sparkle';
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const dist = Math.random() * 100 + 50;
        el.style.left = cx + 'px';
        el.style.top = cy + 'px';
        el.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        el.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        const colors = ['#ffd700', '#ff69b4', '#fff', '#ffb6c1', '#d4a574', '#e8d5f5'];
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 7 + 3;
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }
}

// Ambient sparkles on letter page
let sparkleInterval = null;
function startLetterSparkles() {
    if (sparkleInterval) return;
    const container = document.querySelector('.letter__sparkles');
    if (!container) return;
    sparkleInterval = setInterval(() => {
        if (currentPage !== 4) { clearInterval(sparkleInterval); sparkleInterval = null; return; }
        const el = document.createElement('div');
        el.className = 'sparkle';
        el.style.left = Math.random() * window.innerWidth + 'px';
        el.style.top = Math.random() * window.innerHeight + 'px';
        el.style.setProperty('--tx', (Math.random() * 30 - 15) + 'px');
        el.style.setProperty('--ty', (Math.random() * 30 - 15) + 'px');
        const colors = ['#ffd700', '#d4a574', '#ffb6c1', '#fff'];
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }, 250);
}


/* ═══════════════════════════════════════════════════════
   Custom Cursor Ring
   ═══════════════════════════════════════════════════════ */

const cursorRing = document.createElement('div');
cursorRing.className = 'cursor-ring';
document.body.appendChild(cursorRing);

let cursorX = -100, cursorY = -100;
let ringX = -100, ringY = -100;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    ringX += (cursorX - ringX) * 0.12;
    ringY += (cursorY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover grow effect on interactive elements
document.querySelectorAll('button, .flip-card, .milestone__card, .moment-bubble, .envelope').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});


/* ═══════════════════════════════════════════════════════
   Enhanced Mouse Trail (Hearts + Sparkles)
   ═══════════════════════════════════════════════════════ */

let trailCooldown = false;
document.addEventListener('mousemove', (e) => {
    if (trailCooldown) return;
    trailCooldown = true;

    const symbols = ['♥', '♡', '✦', '✧', '·'];
    const el = document.createElement('div');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const size = Math.random() * 10 + 8;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 20;
    el.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        font-size: ${size}px;
        color: rgba(255,107,157,${Math.random() * 0.35 + 0.15});
        pointer-events: none;
        z-index: 9999;
        animation: trailFade 1.2s ease-out forwards;
        --end-x: ${Math.cos(angle) * dist}px;
        --end-y: ${Math.sin(angle) * dist - 25}px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
    setTimeout(() => { trailCooldown = false; }, 120);
});

// Inject trail animation
const trailStyle = document.createElement('style');
trailStyle.textContent = `
    @keyframes trailFade {
        0%   { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
        100% { opacity: 0; transform: translate(var(--end-x), var(--end-y)) scale(0.3) rotate(45deg); }
    }
`;
document.head.appendChild(trailStyle);


/* ═══════════════════════════════════════════════════════
   Button Ripple + Particle Explosion
   ═══════════════════════════════════════════════════════ */

document.querySelectorAll('.btn-magic').forEach(btn => {
    btn.addEventListener('click', function (e) {
        // Ripple
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${e.clientX - rect.left - size / 2}px;
            top: ${e.clientY - rect.top - size / 2}px;
            background: rgba(255,255,255,0.25);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect .7s ease-out;
            pointer-events: none;
        `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);

        // Spark burst at button position
        createSparkBurst(e.clientX, e.clientY, 10);
    });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes rippleEffect { to { transform: scale(1); opacity: 0; } }`;
document.head.appendChild(rippleStyle);


/* ═══════════════════════════════════════════════════════
   Music Toggle (Placeholder — no actual audio file)
   ═══════════════════════════════════════════════════════ */

const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;

musicToggle.addEventListener('click', () => {
    musicPlaying = !musicPlaying;
    musicToggle.classList.toggle('playing', musicPlaying);

    // You can add an actual audio file here:
    // const audio = document.getElementById('bgMusic');
    // musicPlaying ? audio.play() : audio.pause();
});


/* ═══════════════════════════════════════════════════════
   Initialize
   ═══════════════════════════════════════════════════════ */

startFlowers();
resizeCanvas();

console.log('💕 Valentine\'s Week v2 — Made with love');
