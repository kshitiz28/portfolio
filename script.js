/* =====================================================
   PERSONAL ALMANAC — interactions
   ===================================================== */

/* ---------- Hero rotating roles ---------- */
(function heroRoles() {
  const roles = document.querySelectorAll('.hero-role');
  if (roles.length < 2) return;
  let i = 0;
  const advance = () => {
    roles[i].classList.remove('is-active');
    i = (i + 1) % roles.length;
    roles[i].classList.add('is-active');
  };
  setInterval(advance, 2400);
})();

/* ---------- Hero model card (sparkline + telemetry) ---------- */
(function modelCard() {
  const spark = document.getElementById('mcSpark');
  const fill  = document.getElementById('mcSparkFill');
  const lat   = document.getElementById('mcLatency');
  const dep   = document.getElementById('mcDeploy');
  if (!spark) return;

  // Set deploy text
  if (dep) {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dep.textContent = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  const W = 220, H = 36, N = 60;
  const data = Array.from({ length: N }, () => 12 + Math.random() * 14);

  const render = () => {
    let dStr = '';
    let fStr = `M 0 ${H}`;
    data.forEach((v, i) => {
      const x = (i / (N - 1)) * W;
      const y = H - v;
      dStr += (i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`);
      fStr += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    fStr += ` L ${W} ${H} Z`;
    spark.setAttribute('d', dStr);
    if (fill) fill.setAttribute('d', fStr);
  };
  render();

  let tick = 0;
  setInterval(() => {
    data.shift();
    // Smoothly varying with occasional spike
    const last = data[data.length - 1] || 18;
    let next = last + (Math.random() - 0.5) * 4;
    if (Math.random() < 0.07) next += 6;
    next = Math.max(6, Math.min(32, next));
    data.push(next);
    render();
    if (lat && tick % 4 === 0) {
      const ms = Math.round(28 + Math.random() * 22);
      lat.textContent = `${ms}ms`;
    }
    tick++;
  }, 280);
})();

/* ---------- Hero almanac stamp (legacy — disabled) ---------- */
(function heroStamp() {
  return; // replaced by modelCard
})();

/* ---------- Clock in masthead ---------- */
(function clock() {
  const el = document.getElementById('navClock');
  if (!el) return;
  const tick = () => {
    const d = new Date();
    const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kathmandu' };
    const t = d.toLocaleTimeString('en-GB', opts);
    el.textContent = `KTM ${t}`;
  };
  tick();
  setInterval(tick, 30 * 1000);
})();

/* ---------- Data ring around portrait (replaces zodiac glyphs) ---------- */
(function dataRing() {
  const g = document.getElementById('zodiacGlyphs');
  if (!g) return;
  const cx = 230, cy = 230, r = 178;
  // Token-style labels in a ring: vector, dim, batch, etc — orbiting the portrait
  const tokens = ['vec', 'dim', 'tok', 'emb', 'attn', 'L1', 'L2', 'k=8', '∇θ', 'ƒ(x)', 'ETL', 'p95'];
  let svg = '';
  tokens.forEach((tok, i) => {
    const a = (i / tokens.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="'IBM Plex Mono', monospace" font-size="9.5" letter-spacing="0.5" fill="var(--fg3)">${tok}</text>`;
    // small node dot inward
    const xi = cx + Math.cos(a) * (r - 14);
    const yi = cy + Math.sin(a) * (r - 14);
    svg += `<circle cx="${xi.toFixed(1)}" cy="${yi.toFixed(1)}" r="1.4" fill="var(--copper-400)"/>`;
  });
  g.innerHTML = svg;
})();

/* ---------- Astrolabe tick marks (legacy) ---------- */
(function astrolabeTicks() {
  const g = document.getElementById('ticks');
  if (!g) return;
  const NS = 'http://www.w3.org/2000/svg';
  const cx = 230, cy = 230, r1 = 213, r2 = 220;
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 6 === 0;
    const start = isMajor ? r1 - 4 : r1 + 1;
    const x1 = cx + Math.cos(a) * start;
    const y1 = cy + Math.sin(a) * start;
    const x2 = cx + Math.cos(a) * r2;
    const y2 = cy + Math.sin(a) * r2;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', isMajor ? 'var(--ink-800)' : 'var(--ink-500)');
    line.setAttribute('stroke-width', isMajor ? '0.9' : '0.5');
    g.appendChild(line);
  }
})();

/* ---------- Zodiac glyphs around inner ring of astrolabe (legacy — disabled) ---------- */
(function zodiacRing() {
  return; // replaced by dataRing
  const g = document.getElementById('zodiacGlyphs');
  if (!g) return;
  const NS = 'http://www.w3.org/2000/svg';
  const glyphs = ['♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎', '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎'];
  const cx = 230, cy = 230, r = 188;
  glyphs.forEach((sym, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r + 4;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', "'Noto Sans Symbols 2', 'Segoe UI Symbol'");
    t.setAttribute('font-size', '13');
    t.setAttribute('fill', 'var(--ink-700)');
    t.textContent = sym;
    g.appendChild(t);
  });
})();

/* ---------- Skill tag cloud ---------- */
(function tagCloud() {
  const stage = document.getElementById('cloudStage');
  const famList = document.getElementById('famList');
  if (!stage || !famList) return;

  // weight: 1 (small) → 5 (largest)
  const tags = [
    { t: 'Python',     f: 'lang',  w: 5 },
    { t: 'SQL',        f: 'lang',  w: 5 },
    { t: 'Spark',      f: 'data',  w: 5 },
    { t: 'AWS',        f: 'cloud', w: 5 },
    { t: 'LLMs',       f: 'llm',   w: 5 },
    { t: 'Scala',      f: 'lang',  w: 4 },
    { t: 'ETL',        f: 'data',  w: 4 },
    { t: 'Lakehouse',  f: 'data',  w: 4 },
    { t: 'NER',        f: 'llm',   w: 4 },
    { t: 'Embeddings', f: 'llm',   w: 4 },
    { t: 'S3',         f: 'cloud', w: 4 },
    { t: 'Glue',       f: 'cloud', w: 3 },
    { t: 'EMR',        f: 'cloud', w: 3 },
    { t: 'SQS',        f: 'cloud', w: 4 },
    { t: 'Celery',     f: 'cloud', w: 3 },
    { t: 'Dremio',     f: 'data',  w: 3 },
    { t: 'Snowflake',  f: 'data',  w: 3 },
    { t: 'dbt',        f: 'data',  w: 3 },
    { t: 'Pandas',     f: 'lang',  w: 4 },
    { t: 'Transformers', f: 'llm', w: 3 },
    { t: 'Re-ranking', f: 'llm',   w: 3 },
    { t: 'SVM',        f: 'ml',    w: 3 },
    { t: 'Naïve Bayes',f: 'ml',    w: 2 },
    { t: 'Regression', f: 'ml',    w: 3 },
    { t: 'SLSQP',      f: 'ml',    w: 2 },
    { t: 'Time series',f: 'ml',    w: 2 },
    { t: 'Tableau',    f: 'craft', w: 3 },
    { t: 'Power BI',   f: 'craft', w: 3 },
    { t: 'GraphQL',    f: 'craft', w: 2 },
    { t: 'Flask',      f: 'craft', w: 2 },
    { t: 'Redis',      f: 'data',  w: 2 },
    { t: 'Kubernetes', f: 'cloud', w: 3 },
    { t: 'Git',        f: 'craft', w: 4 },
    { t: 'Bash',       f: 'lang',  w: 3 },
    { t: 'OOP',        f: 'craft', w: 3 },
    { t: 'Pentaho',    f: 'craft', w: 2 },
    { t: 'Databricks', f: 'data',  w: 3 },
    { t: 'OpenAI',     f: 'llm',   w: 3 },
    { t: 'HIPAA',      f: 'craft', w: 2 },
    { t: 'Mentoring',  f: 'craft', w: 3 },
  ];

  // Shuffle for organic layout (deterministic — fixed seed)
  let seed = 42;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = tags.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [tags[i], tags[j]] = [tags[j], tags[i]];
  }

  // Build tags
  tags.forEach((tag) => {
    const el = document.createElement('span');
    el.className = `tag tag-w${tag.w}`;
    el.dataset.fam = tag.f;
    el.textContent = tag.t;
    el.style.setProperty('--rot', `${(rand() - 0.5) * 4}deg`);
    stage.appendChild(el);
  });

  const tagEls = stage.querySelectorAll('.tag');
  const famItems = famList.querySelectorAll('li[data-fam]');

  const setFamily = (fam) => {
    stage.classList.add('focused');
    tagEls.forEach(t => t.classList.toggle('on', t.dataset.fam === fam));
    famItems.forEach(li => li.classList.toggle('on', li.dataset.fam === fam));
  };
  const clear = () => {
    stage.classList.remove('focused');
    tagEls.forEach(t => t.classList.remove('on'));
    famItems.forEach(li => li.classList.remove('on'));
  };

  tagEls.forEach(t => {
    t.addEventListener('mouseenter', () => setFamily(t.dataset.fam));
    t.addEventListener('mouseleave', clear);
  });
  famItems.forEach(li => {
    li.addEventListener('mouseenter', () => setFamily(li.dataset.fam));
    li.addEventListener('mouseleave', clear);
  });

  // Total tools count for the legend footer
  const totalEl = document.getElementById('famTotal');
  if (totalEl) totalEl.textContent = String(tags.length);

  // Distribution spectrum — proportional segments per family
  const specEl = document.getElementById('famSpectrum');
  if (specEl) {
    const famWeights = {};
    tags.forEach(t => { famWeights[t.f] = (famWeights[t.f] || 0) + t.w; });
    const order = ['data','cloud','ml','llm','lang','craft'];
    const labels = {
      data: 'Data engineering', cloud: 'Cloud & ops',
      ml: 'ML & modelling', llm: 'LLMs & NLP',
      lang: 'Languages', craft: 'Craft & tooling'
    };
    const total = order.reduce((s, f) => s + (famWeights[f] || 0), 0);
    specEl.innerHTML = '';
    order.forEach(f => {
      const w = famWeights[f] || 0;
      const pct = total ? (w / total * 100).toFixed(2) : 0;
      const li = document.querySelector(`.fam-list li[data-fam="${f}"]`);
      const color = li ? getComputedStyle(li).getPropertyValue('--fam').trim() : '#888';
      const seg = document.createElement('div');
      seg.className = 'seg';
      seg.style.flex = `${w} 0 0`;
      seg.style.setProperty('--fam', color);
      seg.dataset.fam = f;
      seg.title = `${labels[f]} — ${pct}%`;
      seg.addEventListener('mouseenter', () => {
        document.querySelectorAll(`.fam-list li[data-fam="${f}"]`).forEach(el => el.dispatchEvent(new Event('mouseenter')));
      });
      seg.addEventListener('mouseleave', () => {
        document.querySelectorAll(`.fam-list li[data-fam="${f}"]`).forEach(el => el.dispatchEvent(new Event('mouseleave')));
      });
      specEl.appendChild(seg);
    });
  }
})();

/* ---------- Skill wheel (legacy) ---------- */
(function legacyWheel() {
  const wheelSvg = document.getElementById('skillWheel');
  if (!wheelSvg) return; // wheel removed
  const NS = 'http://www.w3.org/2000/svg';

  // 8 sectors — domain, glyph, weight (0..1) defines petal length
  const sectors = [
    { key: 'data',  glyph: '☉', label: 'Data eng',     weight: 0.95 },
    { key: 'cloud', glyph: '♃', label: 'Cloud',        weight: 0.85 },
    { key: 'ml',    glyph: '♂', label: 'ML',            weight: 0.75 },
    { key: 'llm',   glyph: '☽', label: 'LLMs',          weight: 0.90 },
    { key: 'bi',    glyph: '♀', label: 'BI',            weight: 0.70 },
    { key: 'lang',  glyph: '☿', label: 'Languages',    weight: 0.92 },
    { key: 'db',    glyph: '♄', label: 'Storage',      weight: 0.78 },
    { key: 'craft', glyph: '☊', label: 'Craft',        weight: 0.82 },
  ];

  const cx = 280, cy = 280;
  const innerR = 108;
  const outerMax = 224;     // sectors stay well inside outer ring at 248
  const N = sectors.length;
  const sweep = (Math.PI * 2) / N;

  // STATIC layer (sectors + glyphs + labels) — does NOT rotate
  const staticLayer = document.createElementNS(NS, 'g');
  wheelSvg.insertBefore(staticLayer, rotor);

  // Build sectors (static — hover works rock-solid)
  sectors.forEach((s, i) => {
    const a0 = i * sweep - Math.PI / 2;
    const a1 = (i + 1) * sweep - Math.PI / 2;
    const aMid = (a0 + a1) / 2;
    const r = innerR + (outerMax - innerR) * s.weight;

    const x0 = cx + Math.cos(a0) * innerR;
    const y0 = cy + Math.sin(a0) * innerR;
    const x1 = cx + Math.cos(a0) * r;
    const y1 = cy + Math.sin(a0) * r;
    const x2 = cx + Math.cos(a1) * r;
    const y2 = cy + Math.sin(a1) * r;
    const x3 = cx + Math.cos(a1) * innerR;
    const y3 = cy + Math.sin(a1) * innerR;

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', [
      `M ${x0} ${y0}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 0 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 0 0 ${x0} ${y0}`,
      'Z'
    ].join(' '));
    path.setAttribute('data-key', s.key);
    path.setAttribute('fill', 'rgba(176, 122, 60, 0.08)');
    path.setAttribute('stroke', 'var(--ink-800)');
    path.setAttribute('stroke-width', '0.6');
    path.style.transition = 'fill 240ms cubic-bezier(0.2,0,0.2,1), stroke 240ms';
    path.style.cursor = 'pointer';
    staticLayer.appendChild(path);

    // tick marks within sector
    for (let k = 1; k <= 4; k++) {
      const rk = innerR + ((outerMax - innerR) * k) / 4;
      const xa = cx + Math.cos(a0) * rk;
      const ya = cy + Math.sin(a0) * rk;
      const xb = cx + Math.cos(a0 + 0.02) * rk;
      const yb = cy + Math.sin(a0 + 0.02) * rk;
      const t = document.createElementNS(NS, 'line');
      t.setAttribute('x1', xa); t.setAttribute('y1', ya);
      t.setAttribute('x2', xb); t.setAttribute('y2', yb);
      t.setAttribute('stroke', 'var(--rule)');
      t.setAttribute('stroke-width', '0.5');
      t.style.pointerEvents = 'none';
      staticLayer.appendChild(t);
    }

    // glyph (just outside inner disc)
    const glyphR = innerR + 22;
    const gx = cx + Math.cos(aMid) * glyphR;
    const gy = cy + Math.sin(aMid) * glyphR + 6;
    const gt = document.createElementNS(NS, 'text');
    gt.setAttribute('x', gx);
    gt.setAttribute('y', gy);
    gt.setAttribute('text-anchor', 'middle');
    gt.setAttribute('font-family', "'Noto Sans Symbols 2', 'Segoe UI Symbol'");
    gt.setAttribute('font-size', '20');
    gt.setAttribute('fill', 'var(--ink-800)');
    gt.setAttribute('data-glyph', s.key);
    gt.style.pointerEvents = 'none';
    gt.textContent = s.glyph;
    staticLayer.appendChild(gt);

    // label inside the wheel, just inside outer rim
    const labelR = innerR + 70;
    const lx = cx + Math.cos(aMid) * labelR;
    const ly = cy + Math.sin(aMid) * labelR + 3;
    const lt = document.createElementNS(NS, 'text');
    lt.setAttribute('x', lx);
    lt.setAttribute('y', ly);
    lt.setAttribute('text-anchor', 'middle');
    lt.setAttribute('font-family', "'Inter Tight', system-ui, sans-serif");
    lt.setAttribute('font-size', '9.5');
    lt.setAttribute('letter-spacing', '0.14em');
    lt.setAttribute('fill', 'var(--fg3)');
    lt.setAttribute('font-weight', '500');
    lt.setAttribute('data-label', s.key);
    lt.style.pointerEvents = 'none';
    lt.style.textTransform = 'uppercase';
    lt.textContent = s.label.toUpperCase();
    staticLayer.appendChild(lt);
  });

  // Compass needle — points to active sector with a smooth ease
  const needle = document.createElementNS(NS, 'g');
  needle.setAttribute('id', 'wheelNeedle');
  needle.style.transformOrigin = `${cx}px ${cy}px`;
  needle.style.transformBox = 'fill-box';
  needle.innerHTML = `
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 220}" stroke="var(--copper-500)" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy - 220}" r="3.5" fill="var(--copper-400)" stroke="var(--ink-800)" stroke-width="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="var(--ink-800)"/>
    <circle cx="${cx}" cy="${cy}" r="2" fill="var(--copper-400)"/>
  `;
  needle.style.transition = 'transform 600ms cubic-bezier(0.2,0,0.2,1)';
  needle.style.opacity = '0.45';
  wheelSvg.appendChild(needle);

  // Rotor: only outer decorative ring rotates (sectors stay still)
  // outer copper dotted ring
  const dRing = document.createElementNS(NS, 'circle');
  dRing.setAttribute('cx', cx); dRing.setAttribute('cy', cy);
  dRing.setAttribute('r', 240);
  dRing.setAttribute('fill', 'none');
  dRing.setAttribute('stroke', 'var(--copper-400)');
  dRing.setAttribute('stroke-width', '0.5');
  dRing.setAttribute('stroke-dasharray', '1 5');
  rotor.appendChild(dRing);
  // outer tick ring
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r1 = 248, r2 = i % 5 === 0 ? 256 : 252;
    const tline = document.createElementNS(NS, 'line');
    tline.setAttribute('x1', cx + Math.cos(a) * r1);
    tline.setAttribute('y1', cy + Math.sin(a) * r1);
    tline.setAttribute('x2', cx + Math.cos(a) * r2);
    tline.setAttribute('y2', cy + Math.sin(a) * r2);
    tline.setAttribute('stroke', 'var(--ink-700)');
    tline.setAttribute('stroke-width', i % 5 === 0 ? '0.7' : '0.4');
    rotor.appendChild(tline);
  }

  // Hover sync between wheel + legend
  const legend = document.getElementById('legendTable');
  const sectorPaths = staticLayer.querySelectorAll('path[data-key]');
  const rows = legend ? legend.querySelectorAll('tr[data-key]') : [];

  const sectorAngle = (key) => {
    const idx = sectors.findIndex(s => s.key === key);
    return (idx + 0.5) * (360 / N); // degrees, 0 = up
  };

  const setActive = (key) => {
    sectorPaths.forEach(p => {
      const isActive = p.getAttribute('data-key') === key;
      p.setAttribute('fill', isActive ? 'rgba(176, 122, 60, 0.34)' : 'rgba(176, 122, 60, 0.08)');
      p.setAttribute('stroke', isActive ? 'var(--copper-500)' : 'var(--ink-800)');
      p.setAttribute('stroke-width', isActive ? '1' : '0.6');
    });
    staticLayer.querySelectorAll('text[data-glyph]').forEach(g => {
      g.setAttribute('fill', g.getAttribute('data-glyph') === key ? 'var(--copper-600)' : 'var(--ink-800)');
    });
    staticLayer.querySelectorAll('text[data-label]').forEach(l => {
      l.setAttribute('fill', l.getAttribute('data-label') === key ? 'var(--copper-600)' : 'var(--fg3)');
    });
    rows.forEach(r => r.classList.toggle('active', r.getAttribute('data-key') === key));
    needle.style.transform = `rotate(${sectorAngle(key)}deg)`;
    needle.style.opacity = '1';
  };
  const clear = () => {
    sectorPaths.forEach(p => {
      p.setAttribute('fill', 'rgba(176, 122, 60, 0.08)');
      p.setAttribute('stroke', 'var(--ink-800)');
      p.setAttribute('stroke-width', '0.6');
    });
    staticLayer.querySelectorAll('text[data-glyph]').forEach(g => g.setAttribute('fill', 'var(--ink-800)'));
    staticLayer.querySelectorAll('text[data-label]').forEach(l => l.setAttribute('fill', 'var(--fg3)'));
    rows.forEach(r => r.classList.remove('active'));
    needle.style.opacity = '0.45';
  };

  sectorPaths.forEach(p => {
    p.addEventListener('mouseenter', () => setActive(p.getAttribute('data-key')));
    p.addEventListener('mouseleave', clear);
  });
  rows.forEach(r => {
    r.addEventListener('mouseenter', () => setActive(r.getAttribute('data-key')));
    r.addEventListener('mouseleave', clear);
  });

  // Slow rotation of the OUTER decorative ring only. Speed reacts to motion tweak.
  let rot = 0;
  let speed = 0.04;
  window.addEventListener('almanac:tweaks', (e) => {
    const m = e.detail?.motion;
    if (m === 'still') speed = 0;
    else if (m === 'restless') speed = 0.18;
    else speed = 0.04;
  });

  function spin() {
    if (speed > 0) {
      rot += speed;
      rotor.setAttribute('transform', `rotate(${rot} ${cx} ${cy})`);
    }
    requestAnimationFrame(spin);
  }
  spin();
})();

