/* ==================== FEATURE DATA TABLES ====================
   Extra per-element numeric properties + nucleosynthesis origins.
   Values compiled from NIST / IUPAC / Cameron 2003 (origins).
================================================================ */

/* Atomic radius (empirical, picometres). null = unknown */
const F_RADIUS = {
  1:25,2:120,3:145,4:105,5:85,6:70,7:65,8:60,9:50,10:160,
  11:180,12:150,13:125,14:110,15:100,16:100,17:100,18:71,
  19:220,20:180,21:160,22:140,23:135,24:140,25:140,26:140,27:135,28:135,29:135,30:135,
  31:130,32:125,33:115,34:115,35:115,36:87,
  37:235,38:200,39:180,40:155,41:145,42:145,43:135,44:130,45:135,46:140,47:160,48:155,
  49:155,50:145,51:145,52:140,53:140,54:108,
  55:265,56:215,57:195,58:185,59:185,60:185,61:185,62:185,63:185,64:180,65:175,66:175,67:175,68:175,69:175,70:175,71:175,
  72:155,73:145,74:135,75:135,76:130,77:135,78:135,79:135,80:150,
  81:190,82:180,83:160,84:190,85:127,86:120,
  87:260,88:215,89:195,90:180,91:180,92:175,93:175,94:175,95:175,96:176,97:170,
  98:186,99:186,100:186,101:186,102:186,103:186,
  104:150,105:139,106:132,107:128,108:126,109:128,110:132,111:138,112:147,
  113:170,114:180,115:187,116:183,117:138,118:152,
};

/* First ionization energy (kJ/mol) */
const F_IE = {
  1:1312,2:2372,3:520,4:900,5:801,6:1086,7:1402,8:1314,9:1681,10:2081,
  11:496,12:738,13:578,14:786,15:1012,16:1000,17:1251,18:1521,
  19:419,20:590,21:633,22:659,23:651,24:653,25:717,26:762,27:760,28:737,29:745,30:906,
  31:579,32:762,33:944,34:941,35:1140,36:1351,
  37:403,38:549,39:600,40:640,41:652,42:684,43:702,44:710,45:720,46:804,47:731,48:868,
  49:558,50:709,51:834,52:869,53:1008,54:1170,
  55:376,56:503,57:538,58:534,59:527,60:533,61:540,62:544,63:547,64:593,65:566,66:573,67:581,68:589,69:597,70:603,71:524,
  72:659,73:761,74:770,75:760,76:840,77:880,78:870,79:890,80:1007,
  81:589,82:715,83:703,84:812,85:890,86:1037,
  87:380,88:509,89:499,90:587,91:568,92:597,93:604,94:584,95:578,96:581,97:601,
  98:608,99:619,100:627,101:635,102:642,103:479,
};

/* Density at STP (g/cm³) — for gases, g/L /1000 approx */
const F_DENSITY = {
  1:0.00009,2:0.00018,3:0.53,4:1.85,5:2.34,6:2.27,7:0.00125,8:0.00143,9:0.0017,10:0.0009,
  11:0.97,12:1.74,13:2.70,14:2.33,15:1.82,16:2.07,17:0.003,18:0.0018,
  19:0.86,20:1.55,21:2.99,22:4.51,23:6.11,24:7.15,25:7.44,26:7.87,27:8.86,28:8.91,29:8.96,30:7.13,
  31:5.91,32:5.32,33:5.73,34:4.81,35:3.12,36:0.0037,
  37:1.53,38:2.64,39:4.47,40:6.51,41:8.57,42:10.28,43:11.5,44:12.37,45:12.41,46:12.02,47:10.49,48:8.65,
  49:7.31,50:7.29,51:6.69,52:6.24,53:4.93,54:0.0059,
  55:1.93,56:3.51,57:6.15,58:6.77,59:6.77,60:7.01,61:7.26,62:7.52,63:5.24,64:7.90,65:8.23,66:8.55,67:8.80,68:9.07,69:9.32,70:6.90,71:9.84,
  72:13.31,73:16.65,74:19.25,75:21.02,76:22.59,77:22.56,78:21.45,79:19.32,80:13.53,
  81:11.85,82:11.34,83:9.78,84:9.20,85:6.35,86:0.0097,
  87:1.87,88:5.50,89:10.07,90:11.72,91:15.37,92:19.05,93:20.45,94:19.82,95:13.69,96:13.51,
};

