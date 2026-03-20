// stats animate
const statNodes = document.querySelectorAll('.stat-card strong');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (!el.dataset.animated) {
        const target = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
        let start = 0;
        const duration = 1200;
        const step = (timestamp) => {
          start += Math.ceil(target / (duration / 16));
          if (start >= target) {
            el.textContent = target.toLocaleString('ru-RU');
            el.dataset.animated = '1';
          } else {
            el.textContent = start.toLocaleString('ru-RU');
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
      }
    }
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
  const showVideo = () => heroVideo.classList.add('is-visible');
  heroVideo.addEventListener('canplay', showVideo, { once: true });
  heroVideo.addEventListener('playing', showVideo, { once: true });
  heroVideo.addEventListener('canplaythrough', showVideo, { once: true });
  heroVideo.load();
}
