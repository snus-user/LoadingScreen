(() => {
  const bar = document.querySelector('.progress__bar');
  const fill = document.querySelector('.progress__fill');
  const text = document.querySelector('.progress__text');
  const percent = document.querySelector('.progress__percent');

  if (!bar || !fill || !text || !percent) return;

  const states = [
    { at: 6, label: 'Инициализация…' },
    { at: 22, label: 'Загружаем ресурсы…' },
    { at: 48, label: 'Собираем интерфейс…' },
    { at: 74, label: 'Почти готово…' },
    { at: 92, label: 'Финальные штрихи…' },
    { at: 100, label: 'Готово' },
  ];

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('to');
  const durationMs = clampInt(params.get('ms'), 900, 12000, 2600);

  let paused = false;
  let p = 0;
  let start = performance.now();

  function setProgress(value) {
    p = Math.max(0, Math.min(100, Math.round(value)));

    fill.style.width = `${p}%`;
    bar.setAttribute('aria-valuenow', String(p));
    percent.textContent = `${p}%`;

    for (let i = states.length - 1; i >= 0; i--) {
      if (p >= states[i].at) {
        text.textContent = states[i].label;
        break;
      }
    }
  }

  function tick(now) {
    if (paused) {
      start += (now - (tick._lastNow ?? now));
    }
    tick._lastNow = now;

    const t = Math.min(1, (now - start) / durationMs);
    const eased = easeOutCubic(t);

    const wobble = (Math.sin(now / 240) + Math.sin(now / 510)) * 0.35;
    const target = (eased * 100) + wobble;

    setProgress(target);

    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }

    setProgress(100);

    if (redirectTo) {
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 350);
    }
  }

  function togglePause() {
    paused = !paused;
    document.body.dataset.paused = paused ? 'true' : 'false';
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePause();
  });

  setProgress(0);
  requestAnimationFrame(tick);

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function clampInt(value, min, max, fallback) {
    const n = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }
})();
