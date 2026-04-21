// ===== Bureau → Site =====
var desktop = document.getElementById('desktop');
var siteView = document.getElementById('site-view');
var siteIframe = document.getElementById('site-iframe');
var siteUrl = document.getElementById('site-url');
var siteBack = document.getElementById('site-back');

// Ouvrir un projet
document.querySelectorAll('.app-icon').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var url = this.dataset.url;
    siteIframe.src = url;
    siteUrl.textContent = url;
    desktop.style.display = 'none';
    siteView.classList.remove('hidden');
  });
});

// Retour au bureau
siteBack.addEventListener('click', function() {
  siteView.classList.add('hidden');
  desktop.style.display = '';
  siteIframe.src = '';
});
