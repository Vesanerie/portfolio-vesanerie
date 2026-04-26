// ===== TikTok infinite scroll + arrows =====

var tiktokScroll = document.querySelector('.tiktok-scroll');
var tiktokCounter = document.getElementById('tiktok-counter');
var tiktokUp = document.getElementById('tiktok-up');
var tiktokDown = document.getElementById('tiktok-down');

if (tiktokScroll && tiktokCounter) {
  var originalWraps = Array.from(tiktokScroll.querySelectorAll('.tiktok-embed-wrap'));
  var tiktokTotal = originalWraps.length;
  function getItemH() { return tiktokScroll.querySelector('.tiktok-embed-wrap') ? tiktokScroll.querySelector('.tiktok-embed-wrap').offsetHeight : 580; }
  var itemH = getItemH();
  window.addEventListener('resize', function() { itemH = getItemH(); });
  var currentTiktok = 0;

  function getCurrentIndex() {
    return Math.round(tiktokScroll.scrollTop / itemH);
  }

  function getDisplayIndex(idx) {
    return ((idx % tiktokTotal) + tiktokTotal) % tiktokTotal;
  }

  function ensureWraps() {
    var allWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
    var idx = getCurrentIndex();
    var needed = idx + 4;
    if (allWraps.length < needed) {
      for (var i = allWraps.length; i < needed; i++) {
        var srcIdx = i % tiktokTotal;
        var clone = originalWraps[srcIdx].cloneNode(true);
        var video = clone.querySelector('video');
        if (video) {
          video.removeAttribute('src');
          video.pause();
        }
        tiktokScroll.appendChild(clone);
      }
    }
  }

  function playCurrentVideo() {
    var allWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
    var idx = getCurrentIndex();
    allWraps.forEach(function(wrap, i) {
      var video = wrap.querySelector('video');
      if (!video) return;
      if (i === idx) {
        if (!video.src && video.dataset.src) video.src = video.dataset.src;
        video.muted = false;
        video.play().catch(function(){});
      } else {
        video.muted = true;
        video.pause();
      }
    });
  }

  var tiktokScrollTimer = null;
  tiktokScroll.addEventListener('scroll', function() {
    if (tiktokScrollTimer) return;
    tiktokScrollTimer = setTimeout(function() {
      tiktokScrollTimer = null;
      var idx = getCurrentIndex();
      var display = getDisplayIndex(idx);
      tiktokCounter.textContent = (display + 1) + ' / ' + tiktokTotal;
      ensureWraps();
      if (idx !== currentTiktok) {
        currentTiktok = idx;
        playCurrentVideo();
      }
    }, 100);
  }, { passive: true });

  tiktokUp.addEventListener('click', function() {
    itemH = getItemH();
    var idx = getCurrentIndex();
    if (idx > 0) tiktokScroll.scrollTo({ top: (idx - 1) * itemH, behavior: 'smooth' });
  });

  tiktokDown.addEventListener('click', function() {
    itemH = getItemH();
    var idx = getCurrentIndex();
    ensureWraps();
    tiktokScroll.scrollTo({ top: (idx + 1) * itemH, behavior: 'smooth' });
  });
}
