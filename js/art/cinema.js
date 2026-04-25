// ===== Cinema mode (Animation) =====

var cinemaScreen = document.querySelector('.cinema-screen');
var cinemaLabel = document.getElementById('cinema-label');
var cinemaPlaceholder = document.getElementById('cinema-placeholder');
var cinemaThumbs = document.querySelectorAll('.cinema-thumb');
var cinemaCounter = document.querySelector('.cinema-counter');

function cinemaPlay(ytId) {
  if (!cinemaScreen) return;
  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1';
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', 'Video YouTube');
  cinemaScreen.innerHTML = '';
  cinemaScreen.appendChild(iframe);
}

function cinemaPlayVideo(src) {
  if (!cinemaScreen) return;
  var video = document.createElement('video');
  video.src = src;
  video.controls = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  cinemaScreen.innerHTML = '';
  cinemaScreen.appendChild(video);
}

function cinemaSelect(index) {
  var thumb = cinemaThumbs[index];
  if (!thumb) return;
  cinemaThumbs.forEach(function(t) { t.classList.remove('active'); });
  thumb.classList.add('active');
  cinemaLabel.textContent = thumb.dataset.label;
  if (cinemaCounter) cinemaCounter.textContent = (index + 1) + ' / ' + cinemaThumbs.length;
  thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  if (thumb.dataset.yt) {
    cinemaPlay(thumb.dataset.yt);
  } else if (thumb.dataset.video) {
    cinemaPlayVideo(thumb.dataset.video);
  }
}

function cinemaActiveIndex() {
  var active = document.querySelector('.cinema-thumb.active');
  return Array.prototype.indexOf.call(cinemaThumbs, active);
}

// Placeholder click
if (cinemaPlaceholder) {
  cinemaPlaceholder.addEventListener('click', function() {
    var activeThumb = document.querySelector('.cinema-thumb.active');
    if (activeThumb && activeThumb.dataset.yt) {
      cinemaPlay(activeThumb.dataset.yt);
    }
  });
}

// Thumb click handlers
cinemaThumbs.forEach(function(thumb, i) {
  thumb.addEventListener('click', function() { cinemaSelect(i); });
});

// Arrow navigation
var arrowLeft = document.querySelector('.cinema-arrow-left');
var arrowRight = document.querySelector('.cinema-arrow-right');
if (arrowLeft) arrowLeft.addEventListener('click', function() {
  var i = cinemaActiveIndex();
  cinemaSelect(i > 0 ? i - 1 : cinemaThumbs.length - 1);
});
if (arrowRight) arrowRight.addEventListener('click', function() {
  var i = cinemaActiveIndex();
  cinemaSelect(i < cinemaThumbs.length - 1 ? i + 1 : 0);
});

// Keyboard navigation when cinema is visible
document.addEventListener('keydown', function(e) {
  var animView = document.getElementById('animation-view');
  if (!animView || animView.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    var i = cinemaActiveIndex();
    cinemaSelect(i < cinemaThumbs.length - 1 ? i + 1 : 0);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    var i = cinemaActiveIndex();
    cinemaSelect(i > 0 ? i - 1 : cinemaThumbs.length - 1);
  }
});
