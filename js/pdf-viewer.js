// ===== PDF Book Viewer =====
// Uses PDF.js + StPageFlip for a book-flipping effect
// Usage: createBookViewer({ container: '#viewer', pdfUrl: 'https://...pdf' })

async function createBookViewer({ container, pdfUrl }) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  el.innerHTML = '<div class="book-loading">Chargement...</div>';

  // Load PDF
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const totalPages = pdf.numPages;

  // Build pages container
  el.innerHTML = '';
  const bookEl = document.createElement('div');
  bookEl.className = 'book-container';
  el.appendChild(bookEl);

  // Render all pages as canvases
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport: viewport
    }).promise;

    const pageDiv = document.createElement('div');
    pageDiv.className = 'book-page';
    pageDiv.appendChild(canvas);
    pages.push(pageDiv);
  }

  // Init StPageFlip
  const flipBook = new St.PageFlip(bookEl, {
    width: pages[0]?.querySelector('canvas')?.width || 400,
    height: pages[0]?.querySelector('canvas')?.height || 560,
    size: 'stretch',
    minWidth: 280,
    maxWidth: 600,
    minHeight: 400,
    maxHeight: 840,
    showCover: true,
    maxShadowOpacity: 0.3,
    mobileScrollSupport: true,
    flippingTime: 800,
    useMouseEvents: true,
  });

  flipBook.loadFromHTML(pages);

  // Navigation
  const nav = document.createElement('div');
  nav.className = 'book-nav';
  nav.innerHTML =
    '<button class="book-nav-btn book-prev">&#8592; Préc.</button>' +
    '<span class="book-page-count">1 / ' + totalPages + '</span>' +
    '<button class="book-nav-btn book-next">Suiv. &#8594;</button>';
  el.appendChild(nav);

  const countEl = nav.querySelector('.book-page-count');
  nav.querySelector('.book-prev').addEventListener('click', () => flipBook.flipPrev());
  nav.querySelector('.book-next').addEventListener('click', () => flipBook.flipNext());

  flipBook.on('flip', (e) => {
    countEl.textContent = (e.data + 1) + ' / ' + totalPages;
  });
}