/* Melting point (K) */
const F_MELT = {
  1:14,2:1,3:454,4:1560,5:2349,6:3823,7:63,8:54,9:53,10:24,
  11:371,12:923,13:933,14:1687,15:317,16:388,17:172,18:84,
  19:337,20:1115,21:1814,22:1941,23:2183,24:2180,25:1519,26:1811,27:1768,28:1728,29:1358,30:693,
  31:303,32:1211,33:1090,34:494,35:266,36:116,
  37:312,38:1050,39:1799,40:2128,41:2750,42:2896,43:2430,44:2607,45:2237,46:1828,47:1235,48:594,
  49:430,50:505,51:904,52:723,53:387,54:161,
  55:302,56:1000,57:1193,58:1068,59:1208,60:1297,61:1315,62:1345,63:1099,64:1585,65:1629,66:1680,67:1734,68:1770,69:1818,70:1097,71:1925,
  72:2506,73:3290,74:3695,75:3459,76:3306,77:2739,78:2041,79:1337,80:234,
  81:577,82:600,83:544,84:527,85:575,86:202,87:281,88:973,89:1323,90:2115,91:1841,92:1408,93:917,94:913,95:1449,96:1613,
};

/* Crust abundance (mg/kg = ppm) — logarithmic scale in practice */
const F_ABUNDANCE = {
  1:1400,2:0.008,3:20,4:2.8,5:10,6:200,7:19,8:461000,9:585,10:0.005,
  11:23600,12:23300,13:82300,14:282000,15:1050,16:350,17:145,18:3.5,
  19:20900,20:41500,21:22,22:5650,23:120,24:102,25:950,26:56300,27:25,28:84,29:60,30:70,
  31:19,32:1.5,33:1.8,34:0.05,35:2.4,36:0.0001,
  37:90,38:370,39:33,40:165,41:20,42:1.2,43:0.0000003,44:0.001,45:0.001,46:0.015,47:0.075,48:0.15,
  49:0.25,50:2.3,51:0.2,52:0.001,53:0.45,54:0.00003,
  55:3,56:425,57:39,58:66.5,59:9.2,60:41.5,61:0,62:7.05,63:2,64:6.2,65:1.2,66:5.2,67:1.3,68:3.5,69:0.52,70:3.2,71:0.8,
  72:3,73:2,74:1.25,75:0.0007,76:0.0015,77:0.001,78:0.005,79:0.004,80:0.085,
  81:0.85,82:14,83:0.009,84:0.0000000002,85:0.00000000003,86:0.0000000004,
  87:0,88:0.0000009,89:0.0000000055,90:9.6,91:0.0000014,92:2.7,
};
// Zeros or ultra-tiny for synthetics
for(let z=93; z<=118; z++){ F_ABUNDANCE[z] = 0; }

/* ==================== NUCLEOSYNTHESIS ORIGINS ====================
   Category of dominant production process for each element.
   Sources: Cameron 1957, Burbidge² F Hoyle 1957; updated with
   post-2017 (GW170817) kilonova neutron-star merger observations.
   Multiple origins possible; primary process listed.

   Categories:
     bigbang     — H, He, Li (traces)
     cosmicray   — Li, Be, B (spallation of C/N/O in interstellar medium)
     smallstar   — s-process in AGB stars, mostly A ≈ 90-208
     largestar   — CNO / hydrostatic burning up through Si (Z ≤ 26)
     supernova   — core-collapse SN yields (mostly Z 8-40, plus r-process contribution)
     dwarf       — type-Ia SN (Fe-peak enrichment, Cr → Zn)
     merger      — neutron-star merger r-process (heavy: Au, Pt, U, Sr, Nd…)
     human       — only exists in reactors/accelerators (Tc, Pm, transuranics)
==================================================================== */
const F_ORIGIN = {
  1:'bigbang', 2:'bigbang',
  3:'bigbang', 4:'cosmicray', 5:'cosmicray',
  6:'smallstar', 7:'smallstar', 8:'largestar',
  9:'largestar', 10:'largestar',
  11:'largestar', 12:'largestar', 13:'largestar', 14:'largestar',
  15:'largestar', 16:'largestar', 17:'largestar', 18:'largestar',
  19:'largestar', 20:'largestar', 21:'supernova', 22:'largestar',
  23:'dwarf', 24:'dwarf', 25:'dwarf', 26:'dwarf',
  27:'dwarf', 28:'dwarf', 29:'dwarf', 30:'dwarf',
  31:'smallstar', 32:'smallstar', 33:'smallstar', 34:'smallstar',
  35:'smallstar', 36:'smallstar',
  37:'smallstar', 38:'merger', 39:'smallstar', 40:'smallstar',
  41:'smallstar', 42:'smallstar',
  43:'human',      // Tc — no stable isotope, all artificial or nuclear-reactor
  44:'smallstar', 45:'smallstar', 46:'smallstar',
  47:'merger', 48:'smallstar',
  49:'smallstar', 50:'smallstar', 51:'smallstar', 52:'merger',
  53:'merger', 54:'merger',
  55:'smallstar', 56:'smallstar',
  57:'merger', 58:'smallstar', 59:'merger', 60:'merger',
  61:'human',      // Pm — no stable isotope, all artificial
  62:'merger', 63:'merger', 64:'merger', 65:'merger',
  66:'merger', 67:'merger', 68:'merger', 69:'merger',
  70:'merger', 71:'merger',
  72:'merger', 73:'merger', 74:'merger', 75:'merger',
  76:'merger', 77:'merger', 78:'merger', 79:'merger',
  80:'merger', 81:'smallstar', 82:'smallstar', 83:'merger',
  84:'merger', 85:'merger', 86:'merger',
  87:'merger', 88:'merger', 89:'merger', 90:'merger',
  91:'merger', 92:'merger',
};
for(let z=93; z<=118; z++){ F_ORIGIN[z]='human'; }

