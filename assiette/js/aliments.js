/* aliments.js
 * Base d'aliments, valeurs pour 100 g (source : Ciqual / USDA, arrondies).
 * Format : { n: nom, k: kcal, p: proteines, l: lipides, g: glucides, c: categorie, u: unites }
 * u = unites pratiques : [["libelle", grammes], ...]
 * Volontairement sans poisson ni fruits de mer.
 * Attention : "cru" et "cuit" ne sont PAS interchangeables, surtout riz et pates.
 */

const ALIMENTS = [
  // --- Laitiers ---
  { n: 'Yaourt grec 2%', k: 73, p: 9.9, l: 1.9, g: 3.9, c: 'laitier', u: [['pot 150 g', 150], ['bol 250 g', 250]] },
  { n: 'Yaourt grec 0%', k: 59, p: 10.3, l: 0.4, g: 3.6, c: 'laitier', u: [['pot 150 g', 150]] },
  { n: 'Fromage blanc 0%', k: 47, p: 8, l: 0.2, g: 4, c: 'laitier', u: [['pot 200 g', 200]] },
  { n: 'Skyr', k: 63, p: 11, l: 0.2, g: 4, c: 'laitier', u: [['pot 150 g', 150]] },
  { n: 'Cottage cheese', k: 98, p: 11, l: 4.3, g: 3.4, c: 'laitier' },
  { n: 'Feta', k: 264, p: 14, l: 21, g: 4, c: 'laitier', u: [['tranche 30 g', 30]] },
  { n: 'Halloumi', k: 320, p: 22, l: 25, g: 2, c: 'laitier', u: [['tranche 40 g', 40]] },
  { n: 'Mozzarella', k: 254, p: 18, l: 19, g: 2, c: 'laitier' },
  { n: 'Parmesan', k: 392, p: 36, l: 27, g: 3, c: 'laitier', u: [['c.a.s 8 g', 8]] },
  { n: 'Emmental', k: 380, p: 28, l: 29, g: 1, c: 'laitier' },
  { n: 'Lait demi-ecreme', k: 46, p: 3.3, l: 1.6, g: 4.8, c: 'laitier', u: [['verre 200 ml', 200]] },
  { n: 'Whey (poudre)', k: 400, p: 80, l: 6, g: 6, c: 'laitier', u: [['dose 30 g', 30]] },

  // --- Viandes, oeufs ---
  { n: 'Blanc de poulet cru', k: 110, p: 23, l: 1.5, g: 0, c: 'viande' },
  { n: 'Blanc de poulet grille', k: 165, p: 31, l: 3.6, g: 0, c: 'viande', u: [['portion 150 g', 150]] },
  { n: 'Cuisse de poulet sans peau, cuite', k: 180, p: 26, l: 8, g: 0, c: 'viande' },
  { n: 'Escalope de dinde crue', k: 105, p: 23, l: 1.2, g: 0, c: 'viande' },
  { n: 'Viande hachee boeuf 5% cuite', k: 170, p: 26, l: 7, g: 0, c: 'viande' },
  { n: 'Viande hachee boeuf 15% crue', k: 215, p: 19, l: 15, g: 0, c: 'viande' },
  { n: 'Steak de boeuf maigre cuit', k: 190, p: 30, l: 7.5, g: 0, c: 'viande' },
  { n: 'Filet mignon de porc cuit', k: 165, p: 28, l: 5.5, g: 0, c: 'viande' },
  { n: 'Agneau cuit', k: 250, p: 26, l: 16, g: 0, c: 'viande' },
  { n: 'Jambon blanc', k: 110, p: 19, l: 3.5, g: 1, c: 'viande', u: [['tranche 40 g', 40]] },
  { n: 'Oeuf entier', k: 143, p: 12.6, l: 9.5, g: 0.7, c: 'viande', u: [['oeuf moyen', 55], ['gros oeuf', 65]] },
  { n: 'Blanc d\'oeuf', k: 52, p: 11, l: 0.2, g: 0.7, c: 'viande', u: [['blanc', 33]] },

  // --- Feculents ---
  { n: 'Riz blanc cru', k: 350, p: 7, l: 0.6, g: 78, c: 'feculent' },
  { n: 'Riz blanc cuit', k: 130, p: 2.7, l: 0.3, g: 28, c: 'feculent', u: [['bol 200 g', 200]] },
  { n: 'Riz complet cuit', k: 123, p: 2.7, l: 1, g: 25.6, c: 'feculent', u: [['bol 200 g', 200]] },
  { n: 'Pates seches', k: 355, p: 12.5, l: 1.5, g: 71, c: 'feculent', u: [['portion 80 g', 80]] },
  { n: 'Pates cuites', k: 158, p: 5.8, l: 0.9, g: 31, c: 'feculent', u: [['assiette 250 g', 250]] },
  { n: 'Pain complet', k: 250, p: 9, l: 3, g: 43, c: 'feculent', u: [['tranche 35 g', 35]] },
  { n: 'Baguette / pain blanc', k: 270, p: 8.5, l: 1.5, g: 55, c: 'feculent', u: [['demi-baguette 125 g', 125]] },
  { n: 'Pita grecque', k: 275, p: 9, l: 3, g: 51, c: 'feculent', u: [['pita 60 g', 60]] },
  { n: 'Flocons d\'avoine', k: 375, p: 13, l: 7, g: 60, c: 'feculent', u: [['portion 40 g', 40]] },
  { n: 'Pomme de terre cuite', k: 87, p: 2, l: 0.1, g: 19, c: 'feculent' },
  { n: 'Patate douce cuite', k: 90, p: 2, l: 0.1, g: 20, c: 'feculent' },
  { n: 'Quinoa cuit', k: 120, p: 4.4, l: 1.9, g: 21, c: 'feculent' },
  { n: 'Semoule / couscous cuit', k: 112, p: 3.8, l: 0.2, g: 23, c: 'feculent' },
  { n: 'Boulgour cuit', k: 83, p: 3, l: 0.2, g: 19, c: 'feculent' },

  // --- Legumineuses ---
  { n: 'Lentilles cuites', k: 116, p: 9, l: 0.4, g: 20, c: 'legumineuse' },
  { n: 'Pois chiches cuits (revithia)', k: 164, p: 8.9, l: 2.6, g: 27, c: 'legumineuse' },
  { n: 'Haricots blancs cuits (fasolada)', k: 130, p: 8.7, l: 0.5, g: 23, c: 'legumineuse' },
  { n: 'Gigantes (haricots geants)', k: 135, p: 8.5, l: 1.5, g: 23, c: 'legumineuse' },
  { n: 'Houmous', k: 170, p: 8, l: 10, g: 14, c: 'legumineuse', u: [['c.a.s 25 g', 25]] },
  { n: 'Tofu ferme', k: 145, p: 16, l: 9, g: 3, c: 'legumineuse' },
  { n: 'Tempeh', k: 190, p: 19, l: 11, g: 9, c: 'legumineuse' },
  { n: 'Seitan', k: 145, p: 25, l: 2, g: 6, c: 'legumineuse' },

  // --- Legumes ---
  { n: 'Tomate', k: 18, p: 0.9, l: 0.2, g: 3.9, c: 'legume', u: [['tomate moyenne', 120]] },
  { n: 'Concombre', k: 15, p: 0.7, l: 0.1, g: 3.6, c: 'legume' },
  { n: 'Courgette', k: 17, p: 1.2, l: 0.3, g: 3.1, c: 'legume' },
  { n: 'Aubergine cuite', k: 35, p: 0.8, l: 0.2, g: 8.7, c: 'legume' },
  { n: 'Poivron', k: 27, p: 1, l: 0.3, g: 6, c: 'legume' },
  { n: 'Brocoli cuit', k: 35, p: 2.4, l: 0.4, g: 7, c: 'legume' },
  { n: 'Epinards cuits', k: 23, p: 3, l: 0.4, g: 3.8, c: 'legume' },
  { n: 'Horta (verdure grecque)', k: 30, p: 3, l: 0.4, g: 4, c: 'legume' },
  { n: 'Haricots verts', k: 31, p: 1.8, l: 0.1, g: 7, c: 'legume' },
  { n: 'Carotte', k: 41, p: 0.9, l: 0.2, g: 9.6, c: 'legume' },
  { n: 'Oignon', k: 40, p: 1.1, l: 0.1, g: 9, c: 'legume' },
  { n: 'Salade verte', k: 15, p: 1.4, l: 0.2, g: 2.9, c: 'legume' },
  { n: 'Champignons', k: 22, p: 3.1, l: 0.3, g: 3.3, c: 'legume' },

  // --- Fruits ---
  { n: 'Pomme', k: 52, p: 0.3, l: 0.2, g: 14, c: 'fruit', u: [['pomme moyenne', 180]] },
  { n: 'Banane', k: 89, p: 1.1, l: 0.3, g: 23, c: 'fruit', u: [['banane moyenne', 120]] },
  { n: 'Pasteque', k: 30, p: 0.6, l: 0.2, g: 7.6, c: 'fruit', u: [['part 300 g', 300]] },
  { n: 'Melon', k: 34, p: 0.8, l: 0.2, g: 8, c: 'fruit' },
  { n: 'Orange', k: 47, p: 0.9, l: 0.1, g: 12, c: 'fruit', u: [['orange moyenne', 150]] },
  { n: 'Raisin', k: 69, p: 0.7, l: 0.2, g: 18, c: 'fruit' },
  { n: 'Peche', k: 39, p: 0.9, l: 0.3, g: 10, c: 'fruit' },
  { n: 'Figue fraiche', k: 74, p: 0.8, l: 0.3, g: 19, c: 'fruit', u: [['figue', 50]] },
  { n: 'Fraise', k: 32, p: 0.7, l: 0.3, g: 7.7, c: 'fruit' },
  { n: 'Myrtille', k: 57, p: 0.7, l: 0.3, g: 14, c: 'fruit' },
  { n: 'Kiwi', k: 61, p: 1.1, l: 0.5, g: 15, c: 'fruit', u: [['kiwi', 75]] },

  // --- Gras et oleagineux ---
  { n: 'Huile d\'olive', k: 900, p: 0, l: 100, g: 0, c: 'gras', u: [['c.a.s 10 g', 10], ['c.a.c 5 g', 5]] },
  { n: 'Huile de colza', k: 900, p: 0, l: 100, g: 0, c: 'gras', u: [['c.a.s 10 g', 10]] },
  { n: 'Beurre', k: 745, p: 0.7, l: 82, g: 0.6, c: 'gras', u: [['noisette 10 g', 10]] },
  { n: 'Noix', k: 654, p: 15, l: 65, g: 14, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Amandes', k: 579, p: 21, l: 50, g: 22, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Noix de cajou', k: 553, p: 18, l: 44, g: 30, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Cacahuetes', k: 567, p: 26, l: 49, g: 16, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Beurre de cacahuete', k: 588, p: 25, l: 50, g: 20, c: 'gras', u: [['c.a.s 16 g', 16]] },
  { n: 'Graines de lin moulues', k: 534, p: 18, l: 42, g: 29, c: 'gras', u: [['c.a.s 10 g', 10]] },
  { n: 'Graines de chia', k: 486, p: 17, l: 31, g: 42, c: 'gras', u: [['c.a.s 12 g', 12]] },
  { n: 'Tahini', k: 595, p: 17, l: 54, g: 21, c: 'gras', u: [['c.a.s 15 g', 15]] },
  { n: 'Avocat', k: 160, p: 2, l: 15, g: 9, c: 'gras', u: [['demi avocat', 100]] },
  { n: 'Olives noires', k: 145, p: 1, l: 15, g: 4, c: 'gras', u: [['10 olives', 40]] },

  // --- Plats grecs ---
  { n: 'Souvlaki poulet', k: 175, p: 27, l: 7, g: 0, c: 'grec', u: [['brochette 100 g', 100]] },
  { n: 'Gyros porc', k: 215, p: 20, l: 15, g: 0, c: 'grec' },
  { n: 'Tzatziki', k: 120, p: 3.5, l: 10, g: 3.5, c: 'grec', u: [['c.a.s 25 g', 25]] },
  { n: 'Spanakopita', k: 250, p: 7, l: 16, g: 19, c: 'grec', u: [['part 150 g', 150]] },
  { n: 'Dolmades', k: 165, p: 3, l: 8, g: 20, c: 'grec' },
  { n: 'Salade grecque (horiatiki)', k: 105, p: 3, l: 8.5, g: 4.5, c: 'grec', u: [['assiette 300 g', 300]] },

  // --- Les pieges (logge-les quand meme, c'est le but) ---
  { n: 'Chips', k: 536, p: 6.6, l: 34, g: 53, c: 'piege', u: [['petit paquet 45 g', 45], ['gros paquet 150 g', 150]] },
  { n: 'Frites', k: 312, p: 3.4, l: 15, g: 41, c: 'piege', u: [['portion 150 g', 150]] },
  { n: 'Chocolat noir 70%', k: 550, p: 8, l: 40, g: 34, c: 'piege', u: [['carre 10 g', 10]] },
  { n: 'Chocolat au lait', k: 535, p: 7.6, l: 30, g: 59, c: 'piege', u: [['carre 10 g', 10]] },
  { n: 'Glace vanille', k: 207, p: 3.5, l: 11, g: 24, c: 'piege', u: [['boule 60 g', 60]] },
  { n: 'Baklava', k: 430, p: 6, l: 24, g: 48, c: 'piege', u: [['part 60 g', 60]] },
  { n: 'Biere', k: 43, p: 0.5, l: 0, g: 3.6, c: 'piege', u: [['canette 330 ml', 330], ['pinte 500 ml', 500]] },
  { n: 'Vin rouge', k: 85, p: 0.1, l: 0, g: 2.6, c: 'piege', u: [['verre 125 ml', 125]] },
  { n: 'Coca / soda', k: 42, p: 0, l: 0, g: 10.6, c: 'piege', u: [['canette 330 ml', 330]] },
  { n: 'Miel', k: 304, p: 0.3, l: 0, g: 82, c: 'piege', u: [['c.a.c 7 g', 7]] },
  { n: 'Sucre', k: 400, p: 0, l: 0, g: 100, c: 'piege', u: [['morceau 5 g', 5]] },

  // --- Divers ---
  { n: 'Cafe noir', k: 2, p: 0.1, l: 0, g: 0, c: 'divers', u: [['tasse', 100]] },
  { n: 'The / infusion', k: 1, p: 0, l: 0, g: 0, c: 'divers', u: [['tasse', 200]] },
  { n: 'Sauce tomate nature', k: 35, p: 1.5, l: 0.5, g: 6, c: 'divers', u: [['louche 100 g', 100]] },
  { n: 'Ketchup', k: 110, p: 1.2, l: 0.2, g: 25, c: 'divers', u: [['c.a.s 15 g', 15]] },
  { n: 'Mayonnaise', k: 680, p: 1, l: 75, g: 1.5, c: 'divers', u: [['c.a.s 13 g', 13]] },
];

const CATEGORIES = {
  laitier: 'Laitiers',
  viande: 'Viandes, oeufs',
  feculent: 'Feculents',
  legumineuse: 'Legumineuses',
  legume: 'Legumes',
  fruit: 'Fruits',
  gras: 'Gras, oleagineux',
  grec: 'Plats grecs',
  piege: 'Pieges',
  divers: 'Divers',
  perso: 'Mes aliments',
};
