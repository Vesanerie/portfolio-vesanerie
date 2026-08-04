/* ============================================================
   Prompteur · vesanerie.fr
   Vanilla, zéro dépendance. Tout reste sur l'appareil.
   ============================================================ */
(function () {
  'use strict';

  // La caméra n'est accessible qu'en contexte sécurisé.
  if (location.protocol === 'http:' &&
      location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    location.replace('https://' + location.host + location.pathname + location.search);
    return;
  }

  var $ = function (id) { return document.getElementById(id); };

  var DEFAULT_SCRIPT =
    "Bienvenue dans le prompteur.\n\n" +
    "Appuie sur Texte, en haut, pour coller le tien.\n\n" +
    "Le gros bouton lance le défilement. Sur ordinateur, la barre d'espace fait la même chose, " +
    "et les flèches haut et bas règlent la vitesse.\n\n" +
    "Place la fenêtre juste sous ton objectif : ton regard reste dans l'axe pendant que tu lis.\n\n" +
    "Rien ne sort de ton appareil. Ni l'image, ni le texte.";

  // ===== État =====

  var S = {                       // réglages persistés
    speed: 22, size: 52, lineHeight: 145, colWidth: 86,
    font: 'system', bold: true, align: 'center',
    textColor: '#f4f1ea', textShadow: true,
    veilOpacity: 35, dimAmount: 0,
    lineOn: true, linePos: 38, lineColor: '#ffb020',
    mirrorText: false, flipText: false,
    camOn: true, camMirror: true, camOpacity: 100, camId: '',
    countdownSec: 3, autoHide: true, wakeLock: true
  };
  var DEFAULTS = JSON.parse(JSON.stringify(S));

  var text = DEFAULT_SCRIPT;
  var playing = false;
  var offset = 0;            // décalage vertical courant, en pixels
  var contentH = 0;          // hauteur totale du texte
  var lineH = 60;            // hauteur d'une ligne
  var words = 0;
  var lastFrame = 0;
  var countdownLeft = 0;
  var stream = null;
  var wake = null;
  var hideTimer = null;
  var controlsShown = true;

  var el = {};
  ['cam','camVoid','veil','dim','reader','flow','script','readline','countdown','countdownValue',
   'gate','gateNote','startCam','startNoCam','hudTop','hudBottom','tcElapsed','tcRemaining',
   'lampCam','wpm','progress','btnPlay','btnRewind','btnBack','btnFwd','btnMirror','btnEditor',
   'btnSettings','btnFull','speed','speedVal','size','sizeVal','editor','statWords','statTime',
   'fileIn','btnPaste','btnClear','panelEditor','panelSettings','camSelect','toast','btnReset','stage'
  ].forEach(function (id) { el[id] = $(id); });

  // ===== Persistance =====

  function save() {
    try {
      localStorage.setItem('prompteur.settings.v1', JSON.stringify(S));
      localStorage.setItem('prompteur.script.v1', text);
    } catch (e) { /* mode privé : on continue sans mémoire */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem('prompteur.settings.v1');
      if (raw) {
        var saved = JSON.parse(raw);
        Object.keys(S).forEach(function (k) {
          if (saved[k] !== undefined && saved[k] !== null) S[k] = saved[k];
        });
      }
      var t = localStorage.getItem('prompteur.script.v1');
      if (t !== null && t !== '') text = t;
    } catch (e) { /* rien de sauvé, on garde les valeurs d'origine */ }
  }

  // ===== Rendu =====

  function applySettings() {
    var sc = el.script;
    sc.textContent = text;
    sc.style.fontSize = S.size + 'px';
    sc.style.lineHeight = (S.lineHeight / 100);
    sc.style.maxWidth = S.colWidth + '%';
    sc.style.textAlign = S.align;
    sc.style.color = S.textColor;
    sc.className = 'script'
      + (S.font !== 'system' ? ' f-' + S.font : '')
      + (S.textShadow ? '' : ' no-shadow')
      + (S.bold ? '' : ' thin');

    el.veil.style.opacity = S.veilOpacity / 100;

    if (S.dimAmount > 0) {
      var a = S.dimAmount / 100;
      var p = S.linePos;
      el.dim.style.opacity = 1;
      el.dim.style.background =
        'linear-gradient(to bottom, rgba(0,0,0,' + a + ') 0%, rgba(0,0,0,0) ' +
        Math.max(2, p - 18) + '%, rgba(0,0,0,0) ' + Math.min(98, p + 18) +
        '%, rgba(0,0,0,' + a + ') 100%)';
    } else {
      el.dim.style.opacity = 0;
    }

    el.readline.className = 'readline' + (S.lineOn ? '' : ' off');
    el.readline.style.top = S.linePos + '%';
    el.readline.style.color = S.lineColor;

    el.reader.className = 'reader'
      + (S.mirrorText ? ' mirror' : '')
      + (S.flipText ? ' flip' : '');

    el.cam.className = 'cam' + (S.camMirror ? ' mirrored' : '');
    el.cam.style.opacity = S.camOpacity / 100;
    el.cam.hidden = !S.camOn;
    el.camVoid.hidden = S.camOn && !!stream;

    el.btnMirror.classList.toggle('on', S.mirrorText);

    measure();
    draw();
  }

  /** Mesure la hauteur du texte rendu et en déduit les bornes. */
  function measure() {
    contentH = el.script.offsetHeight;
    lineH = S.size * (S.lineHeight / 100);
    words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (offset > maxOffset()) offset = maxOffset();
  }

  function maxOffset() { return Math.max(0, contentH - lineH); }

  function draw() {
    var top = window.innerHeight * (S.linePos / 100);
    el.flow.style.transform = 'translate3d(0,' + (top - offset) + 'px,0)';

    var max = maxOffset();
    var progress = max > 0 ? offset / max : 0;
    el.progress.value = Math.round(progress * 1000);

    var total = S.speed > 0 ? max / S.speed : 0;
    el.tcElapsed.textContent = clock(progress * total);
    el.tcRemaining.textContent = clock(Math.max(0, total - progress * total));

    // Débit estimé : mots par pixel × pixels par seconde × 60
    var wpm = (contentH > 0 && words > 0)
      ? Math.round(words / contentH * S.speed * 60) : 0;
    el.wpm.textContent = wpm > 0 ? wpm + ' mots/min' : '--- mots/min';
  }

  function clock(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var s = Math.round(sec);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  // ===== Boucle =====

  function frame(now) {
    requestAnimationFrame(frame);

    var dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
    lastFrame = now;

    if (countdownLeft > 0) {
      countdownLeft -= dt;
      if (countdownLeft <= 0) {
        countdownLeft = 0;
        el.countdown.hidden = true;
        playing = true;
        reflectPlay();
      } else {
        var v = Math.max(1, Math.ceil(countdownLeft));
        if (el.countdownValue.textContent !== String(v)) {
          el.countdownValue.textContent = v;
          // relance l'animation du chiffre
          el.countdownValue.style.animation = 'none';
          void el.countdownValue.offsetWidth;
          el.countdownValue.style.animation = '';
        }
      }
      return;
    }

    if (!playing || !dt) return;

    offset += S.speed * dt;
    if (offset >= maxOffset()) {
      offset = maxOffset();
      playing = false;
      reflectPlay();
      showControls();
    }
    draw();
  }

  // ===== Transport =====

  function play() {
    if (playing || countdownLeft > 0) return;
    if (offset >= maxOffset()) offset = 0;
    if (S.countdownSec > 0) {
      countdownLeft = S.countdownSec;
      el.countdownValue.textContent = S.countdownSec;
      el.countdown.hidden = false;
    } else {
      playing = true;
    }
    reflectPlay();
    if (S.autoHide) scheduleHide(900);
    requestWake();
  }

  function pause() {
    playing = false;
    countdownLeft = 0;
    el.countdown.hidden = true;
    reflectPlay();
    showControls();
  }

  function toggle() { (playing || countdownLeft > 0) ? pause() : play(); }

  function reflectPlay() {
    var running = playing || countdownLeft > 0;
    el.btnPlay.classList.toggle('running', running);
    el.btnPlay.querySelector('.ico-play').hidden = running;
    el.btnPlay.querySelector('.ico-pause').hidden = !running;
  }

  function jump(lines) {
    offset = Math.max(0, Math.min(maxOffset(), offset + lines * lineH));
    draw();
  }

  function rewind() { offset = 0; pause(); draw(); }

  function setSpeed(v) {
    S.speed = Math.max(3, Math.min(200, Math.round(v)));
    el.speed.value = S.speed;
    el.speedVal.textContent = S.speed;
    draw(); save();
  }

  function setSize(v) {
    S.size = Math.max(16, Math.min(180, Math.round(v)));
    el.size.value = S.size;
    el.sizeVal.textContent = S.size;
    applySettings(); save();
  }

  // ===== Caméra =====

  function startCamera(deviceId) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast("Ce navigateur ne donne pas accès à la caméra.");
      return Promise.reject();
    }
    var constraints = deviceId
      ? { video: { deviceId: { exact: deviceId } }, audio: false }
      : { video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false };

    return navigator.mediaDevices.getUserMedia(constraints).then(function (s) {
      stopCamera();
      stream = s;
      el.cam.srcObject = s;
      el.cam.play().catch(function () { /* certains navigateurs jouent déjà */ });
      el.lampCam.classList.add('live');
      el.camVoid.hidden = true;
      S.camId = deviceId || '';
      save();
      return listCameras();
    }).catch(function (err) {
      el.lampCam.classList.remove('live');
      el.camVoid.hidden = false;
      var msg = "Caméra indisponible.";
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        msg = "Accès caméra refusé. Autorise-le dans les réglages du navigateur.";
      } else if (err && err.name === 'NotFoundError') {
        msg = "Aucune caméra détectée sur cet appareil.";
      } else if (err && err.name === 'NotReadableError') {
        msg = "La caméra est déjà utilisée par une autre application.";
      }
      toast(msg);
      throw err;
    });
  }

  function stopCamera() {
    if (!stream) return;
    stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
    el.lampCam.classList.remove('live');
  }

  function clearOptions(select) {
    while (select.firstChild) select.removeChild(select.firstChild);
  }

  function addOption(select, value, label, selected) {
    var o = document.createElement('option');
    o.value = value;
    o.textContent = label;          // libellé système : jamais interprété comme du HTML
    if (selected) o.selected = true;
    select.appendChild(o);
  }

  function listCameras() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    return navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var cams = devices.filter(function (d) { return d.kind === 'videoinput'; });
      clearOptions(el.camSelect);
      if (!cams.length) {
        addOption(el.camSelect, '', 'Aucune caméra', false);
        return;
      }
      var current = stream && stream.getVideoTracks()[0]
        ? stream.getVideoTracks()[0].getSettings().deviceId : '';
      cams.forEach(function (d, i) {
        addOption(el.camSelect, d.deviceId, d.label || ('Caméra ' + (i + 1)), d.deviceId === current);
      });
    });
  }

  // ===== Écran allumé =====

  function requestWake() {
    if (!S.wakeLock || !('wakeLock' in navigator) || wake) return;
    navigator.wakeLock.request('screen').then(function (w) {
      wake = w;
      w.addEventListener('release', function () { wake = null; });
    }).catch(function () { /* refusé ou non supporté */ });
  }

  function releaseWake() {
    if (wake) { wake.release().catch(function () {}); wake = null; }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && (playing || countdownLeft > 0)) requestWake();
  });

  // ===== Contrôles visibles =====

  function showControls() {
    controlsShown = true;
    el.hudTop.classList.remove('hidden');
    el.hudBottom.classList.remove('hidden');
    clearTimeout(hideTimer);
    if (S.autoHide && (playing || countdownLeft > 0)) scheduleHide();
  }

  function hideControls() {
    controlsShown = false;
    el.hudTop.classList.add('hidden');
    el.hudBottom.classList.add('hidden');
  }

  function scheduleHide(delay) {
    clearTimeout(hideTimer);
    if (!S.autoHide) return;
    hideTimer = setTimeout(function () {
      if (playing || countdownLeft > 0) hideControls();
    }, delay || 2600);
  }

  // ===== Panneaux =====

  function openPanel(id) {
    var p = $(id);
    if (!p) return;
    p.hidden = false;
    if (id === 'panelEditor') {
      el.editor.value = text;
      refreshStats();
      setTimeout(function () { el.editor.focus(); }, 60);
    }
  }

  function closePanel(id) {
    var p = $(id);
    if (p) p.hidden = true;
    if (id === 'panelEditor') commitText(el.editor.value);
  }

  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { closePanel(b.getAttribute('data-close')); });
  });

  function commitText(v) {
    if (v === text) return;
    text = v;
    offset = 0;
    pause();
    applySettings();
    save();
  }

  function refreshStats() {
    var v = el.editor.value.trim();
    var n = v ? v.split(/\s+/).length : 0;
    el.statWords.textContent = n + (n > 1 ? ' mots' : ' mot');
    el.statTime.textContent = clock(n / 150 * 60) + ' à 150 mots/min';
  }

  // ===== Toast =====

  var toastTimer = null;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.hidden = true; }, 3800);
  }

  // ===== Branchements =====

  function bindRange(id, key, fmt, after) {
    var input = $(id), out = $(id + 'Val');
    if (!input) return;
    input.value = S[key];
    if (out) out.textContent = fmt(S[key]);
    input.addEventListener('input', function () {
      S[key] = parseFloat(input.value);
      if (out) out.textContent = fmt(S[key]);
      (after || applySettings)();
      save();
    });
  }

  function bindCheck(id, key, after) {
    var input = $(id);
    if (!input) return;
    input.checked = !!S[key];
    input.addEventListener('change', function () {
      S[key] = input.checked;
      (after || applySettings)();
      save();
    });
  }

  function bindSelect(id, key, after) {
    var input = $(id);
    if (!input) return;
    input.value = S[key];
    input.addEventListener('change', function () {
      S[key] = input.value;
      (after || applySettings)();
      save();
    });
  }

  function bindColor(id, key) {
    var input = $(id);
    if (!input) return;
    input.value = S[key];
    input.addEventListener('input', function () {
      S[key] = input.value;
      applySettings(); save();
    });
  }

  function wire() {
    // Transport
    el.btnPlay.addEventListener('click', toggle);
    el.btnRewind.addEventListener('click', rewind);
    el.btnBack.addEventListener('click', function () { jump(-2); });
    el.btnFwd.addEventListener('click', function () { jump(2); });
    el.btnMirror.addEventListener('click', function () {
      S.mirrorText = !S.mirrorText;
      $('mirrorText').checked = S.mirrorText;
      applySettings(); save();
    });

    el.progress.addEventListener('input', function () {
      offset = (el.progress.value / 1000) * maxOffset();
      draw();
    });

    el.speed.value = S.speed; el.speedVal.textContent = S.speed;
    el.speed.addEventListener('input', function () { setSpeed(el.speed.value); });
    el.size.value = S.size; el.sizeVal.textContent = S.size;
    el.size.addEventListener('input', function () { setSize(el.size.value); });

    // Panneaux
    el.btnEditor.addEventListener('click', function () { pause(); openPanel('panelEditor'); });
    el.btnSettings.addEventListener('click', function () { openPanel('panelSettings'); });
    el.editor.addEventListener('input', refreshStats);

    el.btnPaste.addEventListener('click', function () {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        toast("Ton navigateur ne permet pas de coller ici. Utilise ⌘V ou appui long."); return;
      }
      navigator.clipboard.readText().then(function (t) {
        el.editor.value = t; refreshStats();
      }).catch(function () {
        toast("Presse-papiers refusé. Utilise ⌘V ou appui long.");
      });
    });

    el.btnClear.addEventListener('click', function () { el.editor.value = ''; refreshStats(); });

    el.fileIn.addEventListener('change', function () {
      var f = el.fileIn.files && el.fileIn.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { el.editor.value = r.result; refreshStats(); };
      r.readAsText(f);
      el.fileIn.value = '';
    });

    // Plein écran
    el.btnFull.addEventListener('click', function () {
      var d = document.documentElement;
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (d.requestFullscreen) { d.requestFullscreen().catch(function () {}); }
      else { toast("Sur iPhone, ajoute la page à l'écran d'accueil pour le vrai plein écran."); }
    });

    // Réglages
    bindSelect('camSelect', 'camId', function () { startCamera(S.camId).catch(function () {}); });
    bindCheck('camOn', 'camOn', function () {
      if (S.camOn && !stream) startCamera(S.camId).catch(function () {});
      if (!S.camOn) stopCamera();
      applySettings();
    });
    bindCheck('camMirror', 'camMirror');
    bindRange('camOpacity', 'camOpacity', function (v) { return v + ' %'; });

    bindSelect('font', 'font');
    bindCheck('bold', 'bold');
    bindRange('lineHeight', 'lineHeight', function (v) { return (v / 100).toFixed(2).replace('.', ','); });
    bindRange('colWidth', 'colWidth', function (v) { return v + ' %'; });
    bindSelect('align', 'align');
    bindColor('textColor', 'textColor');
    bindCheck('textShadow', 'textShadow');

    bindRange('veilOpacity', 'veilOpacity', function (v) { return v + ' %'; });
    bindRange('dimAmount', 'dimAmount', function (v) { return v + ' %'; });

    bindCheck('lineOn', 'lineOn');
    bindRange('linePos', 'linePos', function (v) { return v + ' %'; });
    bindColor('lineColor', 'lineColor');

    bindCheck('mirrorText', 'mirrorText');
    bindCheck('flipText', 'flipText');

    bindRange('countdownSec', 'countdownSec', function (v) { return v + ' s'; }, function () {});
    bindCheck('autoHide', 'autoHide', function () { showControls(); });
    bindCheck('wakeLock', 'wakeLock', function () {
      if (S.wakeLock) requestWake(); else releaseWake();
    });

    el.btnReset.addEventListener('click', function () {
      var keepId = S.camId;
      S = JSON.parse(JSON.stringify(DEFAULTS));
      S.camId = keepId;
      save();
      location.reload();
    });

    // Tap sur la scène : montrer ou masquer les contrôles
    el.stage.addEventListener('click', function (e) {
      if (e.target.closest('.hud') || e.target.closest('.gate')) return;
      controlsShown ? (playing || countdownLeft > 0 ? hideControls() : null) : showControls();
    });
    ['mousemove', 'touchstart'].forEach(function (ev) {
      el.stage.addEventListener(ev, function () { if (!controlsShown) showControls(); }, { passive: true });
    });

    // Clavier
    document.addEventListener('keydown', function (e) {
      if (!el.panelEditor.hidden || e.target.matches('input,textarea,select')) return;
      switch (e.key) {
        case ' ': e.preventDefault(); toggle(); break;
        case 'ArrowUp': e.preventDefault(); setSpeed(S.speed + (e.shiftKey ? 10 : 2)); break;
        case 'ArrowDown': e.preventDefault(); setSpeed(S.speed - (e.shiftKey ? 10 : 2)); break;
        case 'ArrowLeft': e.preventDefault(); jump(e.shiftKey ? -8 : -2); break;
        case 'ArrowRight': e.preventDefault(); jump(e.shiftKey ? 8 : 2); break;
        case 'Escape': pause(); break;
        case '+': case '=': setSize(S.size + 4); break;
        case '-': setSize(S.size - 4); break;
        default:
          var k = e.key.toLowerCase();
          if (k === 'r') rewind();
          else if (k === 'm') { S.mirrorText = !S.mirrorText; $('mirrorText').checked = S.mirrorText; applySettings(); save(); }
          else if (k === 'e') { pause(); openPanel('panelEditor'); }
          else if (k === 'f') el.btnFull.click();
      }
    });

    window.addEventListener('resize', function () { applySettings(); });
    window.addEventListener('orientationchange', function () { setTimeout(applySettings, 220); });

    // Porte d'entrée
    el.startCam.addEventListener('click', function () {
      startCamera(S.camId || '').then(enter).catch(enter);
    });
    el.startNoCam.addEventListener('click', function () {
      S.camOn = false;
      $('camOn').checked = false;
      save();
      enter();
    });
  }

  function enter() {
    el.gate.classList.add('gone');
    setTimeout(function () { el.gate.hidden = true; }, 520);
    applySettings();
    showControls();
  }

  // ===== Démarrage =====

  load();
  wire();
  applySettings();
  reflectPlay();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    el.gateNote.textContent =
      "Ce navigateur ne donne pas accès à la caméra. Le prompteur fonctionne quand même, sur fond noir.";
  }

  requestAnimationFrame(frame);
})();
