/* ================ ELEMENT DATA ================
   Compact table for all 118 elements + rich extended data for common ones.
   Categories: alkali | alkaline | transition | posttransition | metalloid |
               nonmetal | halogen | noble | lanthanide | actinide | unknown
   Group: 1..18 (main groups 1,2,13..18; sub-groups 3..12); lanthanides/actinides = 'f'
================================================== */

// [Z, symbol, en-name, zh-name, category, group(1..18 or 'f'), period,
//  mass, config-short, common-oxidation-states, EN-electroneg or null,
//  radioactive: 0 none/1 unstable but some stable isotopes/2 fully radioactive]
const ELEMENT_TABLE = [
  [1,'H','Hydrogen','氢','nonmetal',1,1,1.008,'1s¹','−1,+1',2.20,0],
  [2,'He','Helium','氦','noble',18,1,4.003,'1s²','0',null,0],
  [3,'Li','Lithium','锂','alkali',1,2,6.94,'[He] 2s¹','+1',0.98,0],
  [4,'Be','Beryllium','铍','alkaline',2,2,9.012,'[He] 2s²','+2',1.57,0],
  [5,'B','Boron','硼','metalloid',13,2,10.81,'[He] 2s²2p¹','+3',2.04,0],
  [6,'C','Carbon','碳','nonmetal',14,2,12.011,'[He] 2s²2p²','−4,+2,+4',2.55,0],
  [7,'N','Nitrogen','氮','nonmetal',15,2,14.007,'[He] 2s²2p³','−3,+1,+2,+3,+4,+5',3.04,0],
  [8,'O','Oxygen','氧','nonmetal',16,2,15.999,'[He] 2s²2p⁴','−2',3.44,0],
  [9,'F','Fluorine','氟','halogen',17,2,18.998,'[He] 2s²2p⁵','−1',3.98,0],
  [10,'Ne','Neon','氖','noble',18,2,20.180,'[He] 2s²2p⁶','0',null,0],
  [11,'Na','Sodium','钠','alkali',1,3,22.990,'[Ne] 3s¹','+1',0.93,0],
  [12,'Mg','Magnesium','镁','alkaline',2,3,24.305,'[Ne] 3s²','+2',1.31,0],
  [13,'Al','Aluminium','铝','posttransition',13,3,26.982,'[Ne] 3s²3p¹','+3',1.61,0],
  [14,'Si','Silicon','硅','metalloid',14,3,28.085,'[Ne] 3s²3p²','−4,+4',1.90,0],
  [15,'P','Phosphorus','磷','nonmetal',15,3,30.974,'[Ne] 3s²3p³','−3,+3,+5',2.19,0],
  [16,'S','Sulfur','硫','nonmetal',16,3,32.06,'[Ne] 3s²3p⁴','−2,+2,+4,+6',2.58,0],
  [17,'Cl','Chlorine','氯','halogen',17,3,35.45,'[Ne] 3s²3p⁵','−1,+1,+3,+5,+7',3.16,0],
  [18,'Ar','Argon','氩','noble',18,3,39.948,'[Ne] 3s²3p⁶','0',null,0],
  [19,'K','Potassium','钾','alkali',1,4,39.098,'[Ar] 4s¹','+1',0.82,0],
  [20,'Ca','Calcium','钙','alkaline',2,4,40.078,'[Ar] 4s²','+2',1.00,0],
  [21,'Sc','Scandium','钪','transition',3,4,44.956,'[Ar] 3d¹4s²','+3',1.36,0],
  [22,'Ti','Titanium','钛','transition',4,4,47.867,'[Ar] 3d²4s²','+2,+3,+4',1.54,0],
  [23,'V','Vanadium','钒','transition',5,4,50.942,'[Ar] 3d³4s²','+2,+3,+4,+5',1.63,0],
  [24,'Cr','Chromium','铬','transition',6,4,51.996,'[Ar] 3d⁵4s¹','+2,+3,+6',1.66,0],
  [25,'Mn','Manganese','锰','transition',7,4,54.938,'[Ar] 3d⁵4s²','+2,+3,+4,+6,+7',1.55,0],
  [26,'Fe','Iron','铁','transition',8,4,55.845,'[Ar] 3d⁶4s²','+2,+3',1.83,0],
  [27,'Co','Cobalt','钴','transition',9,4,58.933,'[Ar] 3d⁷4s²','+2,+3',1.88,0],
  [28,'Ni','Nickel','镍','transition',10,4,58.693,'[Ar] 3d⁸4s²','+2,+3',1.91,0],
  [29,'Cu','Copper','铜','transition',11,4,63.546,'[Ar] 3d¹⁰4s¹','+1,+2',1.90,0],
  [30,'Zn','Zinc','锌','transition',12,4,65.38,'[Ar] 3d¹⁰4s²','+2',1.65,0],
  [31,'Ga','Gallium','镓','posttransition',13,4,69.723,'[Ar] 3d¹⁰4s²4p¹','+3',1.81,0],
  [32,'Ge','Germanium','锗','metalloid',14,4,72.630,'[Ar] 3d¹⁰4s²4p²','−4,+2,+4',2.01,0],
  [33,'As','Arsenic','砷','metalloid',15,4,74.922,'[Ar] 3d¹⁰4s²4p³','−3,+3,+5',2.18,0],
  [34,'Se','Selenium','硒','nonmetal',16,4,78.971,'[Ar] 3d¹⁰4s²4p⁴','−2,+4,+6',2.55,0],
  [35,'Br','Bromine','溴','halogen',17,4,79.904,'[Ar] 3d¹⁰4s²4p⁵','−1,+1,+3,+5,+7',2.96,0],
  [36,'Kr','Krypton','氪','noble',18,4,83.798,'[Ar] 3d¹⁰4s²4p⁶','0,+2',3.00,0],
  [37,'Rb','Rubidium','铷','alkali',1,5,85.468,'[Kr] 5s¹','+1',0.82,0],
  [38,'Sr','Strontium','锶','alkaline',2,5,87.62,'[Kr] 5s²','+2',0.95,0],
  [39,'Y','Yttrium','钇','transition',3,5,88.906,'[Kr] 4d¹5s²','+3',1.22,0],
  [40,'Zr','Zirconium','锆','transition',4,5,91.224,'[Kr] 4d²5s²','+4',1.33,0],
  [41,'Nb','Niobium','铌','transition',5,5,92.906,'[Kr] 4d⁴5s¹','+3,+5',1.6,0],
  [42,'Mo','Molybdenum','钼','transition',6,5,95.95,'[Kr] 4d⁵5s¹','+4,+6',2.16,0],
  [43,'Tc','Technetium','锝','transition',7,5,98,'[Kr] 4d⁵5s²','+4,+7',1.9,2],
  [44,'Ru','Ruthenium','钌','transition',8,5,101.07,'[Kr] 4d⁷5s¹','+3,+4',2.2,0],
  [45,'Rh','Rhodium','铑','transition',9,5,102.91,'[Kr] 4d⁸5s¹','+3',2.28,0],
  [46,'Pd','Palladium','钯','transition',10,5,106.42,'[Kr] 4d¹⁰','+2,+4',2.20,0],
  [47,'Ag','Silver','银','transition',11,5,107.87,'[Kr] 4d¹⁰5s¹','+1',1.93,0],
  [48,'Cd','Cadmium','镉','transition',12,5,112.41,'[Kr] 4d¹⁰5s²','+2',1.69,0],
  [49,'In','Indium','铟','posttransition',13,5,114.82,'[Kr] 4d¹⁰5s²5p¹','+3',1.78,0],
  [50,'Sn','Tin','锡','posttransition',14,5,118.71,'[Kr] 4d¹⁰5s²5p²','+2,+4',1.96,0],
  [51,'Sb','Antimony','锑','metalloid',15,5,121.76,'[Kr] 4d¹⁰5s²5p³','−3,+3,+5',2.05,0],
  [52,'Te','Tellurium','碲','metalloid',16,5,127.60,'[Kr] 4d¹⁰5s²5p⁴','−2,+4,+6',2.1,0],
  [53,'I','Iodine','碘','halogen',17,5,126.90,'[Kr] 4d¹⁰5s²5p⁵','−1,+1,+3,+5,+7',2.66,0],
  [54,'Xe','Xenon','氙','noble',18,5,131.29,'[Kr] 4d¹⁰5s²5p⁶','0,+2,+4,+6,+8',2.60,0],
  [55,'Cs','Caesium','铯','alkali',1,6,132.91,'[Xe] 6s¹','+1',0.79,0],
  [56,'Ba','Barium','钡','alkaline',2,6,137.33,'[Xe] 6s²','+2',0.89,0],
  [57,'La','Lanthanum','镧','lanthanide','f',6,138.91,'[Xe] 5d¹6s²','+3',1.10,0],
  [58,'Ce','Cerium','铈','lanthanide','f',6,140.12,'[Xe] 4f¹5d¹6s²','+3,+4',1.12,0],
  [59,'Pr','Praseodymium','镨','lanthanide','f',6,140.91,'[Xe] 4f³6s²','+3',1.13,0],
  [60,'Nd','Neodymium','钕','lanthanide','f',6,144.24,'[Xe] 4f⁴6s²','+3',1.14,0],
  [61,'Pm','Promethium','钷','lanthanide','f',6,145,'[Xe] 4f⁵6s²','+3',1.13,2],
  [62,'Sm','Samarium','钐','lanthanide','f',6,150.36,'[Xe] 4f⁶6s²','+2,+3',1.17,0],
  [63,'Eu','Europium','铕','lanthanide','f',6,151.96,'[Xe] 4f⁷6s²','+2,+3',1.2,0],
  [64,'Gd','Gadolinium','钆','lanthanide','f',6,157.25,'[Xe] 4f⁷5d¹6s²','+3',1.20,0],
  [65,'Tb','Terbium','铽','lanthanide','f',6,158.93,'[Xe] 4f⁹6s²','+3,+4',1.2,0],
  [66,'Dy','Dysprosium','镝','lanthanide','f',6,162.50,'[Xe] 4f¹⁰6s²','+3',1.22,0],
  [67,'Ho','Holmium','钬','lanthanide','f',6,164.93,'[Xe] 4f¹¹6s²','+3',1.23,0],
  [68,'Er','Erbium','铒','lanthanide','f',6,167.26,'[Xe] 4f¹²6s²','+3',1.24,0],
  [69,'Tm','Thulium','铥','lanthanide','f',6,168.93,'[Xe] 4f¹³6s²','+3',1.25,0],
  [70,'Yb','Ytterbium','镱','lanthanide','f',6,173.05,'[Xe] 4f¹⁴6s²','+2,+3',1.1,0],
  [71,'Lu','Lutetium','镥','lanthanide','f',6,174.97,'[Xe] 4f¹⁴5d¹6s²','+3',1.27,0],
  [72,'Hf','Hafnium','铪','transition',4,6,178.49,'[Xe] 4f¹⁴5d²6s²','+4',1.3,0],
  [73,'Ta','Tantalum','钽','transition',5,6,180.95,'[Xe] 4f¹⁴5d³6s²','+5',1.5,0],
  [74,'W','Tungsten','钨','transition',6,6,183.84,'[Xe] 4f¹⁴5d⁴6s²','+4,+6',2.36,0],
  [75,'Re','Rhenium','铼','transition',7,6,186.21,'[Xe] 4f¹⁴5d⁵6s²','+4,+7',1.9,0],
  [76,'Os','Osmium','锇','transition',8,6,190.23,'[Xe] 4f¹⁴5d⁶6s²','+3,+4,+8',2.2,0],
  [77,'Ir','Iridium','铱','transition',9,6,192.22,'[Xe] 4f¹⁴5d⁷6s²','+3,+4',2.20,0],
  [78,'Pt','Platinum','铂','transition',10,6,195.08,'[Xe] 4f¹⁴5d⁹6s¹','+2,+4',2.28,0],
  [79,'Au','Gold','金','transition',11,6,196.97,'[Xe] 4f¹⁴5d¹⁰6s¹','+1,+3',2.54,0],
  [80,'Hg','Mercury','汞','transition',12,6,200.59,'[Xe] 4f¹⁴5d¹⁰6s²','+1,+2',2.00,0],
  [81,'Tl','Thallium','铊','posttransition',13,6,204.38,'[Xe] 4f¹⁴5d¹⁰6s²6p¹','+1,+3',1.62,0],
  [82,'Pb','Lead','铅','posttransition',14,6,207.2,'[Xe] 4f¹⁴5d¹⁰6s²6p²','+2,+4',2.33,0],
  [83,'Bi','Bismuth','铋','posttransition',15,6,208.98,'[Xe] 4f¹⁴5d¹⁰6s²6p³','+3,+5',2.02,1],
  [84,'Po','Polonium','钋','metalloid',16,6,209,'[Xe] 4f¹⁴5d¹⁰6s²6p⁴','+2,+4',2.0,2],
  [85,'At','Astatine','砹','halogen',17,6,210,'[Xe] 4f¹⁴5d¹⁰6s²6p⁵','−1,+1,+3,+5,+7',2.2,2],
  [86,'Rn','Radon','氡','noble',18,6,222,'[Xe] 4f¹⁴5d¹⁰6s²6p⁶','0,+2',2.2,2],
  [87,'Fr','Francium','钫','alkali',1,7,223,'[Rn] 7s¹','+1',0.7,2],
  [88,'Ra','Radium','镭','alkaline',2,7,226,'[Rn] 7s²','+2',0.9,2],
  [89,'Ac','Actinium','锕','actinide','f',7,227,'[Rn] 6d¹7s²','+3',1.1,2],
  [90,'Th','Thorium','钍','actinide','f',7,232.04,'[Rn] 6d²7s²','+4',1.3,2],
  [91,'Pa','Protactinium','镤','actinide','f',7,231.04,'[Rn] 5f²6d¹7s²','+4,+5',1.5,2],
  [92,'U','Uranium','铀','actinide','f',7,238.03,'[Rn] 5f³6d¹7s²','+3,+4,+5,+6',1.38,2],
  [93,'Np','Neptunium','镎','actinide','f',7,237,'[Rn] 5f⁴6d¹7s²','+3,+4,+5,+6,+7',1.36,2],
  [94,'Pu','Plutonium','钚','actinide','f',7,244,'[Rn] 5f⁶7s²','+3,+4,+5,+6',1.28,2],
  [95,'Am','Americium','镅','actinide','f',7,243,'[Rn] 5f⁷7s²','+3,+4,+5,+6',1.13,2],
  [96,'Cm','Curium','锔','actinide','f',7,247,'[Rn] 5f⁷6d¹7s²','+3',1.28,2],
  [97,'Bk','Berkelium','锫','actinide','f',7,247,'[Rn] 5f⁹7s²','+3,+4',1.3,2],
  [98,'Cf','Californium','锎','actinide','f',7,251,'[Rn] 5f¹⁰7s²','+3',1.3,2],
  [99,'Es','Einsteinium','锿','actinide','f',7,252,'[Rn] 5f¹¹7s²','+3',1.3,2],
  [100,'Fm','Fermium','镄','actinide','f',7,257,'[Rn] 5f¹²7s²','+3',1.3,2],
  [101,'Md','Mendelevium','钔','actinide','f',7,258,'[Rn] 5f¹³7s²','+2,+3',1.3,2],
  [102,'No','Nobelium','锘','actinide','f',7,259,'[Rn] 5f¹⁴7s²','+2,+3',1.3,2],
  [103,'Lr','Lawrencium','铹','actinide','f',7,266,'[Rn] 5f¹⁴7s²7p¹','+3',1.3,2],
  [104,'Rf','Rutherfordium','鑪','transition',4,7,267,'[Rn] 5f¹⁴6d²7s²','+4',null,2],
  [105,'Db','Dubnium','𨧀','transition',5,7,268,'[Rn] 5f¹⁴6d³7s²','+5',null,2],
  [106,'Sg','Seaborgium','𨭎','transition',6,7,269,'[Rn] 5f¹⁴6d⁴7s²','+6',null,2],
  [107,'Bh','Bohrium','𨨏','transition',7,7,270,'[Rn] 5f¹⁴6d⁵7s²','+7',null,2],
  [108,'Hs','Hassium','𨭆','transition',8,7,269,'[Rn] 5f¹⁴6d⁶7s²','+8',null,2],
  [109,'Mt','Meitnerium','鿏','transition',9,7,278,'[Rn] 5f¹⁴6d⁷7s²','?',null,2],
  [110,'Ds','Darmstadtium','𨭏','transition',10,7,281,'[Rn] 5f¹⁴6d⁸7s²','?',null,2],
  [111,'Rg','Roentgenium','𬬭','transition',11,7,282,'[Rn] 5f¹⁴6d⁹7s²','?',null,2],
  [112,'Cn','Copernicium','鿔','transition',12,7,285,'[Rn] 5f¹⁴6d¹⁰7s²','+2',null,2],
  [113,'Nh','Nihonium','鿭','posttransition',13,7,286,'[Rn] 5f¹⁴6d¹⁰7s²7p¹','?',null,2],
  [114,'Fl','Flerovium','𫓧','posttransition',14,7,289,'[Rn] 5f¹⁴6d¹⁰7s²7p²','?',null,2],
  [115,'Mc','Moscovium','镆','posttransition',15,7,290,'[Rn] 5f¹⁴6d¹⁰7s²7p³','?',null,2],
  [116,'Lv','Livermorium','𫟷','posttransition',16,7,293,'[Rn] 5f¹⁴6d¹⁰7s²7p⁴','?',null,2],
  [117,'Ts','Tennessine','鿬','halogen',17,7,294,'[Rn] 5f¹⁴6d¹⁰7s²7p⁵','?',null,2],
  [118,'Og','Oganesson','鿫','noble',18,7,294,'[Rn] 5f¹⁴6d¹⁰7s²7p⁶','?',null,2],
];

