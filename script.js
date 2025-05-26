<<<<<<< HEAD
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
  img.onclick = function (e) {
    // Si l'image est dans un lien (<a>), on ne fait rien
    if (this.closest('a')) return;

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
});

=======
// Ici rien de particulier pour l’instant,
// mais tu peux ajouter des interactions si tu veux
console.log("Portfolio chargé.");
>>>>>>> f439231 (Premier commit portfolio Vesanerie)