/* ---------- Starfield (subtle background, reacts to tweaks) ---------- */
(function starfield() {
  const c = document.getElementById('starfield');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];
  let texture = 0.5;
  let motion = 'slow';
  let mood = 'day';

  function buildStars() {
    // density scales with texture; bumped up in night mode for a starrier sky
    const base = (window.innerWidth * window.innerHeight) / 38000;
    const moodMult = mood === 'night' ? 2.6 : 1;
    const count = Math.floor(base * (0.35 + texture * 1.6) * moodMult);
    stars = Array.from({ length: count }, () => {
      const isBright = Math.random() < 0.08;     // ~8% brighter twinklers
      const isHuge   = Math.random() < 0.012;    // rare large diamonds
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: isHuge ? 1.8 + Math.random() * 1.0
           : isBright ? 1.0 + Math.random() * 0.8
           : Math.random() * 1.1 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: 0.004 + Math.random() * 0.018,
        bright: isBright || isHuge,
      };
    });
  }

  function resize() {
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    buildStars();
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('almanac:tweaks', (e) => {
    const next = e.detail || {};
    let needsRebuild = false;
    if (typeof next.texture === 'number' && next.texture / 100 !== texture) {
      texture = next.texture / 100;
      needsRebuild = true;
    }
    if (next.mood && next.mood !== mood) { mood = next.mood; needsRebuild = true; }
    if (next.motion && next.motion !== motion) motion = next.motion;
    if (needsRebuild) buildStars();
  });

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    const speed = motion === 'still' ? 0 : motion === 'restless' ? 2.4 : 1;
    const onNight = mood === 'night';
    const baseAlpha = onNight ? 0.42 : 0.18;
    const ampAlpha  = onNight ? 0.38 : 0.14;
    const colorBase = onNight ? '243, 236, 222' : '26, 32, 56';

    for (const s of stars) {
      s.tw += s.sp * speed;
      const alpha = baseAlpha + Math.sin(s.tw) * ampAlpha;
      const a = Math.max(0, alpha);
      ctx.fillStyle = `rgba(${colorBase}, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (onNight ? 1.1 : 1), 0, Math.PI * 2);
      ctx.fill();
      // Bright stars get a soft halo on night mode
      if (onNight && s.bright) {
        ctx.fillStyle = `rgba(${colorBase}, ${a * 0.18})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- Cursor dot ---------- */
(function cursorDot() {
  const dot = document.getElementById('cursorDot');
  if (!dot) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  function loop() {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  // Lift on interactive elements
  const interactive = 'a, button, .proj, .rec, .tl-tag, [data-key]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) dot.classList.add('lift');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) dot.classList.remove('lift');
  });
})();

/* ---------- Mood toggle (masthead day/night switch) ---------- */
(function moodToggle() {
  const btn = document.getElementById('moodToggle');
  if (!btn) return;
  const KEY = 'almanac-mood';
  const saved = localStorage.getItem(KEY);
  if (saved === 'night' || saved === 'day') {
    document.body.dataset.mood = saved;
    window.dispatchEvent(new CustomEvent('almanac:tweaks', { detail: { mood: saved } }));
  }
  btn.addEventListener('click', () => {
    const cur = document.body.dataset.mood || 'day';
    const next = cur === 'night' ? 'day' : 'night';
    document.body.dataset.mood = next;
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new CustomEvent('almanac:tweaks', { detail: { mood: next } }));
    // sync the tweaks panel + persist to disk if available
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { mood: next } }, '*');
    // refresh tweaks panel UI if present
    document.querySelectorAll('#tweaks-panel [data-key="mood"] .tw-opt').forEach(b => {
      b.classList.toggle('on', b.dataset.value === next);
    });
  });
})();
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  els.forEach(el => io.observe(el));
})();