/* Build lookup */
const ELEMENTS = {};
ELEMENT_TABLE.forEach(row=>{
  const [Z,sym,en,zh,cat,group,period,mass,cfg,ox,en_,rad]=row;
  ELEMENTS[Z] = {Z,symbol:sym,name_en:en,name_zh:zh,category:cat,group,period,mass,config:cfg,oxidation:ox,electronegativity:en_,radioactive:rad};
});

/* Compute electron shells from config */
function shellCounts(z){
  // Simple shell-filling table (approx aufbau)
  const cap=[2,8,18,32,32,18,8]; // K,L,M,N,O,P,Q
  const shells=[0,0,0,0,0,0,0];
  let rem=z;
  for(let i=0;i<shells.length && rem>0;i++){
    const take=Math.min(cap[i],rem);
    shells[i]=take; rem-=take;
  }
  // Correct for transition elements (outer shell keeps 2 or 1 while d fills)
  return shells;
}

/* Extended data for detailed elements */
const EXTENDED = {
  1:  {phase:'gas', melt:14.01, boil:20.28, density:0.00009,
       discovery:{year:1766, who:'Henry Cavendish'},
       uses_en:'Ammonia synthesis, rocket fuel, hydrogen fuel cells, hydrogenation of oils, coolant in generators.',
       uses_zh:'合成氨、火箭燃料、氢燃料电池、油脂加氢、发电机冷却。',
       isotopes:[{s:'¹H',ab:'99.98%',stable:true,note:'protium'},{s:'²H',ab:'0.02%',stable:true,note:'deuterium'},{s:'³H',ab:'trace',stable:false,note:'tritium, β⁻, t½=12.3y'}],
       hybrid:['s'],
       reactions:[{eq:'2H₂ + O₂ → 2H₂O',note_en:'combustion',note_zh:'燃烧生成水'},{eq:'N₂ + 3H₂ ⇌ 2NH₃',note_en:'Haber process',note_zh:'哈伯法合成氨'}]},
  2:  {phase:'gas', melt:0.95, boil:4.22, density:0.000178,
       discovery:{year:1868, who:'Janssen & Lockyer'},
       uses_en:'Balloons, MRI cryogenics, deep-sea breathing mixes, protective atmosphere.',
       uses_zh:'气球、核磁共振低温冷却、深海呼吸混合气、保护气氛。',
       isotopes:[{s:'³He',ab:'0.0001%',stable:true,note:''},{s:'⁴He',ab:'99.99%',stable:true,note:''}],
       hybrid:[],
       reactions:[]},
  3:  {phase:'solid', melt:453.65, boil:1615, density:0.534,
       discovery:{year:1817, who:'Johan August Arfwedson'},
       uses_en:'Lithium-ion batteries, mood-stabilizing drugs, lithium grease, glass and ceramics.',
       uses_zh:'锂离子电池、稳定情绪药物(碳酸锂)、锂基润滑脂、玻璃与陶瓷。',
       isotopes:[{s:'⁶Li',ab:'7.6%',stable:true,note:''},{s:'⁷Li',ab:'92.4%',stable:true,note:''}],
       hybrid:['s'],
       reactions:[{eq:'4Li + O₂ → 2Li₂O',note_en:'burns with crimson flame',note_zh:'燃烧发深红色火焰'},{eq:'2Li + 2H₂O → 2LiOH + H₂↑',note_en:'reacts with water',note_zh:'与水反应放氢'}]},
  6:  {phase:'solid', melt:3823, boil:4098, density:2.267,
       discovery:{year:-3750, who:'known since antiquity'},
       uses_en:'Backbone of organic chemistry & life. Steel, graphite, diamond, carbon fiber, nanotubes, batteries.',
       uses_zh:'有机化学与生命的骨架。钢铁冶炼、石墨、金刚石、碳纤维、纳米管、电池。',
       isotopes:[{s:'¹²C',ab:'98.9%',stable:true,note:'defines atomic mass unit'},{s:'¹³C',ab:'1.1%',stable:true,note:''},{s:'¹⁴C',ab:'trace',stable:false,note:'β⁻, t½=5730y, radiocarbon dating'}],
       hybrid:['sp','sp²','sp³'],
       reactions:[{eq:'C + O₂ → CO₂',note_en:'complete combustion',note_zh:'完全燃烧'},{eq:'2C + O₂ → 2CO',note_en:'incomplete combustion',note_zh:'不完全燃烧'},{eq:'CH₄ + 2O₂ → CO₂ + 2H₂O',note_en:'methane burning',note_zh:'甲烷燃烧'}]},
  7:  {phase:'gas', melt:63.15, boil:77.36, density:0.001251,
       discovery:{year:1772, who:'Daniel Rutherford'},
       uses_en:'78% of atmosphere. Fertilizers, explosives, cryogenics, protective atmosphere.',
       uses_zh:'占大气 78%。化肥、炸药、低温制冷、保护气氛。',
       isotopes:[{s:'¹⁴N',ab:'99.6%',stable:true,note:''},{s:'¹⁵N',ab:'0.4%',stable:true,note:''}],
       hybrid:['sp','sp²','sp³'],
       reactions:[{eq:'N₂ + 3H₂ ⇌ 2NH₃',note_en:'Haber-Bosch (industrial)',note_zh:'哈伯-博施法'},{eq:'N₂ + O₂ → 2NO',note_en:'lightning; smog',note_zh:'闪电反应；产生光化学烟雾'}]},
  8:  {phase:'gas', melt:54.36, boil:90.20, density:0.001429,
       discovery:{year:1774, who:'Joseph Priestley'},
       uses_en:'Respiration, combustion, steel-making, medical use, rocket propellant oxidizer.',
       uses_zh:'呼吸、燃烧、炼钢、医疗供氧、火箭氧化剂。',
       isotopes:[{s:'¹⁶O',ab:'99.76%',stable:true,note:''},{s:'¹⁷O',ab:'0.04%',stable:true,note:''},{s:'¹⁸O',ab:'0.20%',stable:true,note:''}],
       hybrid:['sp²','sp³'],
       reactions:[{eq:'2H₂ + O₂ → 2H₂O',note_en:'water formation',note_zh:'生成水'},{eq:'3O₂ → 2O₃',note_en:'ozone formation (UV)',note_zh:'紫外线下生成臭氧'}]},
  11: {phase:'solid', melt:370.87, boil:1156, density:0.968,
       discovery:{year:1807, who:'Humphry Davy'},
       uses_en:'Table salt (NaCl), sodium-vapor lamps, sodium-cooled reactors, soap manufacture.',
       uses_zh:'食盐(NaCl)、钠灯、钠冷反应堆、肥皂制造。',
       isotopes:[{s:'²³Na',ab:'100%',stable:true,note:''}],
       hybrid:['s'],
       reactions:[{eq:'2Na + Cl₂ → 2NaCl',note_en:'violent, exothermic',note_zh:'剧烈放热反应'},{eq:'2Na + 2H₂O → 2NaOH + H₂↑',note_en:'reacts strongly with water',note_zh:'与水剧烈反应放氢'}]},
  17: {phase:'gas', melt:171.6, boil:239.11, density:0.003214,
       discovery:{year:1774, who:'Carl Wilhelm Scheele'},
       uses_en:'Water disinfection, PVC & organic solvents, bleaches, hydrochloric acid.',
       uses_zh:'饮用水消毒、聚氯乙烯与有机溶剂、漂白剂、盐酸。',
       isotopes:[{s:'³⁵Cl',ab:'75.8%',stable:true,note:''},{s:'³⁷Cl',ab:'24.2%',stable:true,note:''}],
       hybrid:['sp³'],
       reactions:[{eq:'H₂ + Cl₂ → 2HCl',note_en:'photochemical chain reaction',note_zh:'光化学链反应'},{eq:'2Na + Cl₂ → 2NaCl',note_en:'ionic salt formation',note_zh:'生成离子化合物'}]},
  26: {phase:'solid', melt:1811, boil:3134, density:7.874,
       discovery:{year:-5000, who:'known since prehistory'},
       uses_en:'Steel & cast iron (~90% of all metal used), hemoglobin, magnetic cores, catalysts.',
       uses_zh:'钢铁与铸铁(占全部金属用量约 90%)、血红蛋白、磁芯、催化剂。',
       isotopes:[{s:'⁵⁴Fe',ab:'5.8%',stable:true,note:''},{s:'⁵⁶Fe',ab:'91.8%',stable:true,note:'most tightly bound nucleus'},{s:'⁵⁷Fe',ab:'2.1%',stable:true,note:''},{s:'⁵⁸Fe',ab:'0.3%',stable:true,note:''}],
       hybrid:['d²sp³','sp³d²'],
       reactions:[{eq:'4Fe + 3O₂ → 2Fe₂O₃',note_en:'rusting',note_zh:'生锈(氧化)'},{eq:'Fe + 2HCl → FeCl₂ + H₂↑',note_en:'reacts with acid',note_zh:'与酸反应放氢'}]},
  29: {phase:'solid', melt:1357.77, boil:2835, density:8.96,
       discovery:{year:-9000, who:'known since antiquity'},
       uses_en:'Electrical wiring, plumbing, alloys (bronze, brass), antimicrobial surfaces.',
       uses_zh:'电线、水管、合金(青铜、黄铜)、抗菌表面。',
       isotopes:[{s:'⁶³Cu',ab:'69.2%',stable:true,note:''},{s:'⁶⁵Cu',ab:'30.8%',stable:true,note:''}],
       hybrid:['sp','sp³','dsp²'],
       reactions:[{eq:'2Cu + O₂ → 2CuO',note_en:'oxidation on heating',note_zh:'加热氧化'},{eq:'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag',note_en:'displacement (single-replacement)',note_zh:'置换反应'}]},
  79: {phase:'solid', melt:1337.33, boil:3129, density:19.30,
       discovery:{year:-6000, who:'known since antiquity'},
       uses_en:'Jewelry, monetary reserves, electronics contacts, medical, dentistry.',
       uses_zh:'珠宝、货币储备、电子接点、医疗、牙科。',
       isotopes:[{s:'¹⁹⁷Au',ab:'100%',stable:true,note:'only stable isotope'}],
       hybrid:['sp','sp³','dsp²'],
       reactions:[{eq:'Au + HNO₃ + 4HCl → HAuCl₄ + NO↑ + 2H₂O',note_en:'aqua regia: HNO₃ oxidizes, HCl complexes Au',note_zh:'王水:HNO₃ 氧化,HCl 与金形成配合物'}]},
  92: {phase:'solid', melt:1405.3, boil:4404, density:19.1,
       discovery:{year:1789, who:'Martin Heinrich Klaproth'},
       uses_en:'Nuclear fuel (²³⁵U fission), armor-piercing rounds (depleted U), radiometric dating.',
       uses_zh:'核燃料(²³⁵U 裂变)、贫铀穿甲弹、放射性同位素测年。',
       isotopes:[{s:'²³⁴U',ab:'0.005%',stable:false,note:'α, t½=245,500 y'},{s:'²³⁵U',ab:'0.72%',stable:false,note:'α, t½=704 My, fissile'},{s:'²³⁸U',ab:'99.27%',stable:false,note:'α, t½=4.47 By'}],
       hybrid:['f'],
       reactions:[
         {eq:'U + 3F₂ → UF₆', note_en:'used for enrichment (gaseous UF₆)', note_zh:'用于铀浓缩(六氟化铀)'},
         {eq:'2U + 3O₂ → 2UO₃', note_en:'oxidation in air (yellowcake chemistry)', note_zh:'空气中氧化(黄饼化学)'}
       ]}
};

