/* Accessibility preferences widget — comfort tool only, never touches content DOM */
(function () {
  var STORAGE_KEY = 'landgo_a11y_prefs_v1';

  var TOGGLES = [
    { key: 'contrast', type: 'cycle', values: [null, 'high', 'invert', 'mono'],
      labels: { null: 'ניגודיות רגילה', high: 'ניגודיות גבוהה', invert: 'ניגודיות הפוכה', mono: 'שחור-לבן' },
      icon: '◐', name: 'ניגודיות' },
    { key: 'textSize', type: 'cycle', values: [null, 115, 130, 150],
      labels: { null: '100%', 115: '115%', 130: '130%', 150: '150%' },
      icon: 'א', name: 'גודל טקסט' },
    { key: 'lineSpacing', type: 'cycle', values: [null, 16, 20],
      labels: { null: 'ריווח רגיל', 16: 'ריווח 1.6', 20: 'ריווח 2.0' },
      icon: '≡', name: 'ריווח שורות' },
    { key: 'links', type: 'bool', icon: '🔗', name: 'הדגשת קישורים' },
    { key: 'headings', type: 'bool', icon: 'H', name: 'הדגשת כותרות' },
    { key: 'readableFont', type: 'bool', icon: 'Aa', name: 'גופן קריא' },
    { key: 'reduceMotion', type: 'bool', icon: '⏸', name: 'עצירת אנימציות' },
    { key: 'cursorBig', type: 'bool', icon: '➤', name: 'סמן גדול' }
  ];

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (parsed.version !== 1) return {};
      return parsed.prefs || {};
    } catch (e) { return {}; }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, prefs: prefs }));
    } catch (e) {}
  }

  function applyPrefs(prefs) {
    var html = document.documentElement;
    var body = document.body;

    html.classList.remove('a11y-contrast-high', 'a11y-contrast-invert', 'a11y-contrast-mono');
    if (prefs.contrast === 'high') html.classList.add('a11y-contrast-high');
    if (prefs.contrast === 'invert') html.classList.add('a11y-contrast-invert');
    if (prefs.contrast === 'mono') html.classList.add('a11y-contrast-mono');

    if (body) {
      body.classList.remove('a11y-text-115', 'a11y-text-130', 'a11y-text-150');
      if (prefs.textSize) body.classList.add('a11y-text-' + prefs.textSize);

      body.classList.remove('a11y-lines-16', 'a11y-lines-20');
      if (prefs.lineSpacing) body.classList.add('a11y-lines-' + prefs.lineSpacing);

      body.classList.toggle('a11y-readable-font', !!prefs.readableFont);
      body.classList.toggle('a11y-headings', !!prefs.headings);
    }

    html.classList.toggle('a11y-links', !!prefs.links);
    html.classList.toggle('a11y-cursor-big', !!prefs.cursorBig);
    html.classList.toggle('a11y-reduce-motion', !!prefs.reduceMotion);
  }

  function announce(text) {
    var live = document.getElementById('a11y-status');
    if (live) live.textContent = text;
  }

  function buildWidget() {
    var trigger = document.createElement('button');
    trigger.id = 'a11y-widget-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'פתיחת אפשרויות נגישות');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'a11y-widget-panel');
    trigger.setAttribute('aria-keyshortcuts', 'Alt+A');
    trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.2" r="2.2"/><path d="M12 8c-4 0-7.4 1-9.6 2.6-.6.4-.7 1.2-.3 1.8.4.6 1.2.7 1.8.3C5.7 11.3 8.6 10.5 12 10.5s6.3.8 8.1 2.2c.6.4 1.4.3 1.8-.3.4-.6.3-1.4-.3-1.8C19.4 9 16 8 12 8Zm-1.4 5.3-3 8.4c-.2.7.1 1.4.8 1.6.7.2 1.4-.1 1.6-.8l1.9-5.3 1.9 5.3c.2.7 1 1 1.6.8.7-.2 1-1 .8-1.6l-3-8.4c-.2-.5-.7-.9-1.3-.9s-1.1.4-1.3.9Z"/></svg>';

    var panel = document.createElement('div');
    panel.id = 'a11y-widget-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'אפשרויות נגישות');
    panel.hidden = true;

    var closeBtn = document.createElement('button');
    closeBtn.id = 'a11y-widget-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'סגירת חלונית נגישות');
    closeBtn.textContent = '×';
    panel.appendChild(closeBtn);

    var heading = document.createElement('h2');
    heading.textContent = 'אפשרויות נגישות';
    panel.appendChild(heading);

    var grid = document.createElement('div');
    grid.className = 'a11y-grid';

    var prefs = loadPrefs();
    var buttonRefs = {};

    TOGGLES.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'a11y-toggle';
      btn.dataset.key = t.key;

      function render() {
        if (t.type === 'bool') {
          var active = !!prefs[t.key];
          btn.setAttribute('aria-pressed', active ? 'true' : 'false');
          btn.innerHTML = '<span class="a11y-toggle-icon">' + t.icon + '</span>' + t.name;
        } else {
          var val = prefs[t.key] || null;
          btn.removeAttribute('aria-pressed');
          btn.setAttribute('aria-label', t.name + ': ' + t.labels[val]);
          btn.innerHTML = '<span class="a11y-toggle-icon">' + t.icon + '</span>' + t.name + '<br><small>' + t.labels[val] + '</small>';
        }
      }
      render();

      btn.addEventListener('click', function () {
        if (t.type === 'bool') {
          prefs[t.key] = !prefs[t.key];
        } else {
          var idx = t.values.indexOf(prefs[t.key] || null);
          var next = t.values[(idx + 1) % t.values.length];
          prefs[t.key] = next;
        }
        savePrefs(prefs);
        applyPrefs(prefs);
        render();
        announce(t.name + ' עודכן');
      });

      buttonRefs[t.key] = { btn: btn, render: render };
      grid.appendChild(btn);
    });

    panel.appendChild(grid);

    var resetBtn = document.createElement('button');
    resetBtn.id = 'a11y-reset';
    resetBtn.type = 'button';
    resetBtn.textContent = 'איפוס כל ההגדרות';
    resetBtn.addEventListener('click', function () {
      prefs = {};
      savePrefs(prefs);
      applyPrefs(prefs);
      Object.keys(buttonRefs).forEach(function (k) { buttonRefs[k].render(); });
      announce('כל הגדרות הנגישות אופסו');
    });
    panel.appendChild(resetBtn);

    var live = document.createElement('div');
    live.id = 'a11y-status';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');

    document.body.appendChild(trigger);
    document.body.appendChild(panel);
    document.body.appendChild(live);

    function openPanel() {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }
    function closePanel() {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    trigger.addEventListener('click', function () {
      if (panel.hidden) openPanel(); else closePanel();
    });
    closeBtn.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        if (panel.hidden) openPanel(); else closePanel();
      }
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
        closePanel();
      }
    });

    applyPrefs(prefs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
