// ===== 3D tilt on pile items (desktop only) =====

if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.pile-book, .pile-phone, .pile-folder, .pile-film').forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'none';
    });
    card.addEventListener('mousemove', function(e) {
      var rect = this.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rotY = (x - 0.5) * 16;
      var rotX = (0.5 - y) * 16;
      this.style.transform = 'rotate(0deg) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(8px)';
      this.style.setProperty('--mx', (x * 100) + '%');
      this.style.setProperty('--my', (y * 100) + '%');
    });
    card.addEventListener('mouseleave', function() {
      this.style.transition = '';
      this.style.transform = '';
    });
  });
}

// ===== Scroll reveal on pile items =====
(function() {
  var items = document.querySelectorAll('#pile-stack > *');
  if (!items.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var idx = Array.prototype.indexOf.call(items, entry.target);
        entry.target.style.transitionDelay = (idx * 0.08) + 's';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(function(el) {
    el.classList.add('pile-reveal');
    observer.observe(el);
  });
})();