/* Categories → color, translations */
const CATEGORY_COLORS = {
  alkali:         '#ff6b6b',
  alkaline:       '#ff9f43',
  transition:     '#feca57',
  posttransition: '#48dbfb',
  metalloid:      '#a29bfe',
  nonmetal:       '#5aff8a',
  halogen:        '#00d4ff',
  noble:          '#c77dff',
  lanthanide:     '#ff6b9d',
  actinide:       '#ff8ac9',
  unknown:        '#888'
};

/* ================ SIGNATURE COLORS ================
   Per element, a list of visually distinctive appearances:
     - metal / gas / crystal in its pure form (state "0")
     - common oxidation-state compounds (state "+1", "+2", …)
     - flame test color (state "flame") for the classic ones
   Each entry: {state, hex, label_en, label_zh, note_en?, note_zh?}
==================================================== */
const SIGNATURE_COLORS = {
  1:  [ // Hydrogen
    {state:'0', hex:'#e6f2ff', label_en:'colorless gas', label_zh:'无色气体'},
    {state:'flame', hex:'#a8c9ff', label_en:'pale blue flame', label_zh:'淡蓝色火焰'}
  ],
  2:  [ {state:'0', hex:'#f4f6ff', label_en:'colorless gas', label_zh:'无色气体'} ],
  3:  [ // Li
    {state:'0', hex:'#c8ccd0', label_en:'silvery metal', label_zh:'银白色金属'},
    {state:'flame', hex:'#e64545', label_en:'crimson red flame', label_zh:'深红色火焰'}
  ],
  4:  [ {state:'0', hex:'#b8bcc0', label_en:'steel-grey metal', label_zh:'钢灰色金属'} ],
  5:  [ {state:'0', hex:'#3a3a3a', label_en:'dark black powder / brown crystal', label_zh:'黑色粉末/棕色晶体'} ],
  6:  [ // C
    {state:'0', hex:'#1a1a1a', label_en:'graphite / coal (black)', label_zh:'石墨/煤炭(黑色)'},
    {state:'0', hex:'#e6f0ff', label_en:'diamond (colorless)', label_zh:'金刚石(无色)'},
    {state:'0', hex:'#3b2a20', label_en:'fullerene / soot (brown-black)', label_zh:'富勒烯/烟炱(棕黑)'}
  ],
  7:  [ // N
    {state:'0', hex:'#eef5ff', label_en:'colorless gas', label_zh:'无色气体'},
    {state:'+4', hex:'#b8531c', label_en:'NO₂ — reddish-brown gas', label_zh:'NO₂ 红棕色气体'}
  ],
  8:  [ // O
    {state:'0', hex:'#eef5ff', label_en:'O₂ colorless gas', label_zh:'O₂ 无色气体'},
    {state:'0', hex:'#94e3ff', label_en:'liquid O₂ pale blue', label_zh:'液态氧 淡蓝色'},
    {state:'0', hex:'#7fe6ff', label_en:'O₃ ozone (pale blue gas)', label_zh:'O₃ 臭氧(淡蓝色气体)'}
  ],
  9:  [ {state:'0', hex:'#d9ecb8', label_en:'F₂ pale yellow gas', label_zh:'F₂ 淡黄色气体'} ],
  10: [ {state:'0', hex:'#f4f6ff', label_en:'colorless gas', label_zh:'无色气体'},
        {state:'discharge', hex:'#ff5040', label_en:'orange-red discharge (neon sign)', label_zh:'橙红色放电(霓虹灯)'} ],
  11: [ // Na
    {state:'0', hex:'#d5d8de', label_en:'silvery metal', label_zh:'银白色金属'},
    {state:'flame', hex:'#ffb830', label_en:'bright yellow flame', label_zh:'明黄色火焰'}
  ],
  12: [ {state:'0', hex:'#c8ccd0', label_en:'silvery-white metal', label_zh:'银白色金属'},
        {state:'flame', hex:'#ffffff', label_en:'brilliant white flame', label_zh:'耀眼的白色火焰'} ],
  13: [ {state:'0', hex:'#c8ccd0', label_en:'silvery-white metal', label_zh:'银白色金属'} ],
  14: [ {state:'0', hex:'#4a4d55', label_en:'dark grey lustre', label_zh:'暗灰色带金属光泽'} ],
  15: [ // P
    {state:'0', hex:'#e6d060', label_en:'white/yellow phosphorus (yellow)', label_zh:'白/黄磷(黄色)'},
    {state:'0', hex:'#8a3a1a', label_en:'red phosphorus (red-brown)', label_zh:'红磷(红棕色)'}
  ],
  16: [ {state:'0', hex:'#ffd45c', label_en:'yellow crystals', label_zh:'黄色晶体'} ],
  17: [ // Cl
    {state:'0', hex:'#a5d858', label_en:'Cl₂ yellow-green gas', label_zh:'Cl₂ 黄绿色气体'},
    {state:'−1', hex:'#e6f0ff', label_en:'chloride — colorless in solution', label_zh:'氯化物 — 溶液中无色'}
  ],
  18: [ {state:'0', hex:'#f4f6ff', label_en:'colorless gas', label_zh:'无色气体'},
        {state:'discharge', hex:'#a06bff', label_en:'lilac-violet discharge', label_zh:'淡紫色放电'} ],
  19: [ // K
    {state:'0', hex:'#d5d8de', label_en:'silvery metal', label_zh:'银白色金属'},
    {state:'flame', hex:'#a05fff', label_en:'violet-lilac flame', label_zh:'紫色火焰'}
  ],
  20: [ {state:'0', hex:'#d0d4da', label_en:'silvery-white metal', label_zh:'银白色金属'},
        {state:'flame', hex:'#ff6a3d', label_en:'brick-red flame', label_zh:'砖红色火焰'} ],
  21: [ {state:'0', hex:'#c8ccd0', label_en:'silvery-white metal', label_zh:'银白色金属'},
        {state:'+3', hex:'#f4f6ff', label_en:'Sc³⁺ colorless in solution', label_zh:'Sc³⁺ 溶液中无色'} ],
  22: [ {state:'0', hex:'#c0c4cc', label_en:'silvery metal', label_zh:'银白色金属'},
        {state:'+3', hex:'#7b3b8f', label_en:'Ti³⁺ violet', label_zh:'Ti³⁺ 紫色'},
        {state:'+4', hex:'#f4f6ff', label_en:'TiO₂ white pigment', label_zh:'TiO₂ 白色颜料'} ],
  23: [ // V — famous "vanadium rainbow"
    {state:'0', hex:'#c0c4cc', label_en:'silvery metal', label_zh:'银白色金属'},
    {state:'+2', hex:'#8f6bff', label_en:'V²⁺ violet', label_zh:'V²⁺ 紫色'},
    {state:'+3', hex:'#2f8f4a', label_en:'V³⁺ green', label_zh:'V³⁺ 绿色'},
    {state:'+4', hex:'#3a8fff', label_en:'VO²⁺ blue', label_zh:'VO²⁺ 蓝色'},
    {state:'+5', hex:'#ffcf3a', label_en:'VO₂⁺ yellow', label_zh:'VO₂⁺ 黄色'}
  ],
  24: [ // Cr
    {state:'0', hex:'#c8ccd0', label_en:'silvery-blue metal', label_zh:'银蓝色金属'},
    {state:'+2', hex:'#4a8fff', label_en:'Cr²⁺ blue', label_zh:'Cr²⁺ 蓝色'},
    {state:'+3', hex:'#2fa070', label_en:'Cr³⁺ green', label_zh:'Cr³⁺ 绿色'},
    {state:'+6', hex:'#ff9a3d', label_en:'CrO₃ / Cr₂O₇²⁻ orange', label_zh:'CrO₃ / Cr₂O₇²⁻ 橙色'},
    {state:'+6', hex:'#ffde3d', label_en:'CrO₄²⁻ yellow', label_zh:'CrO₄²⁻ 黄色'}
  ],
  25: [ // Mn — the classic MnO4- purple
    {state:'0', hex:'#b8b8b8', label_en:'silvery-grey metal', label_zh:'银灰色金属'},
    {state:'+2', hex:'#ffbfd0', label_en:'Mn²⁺ pale pink', label_zh:'Mn²⁺ 淡粉色'},
    {state:'+4', hex:'#3a2a20', label_en:'MnO₂ dark brown/black', label_zh:'MnO₂ 深棕/黑色'},
    {state:'+6', hex:'#2fa070', label_en:'MnO₄²⁻ green', label_zh:'MnO₄²⁻ 绿色'},
    {state:'+7', hex:'#8a2fbf', label_en:'MnO₄⁻ deep purple', label_zh:'MnO₄⁻ 深紫色'}
  ],
  26: [ // Fe
    {state:'0', hex:'#7a7c85', label_en:'grey metal (steel)', label_zh:'灰色金属(钢铁)'},
    {state:'+2', hex:'#4a9a5a', label_en:'Fe²⁺ pale green', label_zh:'Fe²⁺ 浅绿色'},
    {state:'+3', hex:'#c47a2f', label_en:'Fe³⁺ yellow-brown', label_zh:'Fe³⁺ 黄棕色'},
    {state:'oxide', hex:'#a83c1a', label_en:'Fe₂O₃ rust (red-brown)', label_zh:'Fe₂O₃ 铁锈(红棕色)'}
  ],
  27: [ // Co — famous cobalt blue
    {state:'0', hex:'#a2a8b0', label_en:'silvery-grey metal', label_zh:'银灰色金属'},
    {state:'+2', hex:'#e05a95', label_en:'Co²⁺ pink (aqueous)', label_zh:'Co²⁺ 粉红色(水合)'},
    {state:'+2', hex:'#2b56d8', label_en:'CoCl₂ (anhydrous) blue', label_zh:'CoCl₂ (无水) 蓝色'},
    {state:'+3', hex:'#3a5aa5', label_en:'Co³⁺ blue-green', label_zh:'Co³⁺ 蓝绿色'}
  ],
  28: [ // Ni
    {state:'0', hex:'#c0c4cc', label_en:'silvery metal', label_zh:'银白色金属'},
    {state:'+2', hex:'#2fa070', label_en:'Ni²⁺ green (aqueous)', label_zh:'Ni²⁺ 绿色(水合)'}
  ],
  29: [ // Cu — THE example
    {state:'0', hex:'#c9762f', label_en:'red-orange metal', label_zh:'红橙色金属'},
    {state:'oxide', hex:'#5cbe5a', label_en:'patina / verdigris (green)', label_zh:'铜绿(绿色)'},
    {state:'+1', hex:'#c8451f', label_en:'Cu₂O red-brown', label_zh:'Cu₂O 红棕色'},
    {state:'+2', hex:'#2a8fff', label_en:'Cu²⁺ blue (aqueous)', label_zh:'Cu²⁺ 蓝色(水合)'},
    {state:'+2', hex:'#2f8560', label_en:'CuCl₂ green', label_zh:'CuCl₂ 绿色'},
    {state:'flame', hex:'#3fdc7f', label_en:'green flame test', label_zh:'焰色反应 绿色'}
  ],
  30: [ {state:'0', hex:'#b8bec8', label_en:'bluish-white metal', label_zh:'蓝白色金属'} ],
  33: [ {state:'0', hex:'#5a5f6a', label_en:'grey metallic (α-As)', label_zh:'灰色金属(α-砷)'},
        {state:'0', hex:'#e6d060', label_en:'yellow As₄', label_zh:'黄砷 As₄'} ],
  35: [ {state:'0', hex:'#a83c1a', label_en:'Br₂ deep red-brown liquid', label_zh:'Br₂ 深红棕色液体'} ],
  37: [ {state:'0', hex:'#c8ccd0', label_en:'silvery metal', label_zh:'银白色金属'},
        {state:'flame', hex:'#8a2fbf', label_en:'red-violet flame', label_zh:'红紫色火焰'} ],
  38: [ {state:'flame', hex:'#e6002a', label_en:'crimson red flame', label_zh:'深红色火焰(用于烟花)'} ],
  47: [ // Ag
    {state:'0', hex:'#d8dce0', label_en:'silvery-white lustrous metal', label_zh:'银白色带金属光泽'},
    {state:'+1', hex:'#c0c4cc', label_en:'AgCl white → grey (photo)', label_zh:'AgCl 白色→变灰(感光)'}
  ],
  53: [ // I — solid violet crystals, brown in solution
    {state:'0', hex:'#4a2a5a', label_en:'I₂ dark violet crystals', label_zh:'I₂ 深紫色晶体'},
    {state:'0', hex:'#7a3a8f', label_en:'I₂ vapor purple', label_zh:'I₂ 蒸气紫色'},
    {state:'0', hex:'#a86020', label_en:'I₂ in water brown', label_zh:'I₂ 水溶液棕色'}
  ],
  55: [ {state:'flame', hex:'#6b8fff', label_en:'blue-violet flame', label_zh:'蓝紫色火焰'} ],
  56: [ {state:'flame', hex:'#7fdc4a', label_en:'apple-green flame', label_zh:'黄绿色火焰'} ],
  57: [ {state:'+3', hex:'#f4f6ff', label_en:'La³⁺ colorless', label_zh:'La³⁺ 无色'} ],
  58: [ {state:'+3', hex:'#f4f6ff', label_en:'Ce³⁺ colorless', label_zh:'Ce³⁺ 无色'},
        {state:'+4', hex:'#ffcf3a', label_en:'Ce⁴⁺ yellow-orange (strong oxidizer)', label_zh:'Ce⁴⁺ 黄橙色(强氧化剂)'} ],
  59: [ {state:'+3', hex:'#7fdc4a', label_en:'Pr³⁺ yellow-green', label_zh:'Pr³⁺ 黄绿色'} ],
  60: [ {state:'+3', hex:'#e05a95', label_en:'Nd³⁺ pink-lavender', label_zh:'Nd³⁺ 粉紫色'} ],
  63: [ {state:'+3', hex:'#ffbfd0', label_en:'Eu³⁺ pale pink', label_zh:'Eu³⁺ 淡粉色'} ],
  67: [ {state:'+3', hex:'#c47a2f', label_en:'Ho³⁺ yellow-brown', label_zh:'Ho³⁺ 黄棕色'} ],
  68: [ {state:'+3', hex:'#ff5a95', label_en:'Er³⁺ pink', label_zh:'Er³⁺ 粉红色'} ],
  77: [ {state:'0', hex:'#e6e8ec', label_en:'silvery-white lustrous', label_zh:'银白色带金属光泽'} ],
  78: [ {state:'0', hex:'#e6e8ec', label_en:'silvery-white lustrous', label_zh:'银白色带金属光泽'} ],
  79: [ // Au
    {state:'0', hex:'#ffd23f', label_en:'yellow metallic gold', label_zh:'黄色金属'},
    {state:'+3', hex:'#ffdc3f', label_en:'AuCl₄⁻ yellow', label_zh:'AuCl₄⁻ 黄色'},
    {state:'nano', hex:'#e63a5a', label_en:'nanogold — red colloid (stained glass)', label_zh:'金纳米颗粒 — 红色胶体(彩色玻璃)'}
  ],
  80: [ {state:'0', hex:'#c0c4cc', label_en:'silvery liquid metal', label_zh:'银白色液态金属'} ],
  82: [ {state:'0', hex:'#6a6d75', label_en:'dull grey metal', label_zh:'暗灰色金属'} ],
  83: [ {state:'0', hex:'#c48fbf', label_en:'pinkish-white lustre (iridescent oxide)', label_zh:'带粉色的白色(氧化层呈彩虹色)'} ],
  92: [ {state:'0', hex:'#8a8c94', label_en:'silvery-grey metal', label_zh:'银灰色金属'},
        {state:'+6', hex:'#ffdc3f', label_en:'UO₂²⁺ yellow (uranyl)', label_zh:'UO₂²⁺ 黄色(铀酰)'} ]
};

