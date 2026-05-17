/* =====================================================
   ASK THE PAGE — small AI assistant for visitors
   Uses window.claude.complete to answer questions
   about Kshitiz grounded in CV context.
   ===================================================== */

(function askWidget() {
  if (!window.claude || !window.claude.complete) return; // graceful skip

  // ----- Page knowledge (kept tight to fit token budget) -----
  const CONTEXT = `You are a small assistant embedded in Kshitiz Dhakal's personal website.
You answer questions about him for visitors — grounded ONLY in the context below.
Tone: warm, dry, professional. Refer to him as Kshitiz or "he". Never invent facts.
If asked something the context does not cover, say so briefly and suggest emailing kshitiz.dhakal50@gmail.com.
Keep answers concise: 2–4 short sentences, no headings, no bullet lists unless asked.

CONTEXT — about Kshitiz Dhakal:
• Role: Data & AI Engineer based in Kathmandu, Nepal. Available for research, engineering, consulting and speaking.
• Currently (since Jan 2026): at Maitri Services. Building an NLP/LLM pipeline that maps unstructured clinical notes to ICD-10 and HCC codes — Named Entity Recognition → context modeling → embeddings → re-ranking → date-of-service detection. Uses fine-tuned LLMs, AWS SQS + Celery for async orchestration, HIPAA-compliant data handling.
• 2024–2025 (GrowByData, Data Engineer): batch Google Feeds framework, data acquisition optimisation, Dremio migration from AWS to Kubernetes, BI report tuning, GraphQL backend, co-led the data team, mentored interns.
• 2023–2024 (GrowByData, Associate Data Engineer): Spark/Scala ETL, lakehouse on S3 + Glue + EMR, OAuth2 multi-threaded data acquisition, Flask BI backend with Redis caching and per-client anonymisation.
• 2023 summer (GritFeat Fellow): PySpark on Databricks, dbt, Pentaho, Snowflake, Tableau and Power BI.
• 2022 (GlobalShala intern): pandas-based visualisation of ad performance, ROAS pruning.
• Education: BEI in Electronics, Communication & IT, Pulchowk Campus / IOE Tribhuvan University (2018–2023), avg 78.9%. Capstones: LSA + transformers for text summarisation, weighted SVM + Naïve Bayes ensemble for sentiment (later published in MAT Journals, 2025).
• Stack: Python, SQL, Scala; Spark, ETL, lakehouse, Dremio, Snowflake, dbt; AWS (S3, EMR, Glue, SQS, EC2), Kubernetes; NER, transformers, embeddings, re-ranking, OpenAI; pandas, regression, SVM, NB, time series; Tableau, Power BI, GraphQL, Flask, Redis, Git.
• Awards: Employee of the Quarter, GrowByData (Jul 2024); Nepal Physics & Science Olympiads (2018).
• References: Kyle Tremblay (Director of Product Dev, Agital USA), Frank Kjaersgaard (CPO, Agital USA), Ambika Adhikari (Engineering Manager, Maitri Services).
• Contact: kshitiz.dhakal50@gmail.com — open to research and engineering work, especially in healthcare AI / NLP / data pipelines.

End of context.`;

  // ----- Build UI -----
  const widget = document.createElement('div');
  widget.id = 'ask-widget';
  widget.innerHTML = `
    <button id="askToggle" class="ask-toggle" type="button" aria-expanded="false" aria-controls="askPanel">
      <span class="ask-pulse" aria-hidden="true"></span>
      <span class="ask-toggle-label">
        <span class="ask-toggle-prefix">$</span>
        ask /kshitiz
      </span>
    </button>

    <section id="askPanel" class="ask-panel" hidden aria-label="Ask the page assistant">
      <header class="ask-head">
        <span class="ask-head-dots" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="ask-head-title">ask /kshitiz</span>
        <button class="ask-close" type="button" aria-label="Minimize">_</button>
      </header>

      <div class="ask-log" id="askLog" role="log" aria-live="polite"></div>

      <div class="ask-suggest" id="askSuggest">
        <span class="ask-suggest-lbl">try</span>
        <button type="button" data-q="What's Kshitiz's strongest skill?">strongest skill?</button>
        <button type="button" data-q="What is he doing at Maitri Services?">what is he doing now?</button>
        <button type="button" data-q="Has he published any research?">published research?</button>
        <button type="button" data-q="Would he be a fit for a healthcare AI role?">healthcare AI fit?</button>
      </div>

      <form class="ask-form" id="askForm">
        <span class="ask-form-prefix">›</span>
        <input id="askInput" type="text" autocomplete="off" placeholder="type a question…" maxlength="200" />
        <button type="submit" class="ask-send" aria-label="Send">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M2 8 L14 2 L10 8 L14 14 Z" fill="currentColor"/>
          </svg>
        </button>
      </form>
    </section>
  `;
  document.body.appendChild(widget);

  const toggle = widget.querySelector('#askToggle');
  const panel  = widget.querySelector('#askPanel');
  const close  = widget.querySelector('.ask-close');
  const log    = widget.querySelector('#askLog');
  const sug    = widget.querySelector('#askSuggest');
  const form   = widget.querySelector('#askForm');
  const input  = widget.querySelector('#askInput');
  const sendBtn = widget.querySelector('.ask-send');

  // ----- Open / close -----
  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    widget.classList.add('open');
    setTimeout(() => input.focus(), 80);
    if (!log.children.length) greet();
  }
  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    widget.classList.remove('open');
  }
  toggle.addEventListener('click', () => panel.hidden ? open() : closePanel());
  close.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePanel();
  });

  // Drag re-positioning disabled — widget stays bottom-right.

  // ----- History (so the model has minimal turn context) -----
  const history = [];

  function addMsg(role, text, opts = {}) {
    const li = document.createElement('div');
    li.className = `ask-msg ask-msg-${role}`;
    if (opts.typing) li.classList.add('typing');
    li.innerHTML = role === 'assistant'
      ? `<span class="ask-msg-icon">⌥</span><div class="ask-msg-body"></div>`
      : `<span class="ask-msg-icon">›</span><div class="ask-msg-body"></div>`;
    li.querySelector('.ask-msg-body').textContent = text;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
    return li;
  }

  function greet() {
    addMsg('assistant', "Hey — I'm the page's assistant. Ask me anything about Kshitiz's work, projects, or what he's up to right now.");
  }

  async function ask(question) {
    if (!question || !question.trim()) return;
    sug.classList.add('hide');
    addMsg('user', question);
    history.push({ role: 'user', content: question });

    const loadingEl = addMsg('assistant', 'thinking…', { typing: true });
    sendBtn.disabled = true;
    input.disabled = true;

    try {
      // Build messages: prepend context as a system-style first user turn
      const messages = [
        { role: 'user', content: CONTEXT + '\n\nAcknowledge with one short word then await visitor questions.' },
        { role: 'assistant', content: 'Ready.' },
        ...history.slice(-6), // keep recent context only
      ];
      const reply = await window.claude.complete({ messages });
      const text = (reply || '').trim() || "I'm not sure — try emailing kshitiz.dhakal50@gmail.com.";
      loadingEl.classList.remove('typing');
      loadingEl.querySelector('.ask-msg-body').textContent = '';
      history.push({ role: 'assistant', content: text });
      typeOut(loadingEl.querySelector('.ask-msg-body'), text);
    } catch (e) {
      loadingEl.classList.remove('typing');
      loadingEl.querySelector('.ask-msg-body').textContent = "Couldn't reach the model. Try again, or email kshitiz.dhakal50@gmail.com.";
    } finally {
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  function typeOut(el, text) {
    let i = 0;
    const step = () => {
      el.textContent = text.slice(0, i);
      log.scrollTop = log.scrollHeight;
      if (i < text.length) {
        i += Math.max(1, Math.round(text.length / 90));
        setTimeout(step, 14);
      }
    };
    step();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    input.value = '';
    ask(q);
  });

  sug.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-q]');
    if (!btn) return;
    ask(btn.dataset.q);
  });

  // Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
})();
