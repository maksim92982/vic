// Stats animation with support for prefixes/suffixes like "С 2016" and "руб."
const statNodes = document.querySelectorAll('.stat-card strong');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    if (el.dataset.animated) return;

    const raw = (el.innerText || '').trim();
    // Keep trailing spaces out of the numeric part so suffix spacing is preserved.
    const numberMatch = raw.match(/\d(?:[\d\s\u00A0]*\d)?/);

    if (!numberMatch) {
      el.dataset.animated = '1';
      return;
    }

    const numericPart = numberMatch[0];
    const target = parseInt(numericPart.replace(/\s/g, ''), 10);
    if (!Number.isFinite(target)) {
      el.dataset.animated = '1';
      return;
    }

    const prefix = raw.slice(0, numberMatch.index);
    const suffix = raw.slice(numberMatch.index + numericPart.length);
    let current = 0;
    const duration = 1200;
    const increment = Math.max(1, Math.ceil(target / (duration / 16)));

    const step = () => {
      current += increment;
      if (current >= target) {
        el.textContent = `${prefix}${target.toLocaleString('ru-RU')}${suffix}`;
        el.dataset.animated = '1';
      } else {
        el.textContent = `${prefix}${current.toLocaleString('ru-RU')}${suffix}`;
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });

statNodes.forEach((node) => observer.observe(node));

// mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');
if (menuToggle && mainMenu) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    mainMenu.classList.toggle('open');
  });
}

const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  const timeline = {
    boot: performance.now(),
    firstFrame: null,
    playStart: null,
    stablePlayback: null,
  };
  const log = (msg) => console.log(`[hero-video +${Math.round(performance.now() - timeline.boot)}ms] ${msg}`);
  const showVideo = (() => {
    let visible = false;
    return () => {
      if (!visible) {
        visible = true;
        log('show-video triggered');
        heroVideo.classList.add('is-visible');
      }
    };
  })();

  const milestone = (eventName) => {
    const now = performance.now();
    log(`${eventName} (readyState=${heroVideo.readyState})`);
    return now;
  };

  const onceEvents = ['loadeddata', 'canplay', 'playing', 'canplaythrough'];
  onceEvents.forEach((event) => {
    heroVideo.addEventListener(event, () => {
      const timestamp = milestone(event);
      if (!timeline.firstFrame && event !== 'playing') {
        timeline.firstFrame = timestamp;
      }
      if (event === 'playing' && !timeline.playStart) {
        timeline.playStart = timestamp;
        log(`time to start playback: ${Math.round(timeline.playStart - timeline.boot)}ms`);
      }
      if (event === 'canplaythrough') {
        timeline.stablePlayback = timestamp;
        log(`stable playback reached: ${Math.round(timeline.stablePlayback - timeline.boot)}ms`);
      }
      showVideo();
    }, { once: true });
  });

  heroVideo.addEventListener('waiting', () => {
    log('waiting for buffer');
  });
  heroVideo.addEventListener('error', (event) => {
    log(`error event code=${event?.target?.error?.code}`);
  });
}