const CATEGORY_I18N = {
  en: {
    alkali:'Alkali metal', alkaline:'Alkaline-earth metal', transition:'Transition metal',
    posttransition:'Post-transition metal', metalloid:'Metalloid', nonmetal:'Reactive nonmetal',
    halogen:'Halogen', noble:'Noble gas', lanthanide:'Lanthanide', actinide:'Actinide', unknown:'Unknown'
  },
  'zh-CN': {
    alkali:'碱金属', alkaline:'碱土金属', transition:'过渡金属',
    posttransition:'贫金属(主族金属)', metalloid:'类金属', nonmetal:'非金属',
    halogen:'卤素', noble:'稀有气体', lanthanide:'镧系元素', actinide:'锕系元素', unknown:'未知'
  }
};

const PHASE_I18N = {
  en: {solid:'Solid', liquid:'Liquid', gas:'Gas'},
  'zh-CN': {solid:'固态', liquid:'液态', gas:'气态'}
};

/* ================ DISCOVERY YEARS ================
   Compact table: Z -> [year, discoverer]. year<0 = ancient.
================================================== */
const DISCOVERY = {
  1:[1766,'Henry Cavendish'], 2:[1868,'P. Janssen & N. Lockyer'], 3:[1817,'J. A. Arfwedson'],
  4:[1797,'L. N. Vauquelin'], 5:[1808,'H. Davy, J. L. Gay-Lussac & L. J. Thénard'],
  6:[-3750,'known since antiquity'], 7:[1772,'Daniel Rutherford'], 8:[1774,'Joseph Priestley'],
  9:[1886,'Henri Moissan'], 10:[1898,'W. Ramsay & M. W. Travers'],
  11:[1807,'Humphry Davy'], 12:[1755,'Joseph Black'], 13:[1825,'H. C. Ørsted'],
  14:[1824,'Jöns Jacob Berzelius'], 15:[1669,'Hennig Brand'], 16:[-2000,'known since antiquity'],
  17:[1774,'Carl Wilhelm Scheele'], 18:[1894,'Lord Rayleigh & W. Ramsay'],
  19:[1807,'Humphry Davy'], 20:[1808,'Humphry Davy'], 21:[1879,'L. F. Nilson'],
  22:[1791,'William Gregor'], 23:[1801,'A. M. del Río'], 24:[1797,'L. N. Vauquelin'],
  25:[1774,'C. W. Scheele & J. G. Gahn'], 26:[-5000,'known since prehistory'],
  27:[1735,'Georg Brandt'], 28:[1751,'A. F. Cronstedt'], 29:[-9000,'known since antiquity'],
  30:[-1000,'known since antiquity'], 31:[1875,'Lecoq de Boisbaudran'], 32:[1886,'C. A. Winkler'],
  33:[-1000,'known since antiquity'], 34:[1817,'J. J. Berzelius'], 35:[1826,'A. J. Balard'],
  36:[1898,'W. Ramsay & M. W. Travers'], 37:[1861,'R. Bunsen & G. Kirchhoff'],
  38:[1790,'A. Crawford'], 39:[1794,'J. Gadolin'], 40:[1789,'M. H. Klaproth'],
  41:[1801,'C. Hatchett'], 42:[1778,'C. W. Scheele'], 43:[1937,'C. Perrier & E. Segrè'],
  44:[1844,'K. E. Claus'], 45:[1803,'W. H. Wollaston'], 46:[1803,'W. H. Wollaston'],
  47:[-5000,'known since antiquity'], 48:[1817,'F. Stromeyer'], 49:[1863,'F. Reich & T. Richter'],
  50:[-2100,'known since antiquity'], 51:[-3000,'known since antiquity'],
  52:[1782,'F.-J. Müller von Reichenstein'], 53:[1811,'B. Courtois'],
  54:[1898,'W. Ramsay & M. W. Travers'], 55:[1860,'R. Bunsen & G. Kirchhoff'],
  56:[1808,'Humphry Davy'], 57:[1839,'C. G. Mosander'], 58:[1803,'J. J. Berzelius & W. Hisinger'],
  59:[1885,'C. Auer von Welsbach'], 60:[1885,'C. Auer von Welsbach'],
  61:[1945,'Marinsky, Glendenin & Coryell'], 62:[1879,'Lecoq de Boisbaudran'],
  63:[1901,'E. Demarçay'], 64:[1880,'J.-C. G. de Marignac'], 65:[1843,'C. G. Mosander'],
  66:[1886,'Lecoq de Boisbaudran'], 67:[1878,'M. Delafontaine & J.-L. Soret'],
  68:[1843,'C. G. Mosander'], 69:[1879,'P. T. Cleve'], 70:[1878,'J.-C. G. de Marignac'],
  71:[1907,'G. Urbain'], 72:[1923,'D. Coster & G. von Hevesy'], 73:[1802,'A. G. Ekeberg'],
  74:[1783,'d\'Elhuyar brothers'], 75:[1925,'Noddack, Berg & Tacke'], 76:[1803,'S. Tennant'],
  77:[1803,'S. Tennant'], 78:[1735,'A. de Ulloa'], 79:[-6000,'known since antiquity'],
  80:[-2000,'known since antiquity'], 81:[1861,'William Crookes'],
  82:[-7000,'known since antiquity'], 83:[1753,'C. F. Geoffroy'], 84:[1898,'Marie & Pierre Curie'],
  85:[1940,'Corson, MacKenzie & Segrè'], 86:[1900,'F. E. Dorn'], 87:[1939,'Marguerite Perey'],
  88:[1898,'Marie & Pierre Curie'], 89:[1899,'A. Debierne'], 90:[1829,'J. J. Berzelius'],
  91:[1913,'K. Fajans & O. Göhring'], 92:[1789,'M. H. Klaproth'], 93:[1940,'McMillan & Abelson'],
  94:[1940,'Seaborg, McMillan, Kennedy & Wahl'], 95:[1944,'Seaborg, James, Morgan & Ghiorso'],
  96:[1944,'Seaborg, James & Ghiorso'], 97:[1949,'Thompson, Ghiorso & Seaborg'],
  98:[1950,'Thompson, Street, Ghiorso & Seaborg'], 99:[1952,'Ghiorso et al. (Ivy Mike fallout)'],
  100:[1952,'Ghiorso et al. (Ivy Mike fallout)'], 101:[1955,'Ghiorso et al.'],
  102:[1966,'Flerov et al. (JINR)'], 103:[1961,'Ghiorso et al.'],
  104:[1964,'JINR / LBNL'], 105:[1968,'JINR / LBNL'], 106:[1974,'LBNL / JINR'],
  107:[1981,'GSI Darmstadt'], 108:[1984,'GSI Darmstadt'], 109:[1982,'GSI Darmstadt'],
  110:[1994,'GSI Darmstadt'], 111:[1994,'GSI Darmstadt'], 112:[1996,'GSI Darmstadt'],
  113:[2003,'RIKEN (Japan)'], 114:[1998,'JINR (Dubna)'], 115:[2003,'JINR / LLNL'],
  116:[2000,'JINR / LLNL'], 117:[2010,'JINR / ORNL / LLNL'], 118:[2002,'JINR / LLNL']
};

