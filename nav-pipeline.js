/* =====================================================
   NEURAL PIPELINE — fixed-side section navigator
   Each section is a node. Lines = neural connections.
   Scrolling animates a "data packet" flowing to the
   current node. Click any node to jump.
   ===================================================== */

(function neuralPipeline() {
  if (window.matchMedia('(max-width: 900px)').matches) return;

  // Friendly labels for each section's data-screen-label
  const LABELS = {
    '01 Hero':            { short: '01', name: 'init',        sub: 'boot · welcome' },
    '02 Now':             { short: '02', name: 'now',         sub: 'live process' },
    '03 Path':            { short: '03', name: 'path',        sub: 'log history' },
    '04 Education':       { short: '04', name: 'training',    sub: 'pretrain phase' },
    '05 Work':            { short: '05', name: 'projects',    sub: 'shipped builds' },
    '06 Skills':          { short: '06', name: 'stack',       sub: 'tools and tongues' },
    '07 Ledger':          { short: '07', name: 'writing',     sub: 'papers, awards' },
    '08 Recommendations': { short: '08', name: 'references',  sub: 'co-signers' },
    '09 Contact':         { short: '09', name: 'connect',     sub: 'open socket' },
  };

  const sections = Array.from(document.querySelectorAll('[data-screen-label]'))
    .filter(el => el.matches('section'))
    .filter((el, i, arr) => arr.findIndex(x => x.dataset.screenLabel === el.dataset.screenLabel) === i);
  if (sections.length < 2) return;

  // ---------- Build nav ----------
  const nav = document.createElement('aside');
  nav.id = 'neural-nav';
  nav.setAttribute('aria-label', 'Section navigator');
  nav.innerHTML = `
    <div class="nn-rail" aria-hidden="true">
      <svg class="nn-svg" viewBox="0 0 32 ${(sections.length - 1) * 56 + 32}" preserveAspectRatio="none">
        <path class="nn-line nn-line-bg" d="" />
        <path class="nn-line nn-line-fg" d="" />
        <circle class="nn-packet" r="3.5" cx="16" cy="16" fill="var(--copper-400)" />
      </svg>
      <ul class="nn-nodes"></ul>
    </div>
    <div class="nn-tip" aria-hidden="true">
      <div class="nn-tip-row">
        <span class="nn-tip-prompt">$</span>
        <span class="nn-tip-name">init</span>
      </div>
      <div class="nn-tip-sub">boot · welcome</div>
    </div>
  `;
  document.body.appendChild(nav);

  const list = nav.querySelector('.nn-nodes');
  const svg  = nav.querySelector('.nn-svg');
  const lineBg = svg.querySelector('.nn-line-bg');
  const lineFg = svg.querySelector('.nn-line-fg');
  const packet = svg.querySelector('.nn-packet');
  const tip = nav.querySelector('.nn-tip');
  const tipName = tip.querySelector('.nn-tip-name');
  const tipSub  = tip.querySelector('.nn-tip-sub');

  // ---------- Render nodes ----------
  // Adaptive gap so the rail always fits the viewport
  const PADDING_Y = 120;
  const usable = Math.max(280, window.innerHeight - PADDING_Y);
  const NODE_GAP = Math.max(28, Math.min(56, Math.floor(usable / Math.max(1, sections.length - 1))));
  const NODE_X = 16;
  const TOP = 16;

  sections.forEach((sec, i) => {
    const lbl = LABELS[sec.dataset.screenLabel] || { short: String(i+1).padStart(2,'0'), name: sec.id || 'node', sub: '' };
    const li = document.createElement('li');
    li.className = 'nn-node';
    li.dataset.idx = String(i);
    li.style.top = (TOP + i * NODE_GAP - 11) + 'px';
    li.innerHTML = `<span class="nn-dot"></span><span class="nn-no">${lbl.short}</span>`;
    li.addEventListener('click', () => {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    li.addEventListener('mouseenter', () => {
      tipName.textContent = lbl.name;
      tipSub.textContent  = lbl.sub;
      tip.classList.add('show');
      tip.style.top = (TOP + i * NODE_GAP - 18) + 'px';
    });
    li.addEventListener('mouseleave', () => {
      tip.classList.remove('show');
    });
    list.appendChild(li);
  });

  // Sized SVG height to fit all nodes
  const totalH = TOP * 2 + (sections.length - 1) * NODE_GAP;
  svg.setAttribute('height', totalH);
  svg.style.height = totalH + 'px';
  svg.style.width  = '32px';

  // Background path: vertical line through all nodes
  const bgPath = `M ${NODE_X} ${TOP} L ${NODE_X} ${TOP + (sections.length-1) * NODE_GAP}`;
  lineBg.setAttribute('d', bgPath);
  lineFg.setAttribute('d', bgPath);

  // Set up dasharray progressive draw
  const totalLen = (sections.length - 1) * NODE_GAP;
  lineFg.setAttribute('stroke-dasharray', String(totalLen));
  lineFg.setAttribute('stroke-dashoffset', String(totalLen));

  // ---------- Scroll spy via IntersectionObserver ----------
  let activeIdx = 0;
  const nodes = list.querySelectorAll('.nn-node');

  const setActive = (i, animate = true) => {
    if (i === activeIdx && animate) return;
    activeIdx = i;
    nodes.forEach((n, k) => {
      n.classList.toggle('on', k === i);
      n.classList.toggle('past', k < i);
    });
    const targetY = TOP + i * NODE_GAP;
    if (animate) {
      animatePacket(targetY);
      // animate line draw
      const drawn = totalLen - (i * NODE_GAP);
      lineFg.style.transition = 'stroke-dashoffset 600ms cubic-bezier(0.2,0,0.2,1)';
      lineFg.setAttribute('stroke-dashoffset', String(drawn));
    } else {
      packet.setAttribute('cy', String(targetY));
      const drawn = totalLen - (i * NODE_GAP);
      lineFg.style.transition = 'none';
      lineFg.setAttribute('stroke-dashoffset', String(drawn));
    }
  };

  // Packet animation along the rail
  let packetAnim = null;
  function animatePacket(targetY) {
    const startY = parseFloat(packet.getAttribute('cy')) || TOP;
    const dur = 700;
    const t0 = performance.now();
    if (packetAnim) cancelAnimationFrame(packetAnim);
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const y = startY + (targetY - startY) * ease(t);
      packet.setAttribute('cy', String(y));
      if (t < 1) packetAnim = requestAnimationFrame(step);
    };
    packetAnim = requestAnimationFrame(step);
  }

  // Spy
  const io = new IntersectionObserver((entries) => {
    // Pick the section with the highest intersectionRatio
    let best = null;
    entries.forEach(e => {
      if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
    });
    if (!best) return;
    const idx = sections.indexOf(best.target);
    if (idx !== -1) setActive(idx);
  }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.1, 0.3, 0.6] });
  sections.forEach(s => io.observe(s));

  // initial
  requestAnimationFrame(() => setActive(0, false));
})();
