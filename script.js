document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const closeBtn = document.getElementById('closeBtn');
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const images = document.querySelectorAll('.clickable-img');

  // Menu burger
  menuBtn.onclick = () => sideMenu.classList.add('open');
  closeBtn.onclick = () => sideMenu.classList.remove('open');

  // Zoom image
  images.forEach(img => {
    img.onclick = function () {
      modal.classList.add('flex');
      modalImg.src = this.src;
    };
  });

  modal.onclick = function () {
    modal.classList.remove('flex');
    modalImg.src = '';
  };
});

    // Sinon, on ouvre la modale
    modal.classList.add('flex');
    modalImg.src = this.src;
  };
});

  // Empêche la fermeture si on clique sur l'image elle-même
  modalImg.onclick = (e) => e.stopPropagation();

  // Fermeture du modal au clic en dehors de l'image
  modal.onclick = () => {
    modal.classList.remove('flex');
    modalImg.src = '';
  };

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (sideMenu.classList.contains('open')) {
      sideMenu.classList.remove('open');
    }
    if (window.getComputedStyle(modal).display !== 'none') {
      modal.classList.remove('flex');
      modalImg.src = '';
    }
  }
})