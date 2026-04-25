// ===== Gallery lightbox =====

var galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
var lightboxIdx = 0;
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');

export function showLightbox(idx) {
  if (idx < 0 || idx >= galleryImages.length) return;
  lightboxIdx = idx;
  lightboxImg.src = galleryImages[idx].src;
  lightboxImg.alt = galleryImages[idx].alt;
  lightbox.classList.add('open');
  lightbox.focus();
}

export function closeLightbox() {
  lightbox.classList.remove('open');
}

export function showInLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.classList.add('open');
  lightbox.focus();
}

// Click handlers on gallery images
galleryImages.forEach(function(img, i) {
  img.addEventListener('click', function() { showLightbox(i); });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (lightboxIdx < galleryImages.length - 1) showLightbox(lightboxIdx + 1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (lightboxIdx > 0) showLightbox(lightboxIdx - 1);
  } else if (e.key === 'Escape') {
    closeLightbox();
  }
});

// Close on click overlay
lightbox.addEventListener('click', function(e) {
  if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
});
