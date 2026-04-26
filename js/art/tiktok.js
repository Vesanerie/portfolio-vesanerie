// ===== TikTok video scroll counter + arrows =====

var tiktokScroll = document.querySelector('.tiktok-scroll');
var tiktokCounter = document.getElementById('tiktok-counter');
var tiktokUp = document.getElementById('tiktok-up');
var tiktokDown = document.getElementById('tiktok-down');

if (tiktokScroll && tiktokCounter) {
  var tiktokWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
  var tiktokTotal = tiktokWraps.length;
  function getItemH() { return tiktokWraps[0] ? tiktokWraps[0].offsetHeight : 580; }
  var itemH = getItemH();
  window.addEventListener('resize', function() { itemH = getItemH(); });
  var currentTiktok = 0;

  function playCurrentVideo() {
    tiktokWraps.forEach(function(wrap, i) {
      var video = wrap.querySelector('video');
      if (!video) return;
      if (i === currentTiktok) {
        if (!video.src && video.dataset.src) video.src = video.dataset.src;
        video.play().catch(function(){});
      } else {
        video.pause();
      }
    });
  }

  var tiktokScrollTimer = null;
  tiktokScroll.addEventListener('scroll', function() {
    if (tiktokScrollTimer) return;
    tiktokScrollTimer = setTimeout(function() {
      tiktokScrollTimer = null;
      var idx = Math.floor(tiktokScroll.scrollTop / itemH);
      tiktokCounter.textContent = (idx + 1) + ' / ' + tiktokTotal;
      if (idx !== currentTiktok) {
        currentTiktok = idx;
        playCurrentVideo();
      }
    }, 100);
  }, { passive: true });

  tiktokUp.addEventListener('click', function() {
    itemH = getItemH();
    var idx = Math.floor(tiktokScroll.scrollTop / itemH);
    if (idx > 0) tiktokScroll.scrollTo({ top: (idx - 1) * itemH, behavior: 'smooth' });
  });

  tiktokDown.addEventListener('click', function() {
    itemH = getItemH();
    var idx = Math.floor(tiktokScroll.scrollTop / itemH);
    if (idx < tiktokTotal - 1) tiktokScroll.scrollTo({ top: (idx + 1) * itemH, behavior: 'smooth' });
  });
}