/* ================ USES BY CATEGORY (fallback text) ================ */
const CATEGORY_USES = {
  en: {
    alkali: 'Highly reactive metal — reacts vigorously with water. Used in alloys, batteries, atomic clocks, and organic synthesis.',
    alkaline: 'Reactive light metal. Used in alloys, flares, medical imaging, and structural materials.',
    transition: 'Transition metal with variable oxidation states. Widely used in alloys, catalysts, pigments, and electronics.',
    posttransition: 'Post-transition metal (main-group). Used in alloys, coatings, solders, and semiconductor devices.',
    metalloid: 'Metalloid with properties between metals and non-metals. Used in semiconductors, glass, alloys, and specialty chemicals.',
    nonmetal: 'Reactive non-metal essential to living organisms and industrial chemistry.',
    halogen: 'Highly reactive non-metal. Used in disinfectants, salts, polymers, and pharmaceuticals.',
    noble: 'Noble gas — extremely unreactive. Used in lighting, lasers, cryogenics, and inert atmospheres.',
    lanthanide: 'Rare-earth element. Used in magnets, phosphors, catalysts, and specialty optics.',
    actinide: 'Actinide — radioactive metal. Uses limited to nuclear fuel, weapons research, and specialized instrumentation.'
  },
  'zh-CN': {
    alkali: '化学性质极其活泼的金属——遇水剧烈反应。用于合金、电池、原子钟和有机合成。',
    alkaline: '较活泼的轻金属。用于合金、照明弹、医学影像和结构材料。',
    transition: '过渡金属,具有可变化合价。广泛用于合金、催化剂、颜料和电子器件。',
    posttransition: '贫金属(主族金属)。用于合金、镀层、焊料和半导体器件。',
    metalloid: '类金属,性质介于金属与非金属之间。用于半导体、玻璃、合金及特种化学品。',
    nonmetal: '化学性质活泼的非金属,对生命和工业化学至关重要。',
    halogen: '化学性质极其活泼的非金属。用于消毒剂、盐类、聚合物和医药。',
    noble: '稀有气体——化学惰性极高。用于照明、激光、低温制冷及惰性保护气氛。',
    lanthanide: '稀土元素。用于永磁体、荧光粉、催化剂和特殊光学材料。',
    actinide: '锕系元素——具有放射性的金属。用途局限于核燃料、武器研究及特殊仪器。'
  }
};