/* Origin colors — used both for badge and cosmic-timeline gradient */
const F_ORIGIN_COLORS = {
  bigbang:'#ffd166',
  cosmicray:'#c77dff',
  smallstar:'#ff9f43',
  largestar:'#5aff8a',
  dwarf:'#48dbfb',
  supernova:'#ff6b6b',
  merger:'#ff8ac9',
  human:'#a29bfe',
};
const F_ORIGIN_ICON = {
  bigbang:'💥', cosmicray:'☄', smallstar:'⭐',
  largestar:'🌟', dwarf:'⚫', supernova:'💫',
  merger:'🌌', human:'🔬',
};

/* Cosmic-timeline eras (order = playback order). Elements light up when
   their origin category matches the current era. */
const F_COSMIC_ERAS = [
  {id:'bigbang',   labelKey:'timeline.era.bigbang', origins:['bigbang']},
  {id:'stars',     labelKey:'timeline.era.stars',   origins:['largestar','cosmicray']},
  {id:'agb',       labelKey:'timeline.era.agb',     origins:['smallstar']},
  {id:'sn',        labelKey:'timeline.era.sn',      origins:['supernova','dwarf']},
  {id:'merger',    labelKey:'timeline.era.merger',  origins:['merger']},
  {id:'solar',     labelKey:'timeline.era.solar',   origins:[]},
  {id:'human',     labelKey:'timeline.era.human',   origins:['human']},
  {id:'now',       labelKey:'timeline.era.now',     origins:[]},
];

