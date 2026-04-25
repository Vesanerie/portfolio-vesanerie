// ===== PDF Book Viewer =====

export async function loadPdfAsBook(url, container, forceSingle) {
  try {
    var pdf = await pdfjsLib.getDocument(url).promise;
    var numPages = pdf.numPages;

    var pdfPages = new Array(numPages).fill(null);
    async function renderPage(idx) {
      if (pdfPages[idx]) return pdfPages[idx];
      var page = await pdf.getPage(idx + 1);
      var scale = window.innerWidth <= 700 ? 1 : 1.5;
      var viewport = page.getViewport({ scale: scale });
      var canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }).promise;
      pdfPages[idx] = canvas;
      return canvas;
    }

    // Render first page immediately
    await renderPage(0);

    // Build fullscreen viewer
    container.innerHTML = '';
    var viewer = document.createElement('div');
    viewer.className = 'pdf-reader';
    viewer.setAttribute('role', 'document');
    viewer.setAttribute('aria-label', 'Lecteur PDF');
    container.appendChild(viewer);

    var display = document.createElement('div');
    display.className = 'pdf-display';
    viewer.appendChild(display);

    // Click zones
    var zoneLeft = document.createElement('div');
    zoneLeft.className = 'pdf-zone pdf-zone-left';
    zoneLeft.setAttribute('role', 'button');
    zoneLeft.setAttribute('aria-label', 'Page precedente');
    display.appendChild(zoneLeft);

    var zoneRight = document.createElement('div');
    zoneRight.className = 'pdf-zone pdf-zone-right';
    zoneRight.setAttribute('role', 'button');
    zoneRight.setAttribute('aria-label', 'Page suivante');
    display.appendChild(zoneRight);

    // Page counter
    var counter = document.createElement('div');
    counter.className = 'pdf-counter';
    counter.setAttribute('aria-live', 'polite');
    container.appendChild(counter);

    // Detect if pages are landscape (already double-page spreads)
    var firstCanvas = pdfPages[0];
    var isLandscape = firstCanvas.width > firstCanvas.height;
    var isMobile = window.innerWidth <= 700;

    // Build spreads
    var spreads = [];
    if (isLandscape || forceSingle || isMobile) {
      for (var s = 0; s < numPages; s++) {
        spreads.push([s]);
      }
    } else {
      spreads.push([0]);
      for (var s = 1; s < numPages; s += 2) {
        if (s + 1 < numPages) {
          spreads.push([s, s + 1]);
        } else {
          spreads.push([s]);
        }
      }
    }

    var currentSpread = 0;

    function copyCanvas(source) {
      var copy = document.createElement('canvas');
      copy.width = source.width;
      copy.height = source.height;
      copy.getContext('2d').drawImage(source, 0, 0);
      return copy;
    }

    function buildSpreadEl(spread, canvases) {
      var spreadDiv = document.createElement('div');
      spreadDiv.className = spread.length === 1 ? 'pdf-spread pdf-spread-single' : 'pdf-spread';
      spreadDiv.appendChild(copyCanvas(canvases[0]));
      if (canvases.length === 2) {
        var spine = document.createElement('div');
        spine.className = 'pdf-spine';
        spreadDiv.appendChild(spine);
        spreadDiv.appendChild(copyCanvas(canvases[1]));
      }
      return spreadDiv;
    }

    async function loadSpreadCanvases(idx) {
      var spread = spreads[idx];
      var canvases = [];
      for (var i = 0; i < spread.length; i++) {
        canvases.push(await renderPage(spread[i]));
      }
      return canvases;
    }

    async function showSpread(idx) {
      if (idx < 0 || idx >= spreads.length) return;

      var newCanvases = await loadSpreadCanvases(idx);

      // Preload neighbors
      if (idx + 1 < spreads.length) loadSpreadCanvases(idx + 1);
      if (idx - 1 >= 0) loadSpreadCanvases(idx - 1);

      display.querySelectorAll('.pdf-page-wrapper').forEach(function(w) { w.remove(); });
      var wrapper = document.createElement('div');
      wrapper.className = 'pdf-page-wrapper';
      wrapper.appendChild(buildSpreadEl(spreads[idx], newCanvases));
      display.insertBefore(wrapper, display.firstChild);

      currentSpread = idx;

      var spread = spreads[idx];
      var first = spread[0] + 1;
      var last = spread[spread.length - 1] + 1;
      counter.textContent = (first === last ? first : first + '-' + last) + ' / ' + numPages;
    }

    showSpread(0);

    zoneLeft.addEventListener('click', function(e) {
      e.stopPropagation();
      if (currentSpread > 0) showSpread(currentSpread - 1);
    });

    zoneRight.addEventListener('click', function(e) {
      e.stopPropagation();
      if (currentSpread < spreads.length - 1) showSpread(currentSpread + 1);
    });

    container._keyHandler = function(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentSpread < spreads.length - 1) showSpread(currentSpread + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSpread > 0) showSpread(currentSpread - 1);
      }
    };
    document.addEventListener('keydown', container._keyHandler);

    var startX = 0;
    container._touchStart = function(e) {
      startX = e.touches[0].clientX;
    };
    container._touchEnd = function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSpread < spreads.length - 1) showSpread(currentSpread + 1);
        else if (diff < 0 && currentSpread > 0) showSpread(currentSpread - 1);
      }
    };
    display.addEventListener('touchstart', container._touchStart, { passive: true });
    display.addEventListener('touchend', container._touchEnd, { passive: true });

  } catch (err) {
    container.innerHTML = '<div class="book-loading">Erreur de chargement du PDF</div>';
    console.error(err);
  }
}
