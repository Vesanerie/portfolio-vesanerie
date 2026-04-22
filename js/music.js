// ===== iPod Music Player =====
var audio = document.getElementById('audio-player');
var tracks = document.querySelectorAll('.ipod-track');
var nowPlaying = document.getElementById('now-playing');
var progressBar = document.getElementById('progress-bar');
var timeCurrent = document.getElementById('time-current');
var timeTotal = document.getElementById('time-total');
var playBtn = document.getElementById('play-btn');
var currentTrack = null;

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

tracks.forEach(function(track) {
  track.addEventListener('click', function() {
    var src = track.getAttribute('data-src');
    var title = track.getAttribute('data-title');

    // Deselect all
    tracks.forEach(function(t) { t.classList.remove('active'); });
    track.classList.add('active');

    // Load and play
    audio.src = src;
    audio.play();
    nowPlaying.textContent = title;
    currentTrack = track;
  });
});

// Play/Pause button (center of wheel)
playBtn.addEventListener('click', function() {
  if (!audio.src || !currentTrack) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

// Update progress
audio.addEventListener('timeupdate', function() {
  if (audio.duration) {
    var pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + '%';
    timeCurrent.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', function() {
  timeTotal.textContent = formatTime(audio.duration);
});

// Auto-play next track
audio.addEventListener('ended', function() {
  if (!currentTrack) return;
  var next = currentTrack.nextElementSibling;
  if (next && next.classList.contains('ipod-track')) {
    next.click();
  } else {
    nowPlaying.textContent = 'Fin de la playlist';
    tracks.forEach(function(t) { t.classList.remove('active'); });
    progressBar.style.width = '0%';
    currentTrack = null;
  }
});
