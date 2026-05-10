/* =====================================================
   PERSONAL ALMANAC — Tweaks panel
   Three expressive controls that reshape the feel:
   1. Mood   — Day / Dusk / Night        (palette + paper)
   2. Texture — Clean / Foxed / Rich      (grain + starfield)
   3. Motion — Still / Slow / Restless    (rotation + twinkle)
   ===================================================== */

(function tweaks() {
  const TWEAKS = /*EDITMODE-BEGIN*/{
    "mood": "night",
    "texture": 50,
    "motion": "slow"
  }/*EDITMODE-END*/;

  const state = { ...TWEAKS };

  // ---------- Apply state to DOM ----------
  function applyAll() {
    document.body.dataset.mood = state.mood;
    document.body.dataset.motion = state.motion;
    document.body.style.setProperty('--texture-amt', state.texture / 100);
    // emit a CustomEvent so script.js can react (starfield + spin speed)
    window.dispatchEvent(new CustomEvent('almanac:tweaks', { detail: state }));
  }

  // ---------- Tweaks panel chrome ----------
  const panel = document.createElement('aside');
  panel.id = 'tweaks-panel';
  panel.setAttribute('aria-label', 'Tweaks panel');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="tw-head">
      <span class="tw-eyebrow">§ Tweaks &nbsp;·&nbsp; reshape the almanac</span>
      <button class="tw-close" type="button" aria-label="Close tweaks">×</button>
    </header>

    <section class="tw-section">
      <div class="tw-label">
        <span class="tw-title">Mood</span>
        <span class="tw-hint" data-hint="mood">a paper read by daylight</span>
      </div>
      <div class="tw-radio" role="radiogroup" data-key="mood">
        <button type="button" data-value="day"   class="tw-opt"><span class="sw sw-day"></span>Day</button>
        <button type="button" data-value="dusk"  class="tw-opt"><span class="sw sw-dusk"></span>Dusk</button>
        <button type="button" data-value="night" class="tw-opt"><span class="sw sw-night"></span>Night</button>
      </div>
    </section>

    <section class="tw-section">
      <div class="tw-label">
        <span class="tw-title">Texture</span>
        <span class="tw-hint" data-hint="texture">how much paper shows through</span>
      </div>
      <div class="tw-slider">
        <input type="range" min="0" max="100" step="1" data-key="texture" />
        <div class="tw-slider-meta">
          <span>Clean</span>
          <span class="tw-slider-val" data-val="texture">50</span>
          <span>Rich</span>
        </div>
      </div>
    </section>

    <section class="tw-section">
      <div class="tw-label">
        <span class="tw-title">Motion</span>
        <span class="tw-hint" data-hint="motion">a gentle rotation of the heavens</span>
      </div>
      <div class="tw-radio" role="radiogroup" data-key="motion">
        <button type="button" data-value="still"    class="tw-opt">Still</button>
        <button type="button" data-value="slow"     class="tw-opt">Slow</button>
        <button type="button" data-value="restless" class="tw-opt">Restless</button>
      </div>
    </section>

    <footer class="tw-foot">
      <span>Plate № 014</span>
      <span>Adjust to taste.</span>
    </footer>
  `;
  document.body.appendChild(panel);

  // ---------- Hint copy ----------
  const HINTS = {
    mood: { day: 'a paper read by daylight', dusk: 'lamp-light at the writing desk', night: 'an open book under stars' },
    motion: { still: 'all wheels at rest', slow: 'a gentle rotation of the heavens', restless: 'the cosmos in a hurry' },
    texture: ['barely a trace', 'a little foxing', 'pressed paper, well loved', 'dense engraver\'s grain'],
  };

  function refreshUI() {
    panel.querySelectorAll('[data-key="mood"] .tw-opt').forEach(b => {
      b.classList.toggle('on', b.dataset.value === state.mood);
    });
    panel.querySelectorAll('[data-key="motion"] .tw-opt').forEach(b => {
      b.classList.toggle('on', b.dataset.value === state.motion);
    });
    const slider = panel.querySelector('[data-key="texture"]');
    slider.value = state.texture;
    panel.querySelector('[data-val="texture"]').textContent = state.texture;
    panel.querySelector('[data-hint="mood"]').textContent = HINTS.mood[state.mood];
    panel.querySelector('[data-hint="motion"]').textContent = HINTS.motion[state.motion];
    const ti = Math.min(3, Math.floor(state.texture / 26));
    panel.querySelector('[data-hint="texture"]').textContent = HINTS.texture[ti];
  }

  function persist(patch) {
    Object.assign(state, patch);
    applyAll();
    refreshUI();
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  }

  panel.addEventListener('click', (e) => {
    const opt = e.target.closest('.tw-opt');
    if (opt) {
      const key = opt.parentElement.dataset.key;
      persist({ [key]: opt.dataset.value });
    }
    if (e.target.classList.contains('tw-close')) {
      panel.hidden = true;
      window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
    }
  });
  panel.addEventListener('input', (e) => {
    if (e.target.dataset.key === 'texture') {
      persist({ texture: parseInt(e.target.value, 10) });
    }
  });

  // ---------- Edit-mode protocol ----------
  window.addEventListener('message', (e) => {
    const t = e.data?.type;
    if (t === '__activate_edit_mode')   { panel.hidden = false; }
    if (t === '__deactivate_edit_mode') { panel.hidden = true;  }
  });
  // announce availability (after listener)
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  // initial paint
  refreshUI();
  applyAll();
})();