/* ================ REACTION TEMPLATES BY CATEGORY ================ */
const CATEGORY_REACTIONS = {
  alkali: (sym)=>[
    {eq:`4${sym} + O₂ → 2${sym}₂O`, note_en:'burns in air', note_zh:'在空气中燃烧'},
    {eq:`2${sym} + 2H₂O → 2${sym}OH + H₂↑`, note_en:'reacts vigorously with water', note_zh:'与水剧烈反应放氢'},
    {eq:`2${sym} + Cl₂ → 2${sym}Cl`, note_en:'forms ionic salt', note_zh:'生成离子型盐'}
  ],
  alkaline: (sym)=>[
    {eq:`2${sym} + O₂ → 2${sym}O`, note_en:'oxidation on burning', note_zh:'燃烧生成氧化物'},
    {eq:`${sym} + 2H₂O → ${sym}(OH)₂ + H₂↑`, note_en:'reacts with water', note_zh:'与水反应放氢'}
  ],
  halogen: (sym)=>[
    {eq:`H₂ + ${sym}₂ → 2H${sym}`, note_en:'forms hydrogen halide', note_zh:'生成卤化氢'},
    {eq:`2Na + ${sym}₂ → 2Na${sym}`, note_en:'ionic salt formation', note_zh:'生成离子型盐'}
  ],
  transition: (sym)=>[
    {eq:`2${sym} + O₂ → 2${sym}O`, note_en:'typical oxidation', note_zh:'典型的氧化反应'}
  ],
  posttransition: (sym)=>[
    {eq:`4${sym} + 3O₂ → 2${sym}₂O₃`, note_en:'oxidation', note_zh:'氧化反应'}
  ],
  nonmetal: (sym)=>[
    {eq:`${sym} + O₂ → ${sym}O₂`, note_en:'combustion', note_zh:'燃烧'}
  ],
  metalloid: (sym)=>[
    {eq:`${sym} + O₂ → ${sym}O₂`, note_en:'oxidation', note_zh:'氧化反应'}
  ],
  lanthanide: (sym)=>[
    {eq:`4${sym} + 3O₂ → 2${sym}₂O₃`, note_en:'typical +3 oxide', note_zh:'典型的 +3 氧化物'}
  ],
  actinide: (sym)=>[]
};

