// ===== Fiches projet art =====

var artProjects = {
  'culture-hot':      { format: 'Magazine A4, 48 pages',       date: '2025', intent: 'Magazine culturel trimestriel — musique, art, cinema' },
  'memoire-clown':    { format: 'Hors-serie A4',               date: '2025', intent: 'Essai illustre sur la figure du clown' },
  'random-zine':      { format: 'Fanzine A5, 30 exemplaires',  date: '2026', intent: 'Bande dessinee independante' },
  'spirale-sket-tour':{ format: 'Fanzine A5, 30 exemplaires',  date: '2026', intent: 'Carnet de croquis de voyage' },
  'sauce':            { format: 'Zine A6',                     date: '2026', intent: 'Recueil de recettes de sauces maison' },
  'rk-brand':         { format: 'Brand book paysage',          date: '2026', intent: 'Identite visuelle pour un charpentier a Perth' },
  'magnificat':       { format: 'Illustration numerique',      date: '2026', intent: 'Cover remix Vald pour SoundCloud' },
  'flyer-perth':      { format: 'Affiche A3',                  date: '2026', intent: 'Flyer pour Perth Draw Club — appel a artistes' },
  'carnet-rose':      { format: 'Carnet PDF, pages libres',    date: '2024', intent: 'Carnet de recherche — croquis et essais' },
  'carnet-rouge':     { format: 'Carnet PDF, pages libres',    date: '2025', intent: 'Carnet de recherche — explorations graphiques' },
  'carnet-jaune':     { format: 'Carnet PDF, pages libres',    date: '2025', intent: 'Carnet de recherche — etudes de couleur' },
  'voiture':          { format: 'Illustration PDF',            date: '2026', intent: 'Planche illustration automobile' }
};

var artFiche = document.getElementById('art-fiche');
var artFicheTitle = document.getElementById('art-fiche-title');
var artFicheFormat = document.getElementById('art-fiche-format');
var artFicheDate = document.getElementById('art-fiche-date');
var artFicheIntent = document.getElementById('art-fiche-intent');

export function showArtFiche(bookId, title) {
  var info = artProjects[bookId];
  if (!info) return false;
  artFicheTitle.textContent = title;
  artFicheFormat.textContent = info.format;
  artFicheDate.textContent = info.date;
  artFicheIntent.textContent = info.intent;
  artFiche.classList.add('open');
  return true;
}

export function hideArtFiche() {
  artFiche.classList.remove('open');
}