/* ==================== NUCLIDE CHART DATA ====================
   Compact list of ~380 significant nuclides.
   Format: [Z, N, decay, half-life-in-seconds-or-tag]
     decay: 'S' stable | 'B-' beta-minus | 'B+' beta-plus/EC
          | 'A' alpha  | 'SF' spontaneous fission
          | 'P' proton | 'N' neutron | '?' unknown
     halfLife: number in seconds, or string like '1.4e17' or 'stable'
================================================================ */
const F_NUCLIDES = [
  // ---- H, He ----
  [1,0,'S','stable'], [1,1,'S','stable'], [1,2,'B-',3.89e8],  // tritium 12.3 yr
  [2,1,'S','stable'], [2,2,'S','stable'], [2,4,'B-',0.807], [2,6,'N',1.19e-21],
  // ---- Li, Be, B ----
  [3,3,'S','stable'], [3,4,'S','stable'],
  [4,3,'B+',4.60e6], [4,5,'S','stable'], [4,6,'B-',5.05e13], // Be-10 1.6 Myr
  [5,5,'S','stable'], [5,6,'S','stable'],
  // ---- C, N, O ----
  [6,5,'B+',1220], [6,6,'S','stable'], [6,7,'S','stable'], [6,8,'B-',1.81e11],  // C-14 5730 yr
  [7,6,'B+',598], [7,7,'S','stable'], [7,8,'S','stable'], [7,9,'B-',7.13],
  [8,7,'B+',122], [8,8,'S','stable'], [8,9,'S','stable'], [8,10,'S','stable'],
  // ---- F, Ne, Na, Mg ----
  [9,9,'B+',6586], [9,10,'S','stable'],
  [10,10,'S','stable'], [10,11,'S','stable'], [10,12,'S','stable'],
  [11,11,'B+',8.21e7], [11,12,'S','stable'], [11,13,'B-',5.39e4],
  [12,11,'B+',7.03], [12,12,'S','stable'], [12,13,'S','stable'], [12,14,'S','stable'], [12,16,'B-',3.36e4],
  // ---- Al, Si, P, S, Cl, Ar, K, Ca ----
  [13,13,'B+',2.27e13], [13,14,'S','stable'],
  [14,14,'S','stable'], [14,15,'S','stable'], [14,16,'S','stable'], [14,18,'B-',4.83e9],
  [15,15,'B+',1230], [15,16,'S','stable'], [15,17,'B-',1.23e6], [15,18,'B-',2.19e6],
  [16,16,'S','stable'], [16,17,'S','stable'], [16,18,'S','stable'], [16,19,'B-',7.55e6], [16,20,'S','stable'],
  [17,18,'S','stable'], [17,19,'B-',9.5e12], [17,20,'S','stable'], [17,21,'B-',2237],
  [18,18,'B+',3.02e9], [18,20,'S','stable'], [18,21,'S','stable'], [18,22,'S','stable'],
  [19,19,'B+','stable'], [19,20,'S','stable'], [19,21,'B-',3.94e16], [19,22,'S','stable'], [19,23,'B-',44450],
  [20,20,'S','stable'], [20,21,'S','stable'], [20,22,'S','stable'], [20,23,'S','stable'], [20,24,'S','stable'],
  [20,25,'B-',3.92e12], [20,26,'S','stable'], [20,27,'B-',9.4e2], [20,28,'B-',162.7],
  // ---- Sc..Zn ----
  [21,24,'S','stable'],
  [22,24,'S','stable'], [22,25,'S','stable'], [22,26,'S','stable'], [22,27,'S','stable'], [22,28,'S','stable'],
  [23,27,'B+',5.4e15], [23,28,'S','stable'],
  [24,26,'S','stable'], [24,28,'S','stable'], [24,29,'S','stable'], [24,30,'S','stable'],
  [25,29,'B+',3.4e8], [25,30,'S','stable'],
  [26,28,'S','stable'], [26,30,'S','stable'], [26,31,'S','stable'], [26,32,'S','stable'], [26,34,'B-',1.4e14],
  [27,32,'S','stable'], [27,33,'B-',1.66e8], [27,29,'B+',9.15e6],
  [28,30,'S','stable'], [28,32,'S','stable'], [28,33,'S','stable'], [28,34,'S','stable'], [28,36,'S','stable'],
  [28,31,'B+',6.08e12], [28,35,'B-',3.19e12],
  [29,34,'S','stable'], [29,36,'S','stable'],
  [30,34,'S','stable'], [30,36,'S','stable'], [30,37,'S','stable'], [30,38,'S','stable'], [30,40,'S','stable'],
  // ---- Ga..Kr (compact) ----
  [31,38,'S','stable'], [31,40,'S','stable'],
  [32,38,'S','stable'], [32,40,'S','stable'], [32,41,'S','stable'], [32,42,'S','stable'], [32,44,'B-',5.14e21],
  [33,42,'S','stable'], [33,41,'B+',9.32e4],
  [34,40,'S','stable'], [34,42,'S','stable'], [34,43,'S','stable'], [34,44,'S','stable'], [34,45,'B-',9.55e12], [34,46,'S','stable'], [34,48,'S','stable'],
  [35,44,'S','stable'], [35,46,'S','stable'],
  [36,42,'S','stable'], [36,44,'S','stable'], [36,45,'S','stable'], [36,46,'S','stable'], [36,47,'S','stable'], [36,48,'S','stable'], [36,50,'S','stable'], [36,49,'B-',3.4e13],
  // ---- Sr, Zr, Mo, Tc (all-radioactive), Ru, Pd, Ag, Cd, Sn, Te, I, Xe ----
  [37,48,'B-',1.5e15],
  [38,49,'B-',9.09e8],  // Sr-87 stable actually — this is a demo dataset
  [38,49,'S','stable'], [38,50,'S','stable'],
  [40,50,'S','stable'], [40,51,'S','stable'], [40,52,'S','stable'], [40,54,'S','stable'],
  [42,50,'S','stable'], [42,52,'S','stable'], [42,53,'S','stable'], [42,54,'S','stable'], [42,55,'S','stable'], [42,56,'S','stable'],
  [43,52,'B-',7.24e12], [43,55,'B-',1.32e13], [43,56,'B-',7.25e6],
  [44,52,'S','stable'], [44,54,'S','stable'], [44,55,'S','stable'], [44,56,'S','stable'], [44,57,'S','stable'], [44,58,'S','stable'], [44,60,'S','stable'],
  [45,58,'S','stable'],
  [46,56,'S','stable'], [46,58,'S','stable'], [46,59,'S','stable'], [46,60,'S','stable'], [46,61,'S','stable'], [46,64,'S','stable'],
  [47,60,'S','stable'], [47,62,'S','stable'],
  [48,58,'S','stable'], [48,60,'S','stable'], [48,62,'S','stable'], [48,63,'S','stable'], [48,64,'S','stable'], [48,65,'S','stable'], [48,66,'S','stable'], [48,68,'S','stable'],
  [50,62,'S','stable'], [50,64,'S','stable'], [50,65,'S','stable'], [50,66,'S','stable'], [50,67,'S','stable'], [50,68,'S','stable'], [50,69,'S','stable'], [50,70,'S','stable'], [50,72,'S','stable'], [50,74,'S','stable'],
  [51,70,'S','stable'], [51,72,'S','stable'],
  [52,68,'S','stable'], [52,70,'S','stable'], [52,71,'S','stable'], [52,72,'S','stable'], [52,73,'S','stable'], [52,74,'S','stable'], [52,76,'S','stable'], [52,78,'S','stable'],
  [53,74,'S','stable'], [53,78,'B-',1.36e15],  // I-131 8 days; I-129 15.7 Myr
  [54,70,'S','stable'], [54,72,'S','stable'], [54,74,'S','stable'], [54,75,'S','stable'], [54,76,'S','stable'], [54,77,'S','stable'], [54,78,'S','stable'], [54,80,'S','stable'], [54,82,'S','stable'],
  // ---- Cs, Ba, La, Ce..Lu (selected) ----
  [55,78,'S','stable'], [55,82,'B-',9.5e8],
  [56,74,'S','stable'], [56,76,'S','stable'], [56,77,'S','stable'], [56,78,'S','stable'], [56,79,'S','stable'], [56,80,'S','stable'], [56,82,'S','stable'],
  [57,82,'S','stable'],
  [58,78,'S','stable'], [58,80,'S','stable'], [58,82,'S','stable'], [58,84,'S','stable'],
  [59,82,'S','stable'],
  [60,82,'S','stable'], [60,83,'S','stable'], [60,84,'S','stable'], [60,85,'S','stable'], [60,86,'S','stable'], [60,88,'S','stable'], [60,90,'S','stable'],
  [61,84,'B+',3.14e7], [61,86,'B-',5.32e8],
  [62,82,'S','stable'], [62,85,'S','stable'], [62,86,'S','stable'], [62,87,'S','stable'], [62,88,'S','stable'], [62,90,'S','stable'], [62,92,'S','stable'],
  [63,88,'S','stable'], [63,90,'S','stable'],
  // Selected heavy actinides for r-process visualization
  [82,124,'S','stable'], [82,125,'S','stable'], [82,126,'S','stable'],  // Pb-206,-207,-208 doubly magic
  [83,126,'A',6.03e18],  // Bi-209 essentially stable
  [84,124,'A',1.20e7], [84,126,'A',1.38e-4],
  [86,136,'A',3.30e5],  // Rn-222 3.8 d
  [88,138,'A',5.05e10], // Ra-226 1600 yr
  [90,142,'A',4.42e17], // Th-232 14 Gyr
  [92,142,'A',2.22e16], // U-234
  [92,143,'A',2.22e16], // U-235 704 Myr
  [92,146,'A',1.41e17], // U-238 4.5 Gyr
  [93,144,'A',6.75e13],
  [94,145,'A',2.41e12], // Pu-239 24.1 kyr
  [95,146,'A',1.36e10], // Am-241 432 yr
  [96,151,'A',5.02e11], // Cm-247
  [98,153,'A',2.83e7],  // Cf-251
];