/* ================ 3D MOLECULAR STRUCTURES ================
   Each molecule: { atoms:[{sym,x,y,z}], bonds:[[i,j,order]] }
   Coordinates in Ångstroms (approximate). The viewer auto-scales.
==================================================== */
const MOLECULE_3D = {
  // Water — bent, 104.5°
  'H2O': {
    atoms:[
      {sym:'O',x:0,y:0,z:0},
      {sym:'H',x:0.757,y:0.586,z:0},
      {sym:'H',x:-0.757,y:0.586,z:0}
    ],
    bonds:[[0,1,1],[0,2,1]]
  },
  // Hydrogen peroxide — open-book, ~111°
  'H2O2': {
    atoms:[
      {sym:'O',x:-0.735,y:0.10,z:0},
      {sym:'O',x:0.735,y:0.10,z:0},
      {sym:'H',x:-0.98,y:0.65,z:0.75},
      {sym:'H',x:0.98,y:0.65,z:-0.75}
    ],
    bonds:[[0,1,1],[0,2,1],[1,3,1]]
  },
  // Ammonia — trigonal pyramidal, 107°
  'NH3': {
    atoms:[
      {sym:'N',x:0,y:0,z:0},
      {sym:'H',x:0.94,y:-0.33,z:0},
      {sym:'H',x:-0.47,y:-0.33,z:0.81},
      {sym:'H',x:-0.47,y:-0.33,z:-0.81}
    ],
    bonds:[[0,1,1],[0,2,1],[0,3,1]]
  },
  // Methane — tetrahedral 109.5°
  'CH4': {
    atoms:[
      {sym:'C',x:0,y:0,z:0},
      {sym:'H',x:0.629,y:0.629,z:0.629},
      {sym:'H',x:-0.629,y:-0.629,z:0.629},
      {sym:'H',x:-0.629,y:0.629,z:-0.629},
      {sym:'H',x:0.629,y:-0.629,z:-0.629}
    ],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]
  },
  // Ethylene C2H4 — planar
  'C2H4': {
    atoms:[
      {sym:'C',x:-0.67,y:0,z:0},{sym:'C',x:0.67,y:0,z:0},
      {sym:'H',x:-1.24,y:0.93,z:0},{sym:'H',x:-1.24,y:-0.93,z:0},
      {sym:'H',x:1.24,y:0.93,z:0},{sym:'H',x:1.24,y:-0.93,z:0}
    ],
    bonds:[[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]]
  },
  // Acetylene — linear
  'C2H2': {
    atoms:[
      {sym:'H',x:-1.66,y:0,z:0},{sym:'C',x:-0.6,y:0,z:0},
      {sym:'C',x:0.6,y:0,z:0},{sym:'H',x:1.66,y:0,z:0}
    ],
    bonds:[[0,1,1],[1,2,3],[2,3,1]]
  },
  // Ethane — staggered
  'C2H6': {
    atoms:[
      {sym:'C',x:-0.77,y:0,z:0},{sym:'C',x:0.77,y:0,z:0},
      {sym:'H',x:-1.15,y:1.02,z:0},{sym:'H',x:-1.15,y:-0.51,z:0.88},{sym:'H',x:-1.15,y:-0.51,z:-0.88},
      {sym:'H',x:1.15,y:-1.02,z:0},{sym:'H',x:1.15,y:0.51,z:0.88},{sym:'H',x:1.15,y:0.51,z:-0.88}
    ],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1]]
  },
  // CO2 — linear O=C=O
  'CO2': {
    atoms:[{sym:'O',x:-1.16,y:0,z:0},{sym:'C',x:0,y:0,z:0},{sym:'O',x:1.16,y:0,z:0}],
    bonds:[[0,1,2],[1,2,2]]
  },
  // CO — triple bond
  'CO': {
    atoms:[{sym:'C',x:-0.56,y:0,z:0},{sym:'O',x:0.56,y:0,z:0}],
    bonds:[[0,1,3]]
  },
  // SF6 — octahedral
  'SF6': {
    atoms:[
      {sym:'S',x:0,y:0,z:0},
      {sym:'F',x:1.56,y:0,z:0},{sym:'F',x:-1.56,y:0,z:0},
      {sym:'F',x:0,y:1.56,z:0},{sym:'F',x:0,y:-1.56,z:0},
      {sym:'F',x:0,y:0,z:1.56},{sym:'F',x:0,y:0,z:-1.56}
    ],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[0,5,1],[0,6,1]]
  },
  // PCl5 — trigonal bipyramidal
  'PCl5': {
    atoms:[
      {sym:'P',x:0,y:0,z:0},
      {sym:'Cl',x:2.02,y:0,z:0},
      {sym:'Cl',x:-1.01,y:0,z:1.75},
      {sym:'Cl',x:-1.01,y:0,z:-1.75},
      {sym:'Cl',x:0,y:2.14,z:0},
      {sym:'Cl',x:0,y:-2.14,z:0}
    ],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[0,5,1]]
  },
  // Benzene — planar hexagon (aromatic)
  'C6H6': {
    atoms:(function(){
      const R=1.4, RH=2.48;
      const a=[]; for(let i=0;i<6;i++){const t=i*Math.PI/3; a.push({sym:'C',x:R*Math.cos(t),y:R*Math.sin(t),z:0});}
      for(let i=0;i<6;i++){const t=i*Math.PI/3; a.push({sym:'H',x:RH*Math.cos(t),y:RH*Math.sin(t),z:0});}
      return a;
    })(),
    bonds:(function(){
      const b=[]; for(let i=0;i<6;i++){ b.push([i,(i+1)%6, i%2===0?2:1]); b.push([i,i+6,1]); } return b;
    })()
  },
  // Sulfuric acid H2SO4 — tetrahedral S
  'H2SO4': {
    atoms:[
      {sym:'S',x:0,y:0,z:0},
      {sym:'O',x:1.42,y:0.35,z:0.35},
      {sym:'O',x:-1.42,y:0.35,z:-0.35},
      {sym:'O',x:0.35,y:-1.42,z:0.35},
      {sym:'O',x:-0.35,y:1.42,z:-0.35},
      {sym:'H',x:1.0,y:-1.9,z:0.6},
      {sym:'H',x:-1.0,y:1.9,z:-0.6}
    ],
    bonds:[[0,1,2],[0,2,2],[0,3,1],[0,4,1],[3,5,1],[4,6,1]]
  },
  // Sodium chloride crystal fragment — face of the rock-salt lattice
  'NaCl': {
    atoms:(function(){
      const a=[]; const N=2, d=2.82;
      for(let i=0;i<=N;i++) for(let j=0;j<=N;j++) for(let k=0;k<=N;k++){
        const parity=(i+j+k)%2;
        a.push({sym: parity===0?'Na':'Cl', x:(i-N/2)*d, y:(j-N/2)*d, z:(k-N/2)*d});
      }
      return a;
    })(),
    bonds:(function(){
      const N=2, d=2.82, size=N+1, tol=0.1;
      const b=[]; const total=size**3;
      for(let a=0;a<total;a++){ for(let bb=a+1;bb<total;bb++){
        // Only bond nearest neighbors along axes
        const ax=a%size, ay=Math.floor(a/size)%size, az=Math.floor(a/(size*size));
        const bx=bb%size, by=Math.floor(bb/size)%size, bz=Math.floor(bb/(size*size));
        const dx=ax-bx, dy=ay-by, dz=az-bz;
        if(dx*dx+dy*dy+dz*dz===1) b.push([a,bb,1]);
      }}
      return b;
    })()
  },
  // Diamond fragment C - tetrahedral network (small chunk)
  'C_diamond': {
    atoms:[
      {sym:'C',x:0,y:0,z:0},
      {sym:'C',x:1,y:1,z:1},{sym:'C',x:-1,y:-1,z:1},{sym:'C',x:-1,y:1,z:-1},{sym:'C',x:1,y:-1,z:-1},
      {sym:'C',x:2,y:2,z:0},{sym:'C',x:2,y:0,z:2},{sym:'C',x:0,y:2,z:2}
    ],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1]]
  },
  // Iron(III) oxide Fe2O3 - simplified corundum unit
  'Fe2O3': {
    atoms:[
      {sym:'Fe',x:-1.4,y:0,z:0},{sym:'Fe',x:1.4,y:0,z:0},
      {sym:'O',x:0,y:1.2,z:0},{sym:'O',x:0,y:-1.2,z:0},{sym:'O',x:0,y:0,z:1.3}
    ],
    bonds:[[0,2,1],[0,3,1],[0,4,1],[1,2,1],[1,3,1],[1,4,1]]
  }
};


