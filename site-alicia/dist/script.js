document.body.classList.add('loading');

const videos = [...document.querySelectorAll('.memory-video')];
const loader = document.querySelector('.loader');
const progress = document.querySelector('.progress span');
const soundButton = document.querySelector('.sound-toggle');
const soundLabel = document.querySelector('.sound-label');
const cursor = document.querySelector('.cursor');
let soundEnabled = false;

function dismissLoader() {
  loader.classList.add('is-gone');
  document.body.classList.remove('loading');
}

window.addEventListener('load', () => setTimeout(dismissLoader, 850));
setTimeout(dismissLoader, 3200);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal, .reveal-media').forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
  revealObserver.observe(el);
});

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
    if (isIntersecting && intersectionRatio > .38) {
      target.muted = !soundEnabled;
      target.play().catch(() => {});
    } else {
      target.pause();
    }
  });
}, { threshold: [0, .38, .72] });

videos.forEach((video) => videoObserver.observe(video));

soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  soundLabel.textContent = soundEnabled ? 'som on' : 'som off';
  videos.forEach((video) => { video.muted = !soundEnabled; });
});

document.querySelectorAll('.video-control').forEach((button) => {
  const video = button.parentElement.querySelector('video');
  button.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {});
      button.querySelector('span').textContent = 'pause';
      button.querySelector('b').textContent = 'Ⅱ';
      button.setAttribute('aria-label', 'Pausar vídeo');
    } else {
      video.pause();
      button.querySelector('span').textContent = 'play';
      button.querySelector('b').textContent = '▶';
      button.setAttribute('aria-label', 'Reproduzir vídeo');
    }
  });
});

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const ratio = max > 0 ? scrollY / max : 0;
  progress.style.transform = `scaleX(${ratio})`;

  const heroVideo = document.querySelector('.hero__media video');
  if (heroVideo && scrollY < innerHeight * 1.2 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVideo.style.transform = `scale(1.02) translateY(${scrollY * .08}px)`;
  }
}

addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (matchMedia('(pointer: fine)').matches) {
  addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
  document.querySelectorAll('.film-frame, .track__visual').forEach((item) => {
    item.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
    item.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  });
}
