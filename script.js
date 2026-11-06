document.body.classList.add('loading');

const videos = [...document.querySelectorAll('.memory-video')];
const loader = document.querySelector('.loader');
const progress = document.querySelector('.progress span');
const soundButton = document.querySelector('.sound-toggle');
const soundLabel = document.querySelector('.sound-label');
const cursor = document.querySelector('.cursor');
const entryGate = document.querySelector('.entry-gate');
const enterWithMusic = document.querySelector('.entry-gate__music');
const enterSilent = document.querySelector('.entry-gate__silent');
let soundEnabled = false;
let mediaFrame = 0;

document.body.classList.add('gate-open');

function enterExperience(withMusic) {
  document.body.classList.toggle('music-silent', !withMusic);
  entryGate.classList.add('is-gone');
  document.body.classList.remove('gate-open');
}

enterWithMusic.addEventListener('click', () => enterExperience(true));
enterSilent.addEventListener('click', () => enterExperience(false));

function setVideoPlayback(video, shouldPlay) {
  const frame = video.closest('.film-frame');
  if (shouldPlay && video.paused) {
    video.muted = !soundEnabled;
    video.play().then(() => frame?.classList.add('is-playing')).catch(() => {});
  } else if (!shouldPlay && !video.paused) {
    video.pause();
    frame?.classList.remove('is-playing');
  }
}

function syncVisibleVideos() {
  videos.forEach((video) => {
    const rect = video.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    setVideoPlayback(video, rect.height > 0 && visible / rect.height > .14);
  });
}

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
    if (isIntersecting && intersectionRatio > .14) {
      setVideoPlayback(target, true);
    } else {
      setVideoPlayback(target, false);
    }
  });
}, { threshold: [0, .14, .5] });

videos.forEach((video) => {
  const frame = video.closest('.film-frame');
  video.addEventListener('play', () => frame?.classList.add('is-playing'));
  video.addEventListener('pause', () => frame?.classList.remove('is-playing'));
  videoObserver.observe(video);
});

soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  soundLabel.textContent = soundEnabled ? 'vídeos on' : 'vídeos off';
  videos.forEach((video) => { video.muted = !soundEnabled; });
});

document.querySelectorAll('.video-control').forEach((button) => {
  const video = button.parentElement.querySelector('video');
  button.addEventListener('click', () => {
    if (video.paused) {
      video.play().then(() => button.parentElement.classList.add('is-playing')).catch(() => {});
      button.querySelector('span').textContent = 'pause';
      button.querySelector('b').textContent = 'Ⅱ';
      button.setAttribute('aria-label', 'Pausar vídeo');
    } else {
      video.pause();
      button.parentElement.classList.remove('is-playing');
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

  cancelAnimationFrame(mediaFrame);
  mediaFrame = requestAnimationFrame(syncVisibleVideos);
}

addEventListener('scroll', onScroll, { passive: true });
onScroll();
setTimeout(syncVisibleVideos, 900);

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