/* ================ FALLBACK EXTENDED DATA GENERATOR ================ */
function generateFallbackExt(el){
  const lang = window.CURRENT_LANG || 'en';
  // Phase heuristic
  let phase = 'solid';
  if(['H','N','O','F','Cl','Ar','Ne','He','Kr','Xe','Rn'].includes(el.symbol)) phase='gas';
  else if(['Br','Hg'].includes(el.symbol)) phase='liquid';

  // Uses fallback per category
  const uses_en = (CATEGORY_USES.en[el.category]||'').replace(/element/, el.name_en);
  const uses_zh = (CATEGORY_USES['zh-CN'][el.category]||'').replace(/元素/, el.name_zh);

  // Discovery
  const disc = DISCOVERY[el.Z];
  const discovery = disc ? { year: disc[0], who: disc[1] } : null;

  // Isotopes: one representative
  const massNum = Math.round(el.mass);
  const isotopes = [{
    s: `${massNum}${el.symbol}`,
    ab: el.radioactive===2 ? '—' : '≈100%',
    stable: el.radioactive===0,
    note: el.radioactive===0 ? '' : (el.radioactive===1 ? (lang==='zh-CN'?'具有天然放射性':'naturally radioactive') : (lang==='zh-CN'?'人工合成同位素':'artificially synthesized'))
  }];

  // Reactions by category
  const rxGen = CATEGORY_REACTIONS[el.category];
  const reactions = (rxGen && el.radioactive!==2) ? rxGen(el.symbol) : [];

  return { phase, uses_en, uses_zh, discovery, isotopes, reactions };
}

