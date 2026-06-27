// ──────────────────────────────────────────────
// Deterministic data generator for Invenos demo
// All data is realistic Pakistani business data
// Architecture: Sales = single source of truth
//              Visits reference Sales (not vice versa)
//              Inventory only changes through Sales/Purchases
// ──────────────────────────────────────────────

import type {
  Product, ProductCategory, ProductPurchase, InventoryTransaction,
  Patient, Visit, Treatment, Prescription, Payment, POSCustomer,
  ActivityEvent, DashboardStats, Sale, CartItem, SaleSummary,
} from '@/types'

// ═══ Seeded pseudo-random ────────────────────
const seed = (s: number) => () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
let rng = seed(42)
function resetRng() { rng = seed(42) }
function rand(min: number, max: number): number { return rng() * (max - min) + min }
function randInt(min: number, max: number): number { return Math.floor(rand(min, max + 1)) }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)] }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5)
  return shuffled.slice(0, n)
}

// ═══ Date helpers ────────────────────────────
const NOW = new Date(2026, 5, 22)
function daysAgo(n: number): string {
  const d = new Date(NOW); d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
function formatDateDisplay(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// ═══ Names ───────────────────────────────────
const maleFirstNames = [
  'Muhammad Usman','Muhammad Ali','Ahmed Raza','Hassan Shah','Hussain Ahmad',
  'Bilal Ahmed','Omar Farooq','Zain Abbas','Tariq Mehmood','Imran Khan',
  'Farhan Ali','Kamran Aslam','Sohail Ahmed','Naveed Iqbal','Asif Mehmood',
  'Faisal Javed','Waqar Younis','Adnan Malik','Junaid Iqbal','Saad Abbas',
  'Rizwan Ahmed','Shahid Ali','Danish Ali','Haroon Rasheed','Khalid Mehmood',
  'Irfan Ullah','Nasir Hussain','Shahbaz Ahmad','Zubair Khan','Sajid Ali',
]
const femaleFirstNames = [
  'Fatima Bibi','Ayesha Khan','Saima Akhtar','Nadia Hussain','Tahir Bibi',
  'Zainab Ali','Khalida Parveen','Nasreen Akhtar','Shabnam Shah','Yasmin Ali',
  'Rabia Khan','Farzana Iqbal','Sadia Mehmood','Bushra Ahmed','Noreen Aslam',
  'Samina Tariq','Shazia Malik','Rukhsana Javed','Parveen Akhtar','Kausar Bibi',
  'Shamim Akhtar','Zubaida Begum','Sakina Hassan','Mariam Ali','Farhat Parveen',
  'Naheed Sultana','Rubina Shaheen','Shahida Parveen','Nargis Fatima','Tahira Jabeen',
  'Farkhanda Ashraf','Riffat Ara','Nazia Iqbal','Hina Khan','Sanaullah Bibi',
  'Habiba Gul','Amina Shah','Sabeen Yousaf','Fariha Riaz','Uzma Khan',
  'Sadia Khalid','Lubna Perveen','Nazneen Chaudhry','Shahnaz Begum','Zareen Fatima',
  'Nasim Akhtar','Fehmeeda Ali','Surraya Jabeen','Raheela Tariq','Shakeela Bibi',
]
const cities = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Gujranwala','Sialkot','Peshawar','Quetta']
const lahoreSectors = ['Gulberg','DHA','Johar Town','Cantt','Model Town','Iqbal Town','Garden Town','Samnabad','Faisal Town','Valencia']
const streetNames = ['Main Boulevard','Street 12','Street 5','Commercial Area','Sector B','Phase 4','Block A','Street 20','Street 8','Near Chowk']
function generateAddress(): string {
  const city = pick(cities)
  if (city === 'Lahore') return `House ${randInt(1, 200)}, ${pick(streetNames)}, ${pick(lahoreSectors)}, ${city}`
  return `House ${randInt(1, 200)}, ${pick(streetNames)}, ${city}`
}
function generatePhone(): string {
  const codes = ['0300','0301','0311','0333','0334','0345','0346','0355','0360','042']
  return `${pick(codes)}-${randInt(1000000, 9999999)}`
}

// ═══ Product definitions ─────────────────────
interface ProductDef {
  name: string; category: string; industry: string; skuPrefix: string
  baseUnit: string
  packaging: { name: string; quantity: number }[]
  purchaseCost: number; salePrice: number
  description: string; supplier: string; lowStockThreshold: number
}
const productDefs: ProductDef[] = [
  // ═══ MEDICINES (15) ═══
  { name:'Amoxil 500mg Capsules', category:'Medicine', industry:'Pharmacy', skuPrefix:'AMX', baseUnit:'Capsule', packaging:[{name:'Strip', quantity:10},{name:'Carton', quantity:100}], purchaseCost:750, salePrice:12, description:'Amoxicillin 500mg — broad-spectrum penicillin antibiotic for bacterial infections.', supplier:'Pfizer Pharma Pakistan', lowStockThreshold:500 },
  { name:'Panadol Extra 500mg', category:'Medicine', industry:'Pharmacy', skuPrefix:'PAN', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:10},{name:'Box', quantity:100},{name:'Carton', quantity:1000}], purchaseCost:4200, salePrice:7, description:'Paracetamol 500mg + caffeine — fast pain relief and fever reducer.', supplier:'GSK Consumer Healthcare', lowStockThreshold:1000 },
  { name:'Brufen 400mg Tablets', category:'Medicine', industry:'Pharmacy', skuPrefix:'BRU', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:10},{name:'Box', quantity:100}], purchaseCost:520, salePrice:8, description:'Ibuprofen 400mg — anti-inflammatory for pain, swelling and fever.', supplier:'Abbott Laboratories', lowStockThreshold:800 },
  { name:'Risek 20mg Capsules', category:'Medicine', industry:'Pharmacy', skuPrefix:'RIS', baseUnit:'Capsule', packaging:[{name:'Strip', quantity:14},{name:'Box', quantity:140}], purchaseCost:2450, salePrice:18, description:'Omeprazole 20mg — for acid reflux, GERD and gastric ulcers.', supplier:'Getz Pharma', lowStockThreshold:280 },
  { name:'Glucophage 850mg Metformin', category:'Medicine', industry:'Pharmacy', skuPrefix:'GLU', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:10},{name:'Box', quantity:50}], purchaseCost:1700, salePrice:10, description:'Metformin 850mg — first-line therapy for Type 2 diabetes.', supplier:'Servier Pakistan', lowStockThreshold:500 },
  { name:'Augmentin 1g Tablets', category:'Medicine', industry:'Pharmacy', skuPrefix:'AUG', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:6},{name:'Carton', quantity:60}], purchaseCost:2460, salePrice:85, description:'Co-amoxiclav 1g — broad-spectrum antibiotic for respiratory & UTIs.', supplier:'Pfizer Pharma Pakistan', lowStockThreshold:180 },
  { name:'Flagyl 400mg Tablets', category:'Medicine', industry:'Pharmacy', skuPrefix:'FLG', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:10},{name:'Box', quantity:100}], purchaseCost:650, salePrice:10, description:'Metronidazole 400mg — for protozoal infections and anaerobic bacteria.', supplier:'Aventis Pharma', lowStockThreshold:400 },
  { name:'Ciprofloxacin 500mg', category:'Medicine', industry:'Pharmacy', skuPrefix:'CIP', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:10},{name:'Box', quantity:100}], purchaseCost:1400, salePrice:20, description:'Ciprofloxacin 500mg — fluoroquinolone antibiotic for wide range of infections.', supplier:'Bayer Pakistan', lowStockThreshold:350 },
  { name:'Lisinopril 10mg Tablets', category:'Medicine', industry:'Pharmacy', skuPrefix:'LIS', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:14},{name:'Box', quantity:140}], purchaseCost:1330, salePrice:11, description:'Lisinopril 10mg — ACE inhibitor for hypertension management.', supplier:'Highnoon Pharma', lowStockThreshold:280 },
  { name:'Rosuvastatin 10mg', category:'Medicine', industry:'Pharmacy', skuPrefix:'ROS', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:14},{name:'Box', quantity:140}], purchaseCost:2940, salePrice:25, description:'Rosuvastatin 10mg — statin for cholesterol management.', supplier:'Atco Pharma', lowStockThreshold:280 },
  { name:'Claritin 10mg (Loratadine)', category:'Medicine', industry:'Pharmacy', skuPrefix:'CLR', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:10},{name:'Box', quantity:100}], purchaseCost:850, salePrice:14, description:'Loratadine 10mg — non-drowsy antihistamine for allergies.', supplier:'Searle Pakistan', lowStockThreshold:300 },
  { name:'Nexium 40mg (Esomeprazole)', category:'Medicine', industry:'Pharmacy', skuPrefix:'NEX', baseUnit:'Capsule', packaging:[{name:'Strip', quantity:14},{name:'Box', quantity:140}], purchaseCost:3640, salePrice:35, description:'Esomeprazole 40mg — proton pump inhibitor for severe acid reflux.', supplier:'Getz Pharma', lowStockThreshold:210 },
  { name:'Klaricid 500mg (Clarithromycin)', category:'Medicine', industry:'Pharmacy', skuPrefix:'KLA', baseUnit:'Tablet', packaging:[{name:'Strip', quantity:10},{name:'Box', quantity:100}], purchaseCost:3200, salePrice:50, description:'Clarithromycin 500mg — macrolide antibiotic for respiratory infections.', supplier:'Abbott Laboratories', lowStockThreshold:200 },
  { name:'Ventolin Inhaler 100mcg', category:'Medicine', industry:'Pharmacy', skuPrefix:'VEN', baseUnit:'Inhaler', packaging:[{name:'Carton', quantity:12}], purchaseCost:3600, salePrice:450, description:'Salbutamol 100mcg inhaler — bronchodilator for asthma relief.', supplier:'GSK Consumer Healthcare', lowStockThreshold:60 },
  { name:'Calpol 250mg Suspension', category:'Medicine', industry:'Pharmacy', skuPrefix:'CAL', baseUnit:'Bottle', packaging:[{name:'Carton', quantity:24}], purchaseCost:4800, salePrice:280, description:'Paracetamol 250mg/5ml — childrens fever and pain relief suspension.', supplier:'Pfizer Pharma Pakistan', lowStockThreshold:48 },

  // ═══ CLINIC SUPPLIES (5) ═══
  { name:'Surgical Gloves (Box of 100)', category:'Clinic Supplies', industry:'Clinic', skuPrefix:'GLV', baseUnit:'Piece', packaging:[{name:'Box', quantity:100},{name:'Case', quantity:1000}], purchaseCost:35000, salePrice:12, description:'Powder-free nitrile examination gloves, latex-free, size medium.', supplier:'Surgical Mart Lahore', lowStockThreshold:1000 },
  { name:'Disposable Syringes 5ml', category:'Clinic Supplies', industry:'Clinic', skuPrefix:'SYR', baseUnit:'Piece', packaging:[{name:'Carton', quantity:500}], purchaseCost:3200, salePrice:10, description:'Sterile 5ml disposable syringes with needle, individually packed.', supplier:'MediTech Supplies', lowStockThreshold:5000 },
  { name:'BP Apparatus Digital', category:'Clinic Supplies', industry:'Clinic', skuPrefix:'BPD', baseUnit:'Piece', packaging:[{name:'Carton', quantity:6}], purchaseCost:10800, salePrice:3500, description:'Automatic digital BP monitor with LCD display and memory.', supplier:'HealthTech Corp Karachi', lowStockThreshold:30 },
  { name:'Face Masks Surgical (50pk)', category:'Clinic Supplies', industry:'Clinic', skuPrefix:'MSK', baseUnit:'Packet', packaging:[{name:'Carton', quantity:50}], purchaseCost:7500, salePrice:250, description:'3-ply surgical face masks with ear loops, blue, ISO certified.', supplier:'SafetyFirst Pakistan', lowStockThreshold:250 },
  { name:'Cotton Roll 500g', category:'Clinic Supplies', industry:'Clinic', skuPrefix:'CTN', baseUnit:'Roll', packaging:[{name:'Carton', quantity:24}], purchaseCost:4800, salePrice:280, description:'Sterile absorbent cotton roll 500g for clinical use.', supplier:'Surgical Mart Lahore', lowStockThreshold:120 },

  // ═══ COSMETICS (10) ═══
  { name:'Fair & Lovely Cream 50g', category:'Cosmetics', industry:'Cosmetics', skuPrefix:'FLC', baseUnit:'Piece', packaging:[{name:'Carton', quantity:24}], purchaseCost:3360, salePrice:220, description:'Multi-vitamin fairness cream, 50g tube — Pakistans No. 1 beauty cream.', supplier:'HUL Pakistan', lowStockThreshold:120 },
  { name:'Ponds White Beauty Cream 50g', category:'Cosmetics', industry:'Cosmetics', skuPrefix:'PND', baseUnit:'Piece', packaging:[{name:'Carton', quantity:24}], purchaseCost:4200, salePrice:290, description:'Vitamin C and SPF 15 day cream for glowing skin.', supplier:'Unilever Pakistan', lowStockThreshold:96 },
  { name:'Sunsilk Shampoo Black Shine 200ml', category:'Cosmetics', industry:'Cosmetics', skuPrefix:'SUN', baseUnit:'Piece', packaging:[{name:'Carton', quantity:36}], purchaseCost:5400, salePrice:220, description:'Sunsilk Black Shine shampoo with keratin + argan oil.', supplier:'Unilever Pakistan', lowStockThreshold:180 },
  { name:'Dabur Amla Hair Oil 200ml', category:'Cosmetics', industry:'Cosmetics', skuPrefix:'DAB', baseUnit:'Piece', packaging:[{name:'Carton', quantity:48}], purchaseCost:4800, salePrice:150, description:'Pure amla hair oil for strength, growth and reduced hair fall.', supplier:'Dabur Pakistan', lowStockThreshold:240 },
  { name:'Vaseline Petroleum Jelly 100ml', category:'Cosmetics', industry:'Cosmetics', skuPrefix:'VAS', baseUnit:'Piece', packaging:[{name:'Carton', quantity:36}], purchaseCost:3240, salePrice:130, description:'100% pure petroleum jelly for dry skin and lip care.', supplier:'Unilever Pakistan', lowStockThreshold:180 },
  { name:'Fair & Lovely Men Face Wash 100g', category:'Cosmetics', industry:'Cosmetics', skuPrefix:'FLM', baseUnit:'Piece', packaging:[{name:'Carton', quantity:24}], purchaseCost:3600, salePrice:220, description:'Oil-control face wash for men with active charcoal.', supplier:'HUL Pakistan', lowStockThreshold:96 },
  { name:'Garnier Micellar Water 125ml', category:'Skincare', industry:'Cosmetics', skuPrefix:'GMW', baseUnit:'Piece', packaging:[{name:'Carton', quantity:24}], purchaseCost:6000, salePrice:350, description:'Micellar cleansing water for makeup removal and face cleansing.', supplier:'Garnier Pakistan', lowStockThreshold:96 },
  { name:'Neutrogena Sunscreen SPF 50 100ml', category:'Skincare', industry:'Cosmetics', skuPrefix:'NGN', baseUnit:'Piece', packaging:[{name:'Carton', quantity:12}], purchaseCost:5400, salePrice:650, description:'Broad spectrum SPF 50 sunscreen, water-resistant for face and body.', supplier:'Neutrogena Pakistan', lowStockThreshold:60 },
  { name:'Olay Regenerist Cream 50g', category:'Skincare', industry:'Cosmetics', skuPrefix:'OLY', baseUnit:'Piece', packaging:[{name:'Carton', quantity:12}], purchaseCost:7200, salePrice:850, description:'Anti-aging day cream with Vitamin B3 and peptides.', supplier:'Procter & Gamble PK', lowStockThreshold:48 },
  { name:'Nivea Body Lotion 400ml', category:'Skincare', industry:'Cosmetics', skuPrefix:'NIV', baseUnit:'Piece', packaging:[{name:'Carton', quantity:18}], purchaseCost:5400, salePrice:450, description:'Aloe Vera and Vitamin E body lotion for dry skin.', supplier:'Beiersdorf Pakistan', lowStockThreshold:72 },

  // ═══ GENERAL RETAIL / GROCERIES (12) ═══
  { name:'Basmati Rice Premium 1kg', category:'Groceries', industry:'Retail', skuPrefix:'BRC', baseUnit:'Gram', packaging:[{name:'1 KG Bag', quantity:1000},{name:'25 KG Bag', quantity:25000}], purchaseCost:3600, salePrice:280, description:'Premium Pakistani basmati rice, long grain, 1kg pack.', supplier:'National Foods', lowStockThreshold:16000 },
  { name:'Cooking Oil 5L Tin', category:'Groceries', industry:'Retail', skuPrefix:'COL', baseUnit:'Liter', packaging:[{name:'Tin', quantity:5},{name:'Carton', quantity:20}], purchaseCost:20800, salePrice:420, description:'Refined vegetable cooking oil, 5-liter tin.', supplier:'Khan & Sons Distributors', lowStockThreshold:100 },
  { name:'Wheat Flour (Atta) 10kg', category:'Groceries', industry:'Retail', skuPrefix:'WFL', baseUnit:'KG', packaging:[{name:'Bag', quantity:10},{name:'50 KG Bag', quantity:50}], purchaseCost:3250, salePrice:85, description:'Fine whole wheat flour (chakki atta) 10kg bag.', supplier:'Flour Mills Pakistan', lowStockThreshold:80 },
  { name:'Sugar 1kg Packet', category:'Groceries', industry:'Retail', skuPrefix:'SGR', baseUnit:'KG', packaging:[{name:'Bag', quantity:50}], purchaseCost:4250, salePrice:130, description:'Refined white sugar, fine grain, 1kg pack.', supplier:'Shakarganj Mills', lowStockThreshold:200 },
  { name:'Tea (Tapal) 200g Packet', category:'Groceries', industry:'Retail', skuPrefix:'TPT', baseUnit:'Packet', packaging:[{name:'Carton', quantity:48}], purchaseCost:4800, salePrice:150, description:'Tapal Family Mixture tea 200g — Pakistans favorite tea.', supplier:'Tapal Tea Pakistan', lowStockThreshold:240 },
  { name:'Nestle Milk Pack 1L', category:'Groceries', industry:'Retail', skuPrefix:'NMP', baseUnit:'Liter', packaging:[{name:'Carton', quantity:12}], purchaseCost:2400, salePrice:280, description:'Nestle UHT Whole Milk 1 liter — long-life.', supplier:'Nestle Pakistan', lowStockThreshold:120 },
  { name:'Eggs (Tray of 30)', category:'Groceries', industry:'Retail', skuPrefix:'EGG', baseUnit:'Piece', packaging:[{name:'Tray', quantity:30},{name:'Carton', quantity:360}], purchaseCost:10800, salePrice:15, description:'Farm-fresh brown eggs, tray of 30.', supplier:'Big Bird Farms', lowStockThreshold:360 },
  { name:'Ketchup 800g Bottle', category:'Groceries', industry:'Retail', skuPrefix:'KCH', baseUnit:'Bottle', packaging:[{name:'Carton', quantity:24}], purchaseCost:4800, salePrice:290, description:'National Tomato Ketchup 800g — thick and rich.', supplier:'National Foods', lowStockThreshold:120 },
  { name:'Mineral Water 1.5L (6-pack)', category:'Groceries', industry:'Retail', skuPrefix:'WTR', baseUnit:'Bottle', packaging:[{name:'Pack', quantity:6},{name:'Carton', quantity:24}], purchaseCost:3600, salePrice:220, description:'Nestle Pure Life mineral water 1.5L, pack of 6 bottles.', supplier:'Nestle Pakistan', lowStockThreshold:192 },
  { name:'Biscuits (LU) 200g', category:'Groceries', industry:'Retail', skuPrefix:'BSC', baseUnit:'Packet', packaging:[{name:'Carton', quantity:48}], purchaseCost:4320, salePrice:130, description:'LU Biscuit assorted 200g pack.', supplier:'Continental Biscuits', lowStockThreshold:240 },
  { name:'Daal Chana 1kg', category:'Groceries', industry:'Retail', skuPrefix:'DAL', baseUnit:'Gram', packaging:[{name:'1 KG Pack', quantity:1000},{name:'25 KG Bag', quantity:25000}], purchaseCost:3600, salePrice:220, description:'Premium chana daal (split chickpeas) 1kg — high quality.', supplier:'National Foods', lowStockThreshold:12000 },
  { name:'Ghee 1kg Tin', category:'Groceries', industry:'Retail', skuPrefix:'GHE', baseUnit:'KG', packaging:[{name:'Tin', quantity:1},{name:'Carton', quantity:12}], purchaseCost:4800, salePrice:580, description:'Pure desi ghee, 1kg tin — made from cows milk.', supplier:'Shan Foods', lowStockThreshold:24 },

  // ═══ MOBILE ACCESSORIES (5) ═══
  { name:'Tempered Glass Screen Guard', category:'Mobile Accessories', industry:'Mobile Shop', skuPrefix:'TGP', baseUnit:'Piece', packaging:[{name:'Box', quantity:100}], purchaseCost:2500, salePrice:40, description:'Universal 9H hardness tempered glass screen protector 0.33mm.', supplier:'Accessories World Lahore', lowStockThreshold:500 },
  { name:'USB-C Braided Cable 1m', category:'Mobile Accessories', industry:'Mobile Shop', skuPrefix:'UCC', baseUnit:'Piece', packaging:[{name:'Box', quantity:50}], purchaseCost:3000, salePrice:90, description:'Braided USB-C to USB-A fast charging cable 1m, nylon.', supplier:'CableKing Pakistan', lowStockThreshold:500 },
  { name:'Earphones 3.5mm Jack', category:'Mobile Accessories', industry:'Mobile Shop', skuPrefix:'EAR', baseUnit:'Piece', packaging:[{name:'Box', quantity:30}], purchaseCost:3000, salePrice:150, description:'Wired in-ear earphones with 3.5mm jack and mic.', supplier:'Accessories World Lahore', lowStockThreshold:300 },
  { name:'Power Bank 10000mAh', category:'Electronics', industry:'Mobile Shop', skuPrefix:'PBK', baseUnit:'Piece', packaging:[{name:'Carton', quantity:12}], purchaseCost:16800, salePrice:2200, description:'Portable power bank 10000mAh, dual USB output, LED indicator.', supplier:'PowerTech Pakistan', lowStockThreshold:60 },
  { name:'Wireless Bluetooth Earbuds', category:'Electronics', industry:'Mobile Shop', skuPrefix:'WBE', baseUnit:'Piece', packaging:[{name:'Carton', quantity:20}], purchaseCost:15000, salePrice:1250, description:'TWS wireless earbuds Bluetooth 5.3, charging case, 24hr battery.', supplier:'TechGadgets Lahore', lowStockThreshold:80 },
]

// ═══ Suppliers & Customers ───────────────────
const uniqueSuppliers = [...new Set(productDefs.map((p) => p.supplier))]
const businessCustomers = [
  { name:'Al-Shifa Pharmacy', phone:'042-35761234' }, { name:'City Medical Store', phone:'042-36889001' },
  { name:'Ahmad Traders', phone:'0300-8245567' }, { name:'Beauty World Cosmetics', phone:'0311-4567890' },
  { name:'Mobile Hub Lahore', phone:'0301-7890123' }, { name:'Khan Surgical Store', phone:'042-37894561' },
  { name:'General Store (Shahbaz)', phone:'0345-1122334' }, { name:'New Lahore Pharma', phone:'0333-4455667' },
  { name:'Rashid & Sons Trading', phone:'0300-9988776' }, { name:'Metro General Store', phone:'042-35778899' },
  { name:'Green Pharmacy', phone:'0311-2233445' }, { name:'Al-Noor Cosmetics', phone:'0346-5678901' },
  { name:'Sialkot Surgical Supply', phone:'0301-3456789' }, { name:'Bismillah Grocers', phone:'0334-7788990' },
  { name:'Sargodha Pharma Distributors', phone:'0300-5566778' },
]

// ═══ Generate Products ──────────────────────
export function generateProducts(): Product[] {
  resetRng()
  return productDefs.map((def, i) => {
    const stockIdx = i % 5
    let baseStock: number; let status: 'in-stock' | 'low-stock' | 'out-of-stock'
    const lt = def.lowStockThreshold
    if (stockIdx === 0) { baseStock = 0; status = 'out-of-stock' }
    else if (stockIdx === 1) { baseStock = randInt(1, Math.max(1, lt - 1)); status = 'low-stock' }
    else { baseStock = randInt(lt * 2, lt * 4); status = 'in-stock' }
    const largestQty = def.packaging.reduce((m, p) => Math.max(m, p.quantity), 0)
    const packaging = def.packaging.map((p) => ({
      name: p.name, quantity: p.quantity,
      purchasePrice: Math.round(def.purchaseCost * (p.quantity / largestQty)),
      salePrice: Math.round(def.salePrice * p.quantity),
    }))
    return {
      id: `prod-${String(i+1).padStart(3,'0')}`, name: def.name,
      sku: `${def.skuPrefix}-${String(i+1).padStart(3,'0')}`, barcode: `8901${String(i+1).padStart(9,'0')}`,
      category: def.category, description: def.description,
      trackInventory: true, baseUnit: def.baseUnit, packaging,
      stockQuantity: baseStock, lowStockThreshold: lt, status,
      createdAt: daysAgo(randInt(90,540)), updatedAt: daysAgo(randInt(0,7)),
      supplier: def.supplier, location: pick(['Shelf A-1','Shelf A-2','Shelf A-3','Shelf B-1','Shelf B-2','Shelf C-1','Shelf C-2','Shelf D-1','Shelf D-2','Shelf E-1','Shelf E-2','Store Back','Store Room','Display Front']),
    }
  })
}

export function generateCategories(products: Product[]): ProductCategory[] {
  const catMap = new Map<string, { count: number; industry: string }>()
  products.forEach((p) => {
    const e = catMap.get(p.category) || { count: 0, industry: '' }
    e.count++; catMap.set(p.category, e)
    const def = productDefs.find((d) => d.category === p.category)
    if (def) e.industry = def.industry
  })
  return Array.from(catMap.entries()).map(([name, data], i) => ({ id: `cat-${i+1}`, name, productCount: data.count, industry: data.industry }))
}

// ═══ Generate Patients (50) ─────────────────
export function generatePatients(): Patient[] {
  resetRng()
  return Array.from({ length: 50 }, (_, i) => {
    const isMale = rng() > 0.5
    return {
      id: `p-${String(i+1).padStart(3, '0')}`,
      name: isMale ? pick(maleFirstNames) : pick(femaleFirstNames),
      phone: generatePhone(), address: generateAddress(),
      gender: isMale ? 'male' : 'female', age: randInt(5, 80),
      registrationDate: daysAgo(randInt(30, 540)),
      bloodGroup: pick(['A+','A-','B+','B-','O+','O-','AB+','AB-']),
      lastVisit: formatDateDisplay(daysAgo(randInt(1, 60))),
    }
  })
}

// ═══ Generate Sales (central transaction) ───
// ~60% POS, ~30% Clinic, ~10% Manual
export function generateSales(products: Product[], patients: Patient[]): Sale[] {
  resetRng()
  const sales: Sale[] = []
  let saleIdx = 0
  const inStockProducts = products.filter((p) => p.status !== 'out-of-stock')

  for (let day = 0; day < 30; day++) {
    const date = daysAgo(day)
    const salesToday = randInt(3, 8)
    for (let s = 0; s < salesToday; s++) {
      saleIdx++
      const invoiceNum = `INV-${String(1000 + saleIdx)}`
      const sourceRoll = rng()
      const source: 'pos' | 'clinic' | 'manual' = sourceRoll < 0.6 ? 'pos' : sourceRoll < 0.9 ? 'clinic' : 'manual'

      // Build items (1-5 per sale)
      const itemCount = randInt(1, 5)
      const items: CartItem[] = []
      let subtotal = 0
      for (let i = 0; i < itemCount; i++) {
        const prod = pick(inStockProducts)
        const pkg = prod.packaging.length > 0
          ? prod.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b) // smallest = sale packaging
          : null
        if (!pkg) continue
        const qty = randInt(1, 10)
        const total = qty * pkg.salePrice
        subtotal += total
        items.push({
          id: `sli-${saleIdx}-${i}`, productId: prod.id, name: prod.name,
          packagingName: pkg.name, packagingQuantity: qty,
          baseUnitQuantity: pkg.quantity, baseQuantity: qty * pkg.quantity,
          unitPrice: pkg.salePrice, total, category: prod.category,
        })
      }

      const discount = randInt(0, 2) === 0 ? 0 : Math.round(subtotal * rand(0.02, 0.08))
      const grandTotal = subtotal - discount

      // Payment — varies by source
      const paymentStatusRoll = rng()
      let amountPaid = 0
      let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid'
      if (source === 'pos') {
        if (paymentStatusRoll < 0.85) { amountPaid = grandTotal; paymentStatus = 'paid' }
        else { amountPaid = Math.round(grandTotal * 0.5); paymentStatus = 'partial' }
      } else if (source === 'clinic') {
        if (paymentStatusRoll < 0.4) { amountPaid = grandTotal; paymentStatus = 'paid' }
        else if (paymentStatusRoll < 0.75) { amountPaid = Math.round(grandTotal * 0.4); paymentStatus = 'partial' }
        else { amountPaid = 0; paymentStatus = 'unpaid' }
      } else {
        if (paymentStatusRoll < 0.7) { amountPaid = grandTotal; paymentStatus = 'paid' }
        else { amountPaid = 0; paymentStatus = 'unpaid' }
      }

      const sale: Sale = {
        id: `sal-${String(saleIdx).padStart(3, '0')}`,
        invoiceNumber: invoiceNum, source, date,
        items, subtotal, discount, grandTotal,
        amountPaid, outstandingBalance: grandTotal - amountPaid, paymentStatus,
        createdBy: 'Dr. Ahmed',
      }

      if (source === 'clinic') {
        sale.patientId = pick(patients).id
      } else {
        sale.customerName = pick(businessCustomers).name
      }

      sales.push(sale)
    }
  }
  return sales
}

// ═══ Generate Visits (linked to clinic sales) ─
export function generateVisits(patients: Patient[], clinicSales: Sale[]): Visit[] {
  resetRng()
  const visits: Visit[] = []
  let visitIdx = 0
  const visitTypes = ['General Consultation', 'Follow-up', 'Medication Review', 'Annual Checkup', 'Vaccination', 'Lab Results Review', 'Specialist Referral']
  const diagnoses = [
    'Seasonal allergies — mild rhinitis', 'Upper respiratory tract infection', 'Hypertension monitoring — stable',
    'Diabetes Type 2 — routine check', 'Acute gastroenteritis', 'Routine health screening',
    'Skin allergy — contact dermatitis', 'Lower back pain — muscular', 'Mild anemia — iron deficiency',
    'Thyroid function monitoring', 'Vitamin D deficiency', 'Chronic cough evaluation',
    'Urinary tract infection', 'Eye strain / dry eyes', 'Joint pain — osteoarthritis',
  ]
  const notesList = [
    'Patient responding well. Continue current regimen. Follow up in 4 weeks.',
    'Prescribed antibiotics. Advised rest and increased fluids. Review in 7 days.',
    'BP 130/85. Lab work ordered for lipid profile. Dietary counseling provided.',
    'Fasting blood sugar 145. HbA1c due. Adjusting medication dosage.',
    'Advised BRAT diet and ORS. Symptoms expected to resolve in 48 hours.',
    'All vitals normal. Routine blood work ordered. Next screening in 6 months.',
    'Topical corticosteroid prescribed. Avoid known triggers. Follow up in 2 weeks.',
    'Muscle relaxant and physiotherapy recommended. Off work for 5 days.',
    'Iron supplements prescribed. Dietary counseling for iron-rich foods.',
    'TSH levels stable. Continue same dosage of levothyroxine. Review in 3 months.',
  ]
  const consultationFees = { 'General Consultation': 2000, 'Follow-up': 1500, 'Medication Review': 1500, 'Annual Checkup': 2500, 'Vaccination': 1000, 'Lab Results Review': 1000, 'Specialist Referral': 2000 }

  // Assign clinic sales to patients
  const salesByPatient = new Map<string, Sale[]>()
  clinicSales.forEach((s) => {
    if (s.patientId) {
      const list = salesByPatient.get(s.patientId) || []
      list.push(s)
      salesByPatient.set(s.patientId, list)
    }
  })

  patients.forEach((patient) => {
    const patientSales = salesByPatient.get(patient.id) || []
    const visitCount = Math.max(randInt(1, 6), patientSales.length)

    for (let v = 0; v < Math.max(visitCount, 1); v++) {
      visitIdx++
      const type = pick(visitTypes)
      const dayOffset = randInt(0, 60)
      const linkedSale = v < patientSales.length ? patientSales[v] : null

      visits.push({
        id: `v-${String(visitIdx).padStart(3, '0')}`,
        patientId: patient.id,
        visitDate: linkedSale ? linkedSale.date : formatDateDisplay(daysAgo(dayOffset)),
        type,
        doctor: 'Dr. Ahmed',
        diagnosis: pick(diagnoses),
        notes: pick(notesList),
        consultationFee: consultationFees[type as keyof typeof consultationFees] || 1500,
        status: 'completed',
        saleId: linkedSale ? linkedSale.id : null,
      })
    }
  })
  return visits
}

// ═══ Generate Treatments ────────────────────
export function generateTreatments(patients: Patient[]): Treatment[] {
  resetRng()
  const treatmentNames = [
    { name:'Hypertension Management', desc:'ACE inhibitor therapy + lifestyle modifications. Regular BP monitoring and dietary counseling.' },
    { name:'Diabetes Type 2 Management', desc:'Metformin therapy, blood sugar monitoring, dietary planning. Target HbA1c under 7%.' },
    { name:'Thyroid Disorder Treatment', desc:'Levothyroxine replacement therapy with regular TSH monitoring and dose adjustment.' },
    { name:'Iron Deficiency Anemia', desc:'Iron supplementation (oral) + dietary counseling for iron-rich foods. Monitor hemoglobin levels.' },
    { name:'Lower Back Pain Therapy', desc:'Muscle relaxants, NSAIDs, physiotherapy sessions. Ergonomic assessment and core strengthening.' },
    { name:'Seasonal Allergy Management', desc:'Antihistamine therapy + avoidance counseling. Emergency plan for severe reactions.' },
    { name:'Vitamin D Supplementation', desc:'High-dose Vitamin D3 supplementation followed by maintenance dose. Sunlight exposure advised.' },
    { name:'Osteoarthritis Management', desc:'NSAIDs, joint protection education, physiotherapy. Weight management and exercise plan.' },
    { name:'Asthma Control Therapy', desc:'Inhaled corticosteroids + bronchodilators as needed. Peak flow monitoring and action plan.' },
    { name:'Gastric Ulcer Treatment', desc:'PPI therapy + H. pylori eradication if present. Dietary modifications and stress management.' },
  ]
  let treatIdx = 0
  const treatments: Treatment[] = []
  pickN(patients, 25).forEach((patient) => {
    treatIdx++
    const t = pick(treatmentNames)
    const isOngoing = rng() > 0.35
    treatments.push({
      id: `t-${String(treatIdx).padStart(3, '0')}`, patientId: patient.id,
      name: t.name, description: t.desc,
      startDate: formatDateDisplay(daysAgo(randInt(20, 120))),
      endDate: isOngoing ? undefined : formatDateDisplay(daysAgo(randInt(1, 15))),
      doctor: 'Dr. Ahmed', status: isOngoing ? 'ongoing' : 'completed',
      progress: isOngoing ? randInt(15, 80) : 100,
    })
  })
  return treatments
}

// ═══ Generate Prescriptions ─────────────────
export function generatePrescriptions(patients: Patient[]): Prescription[] {
  resetRng()
  const meds = [
    { name:'Lisinopril 10mg', dosage:'1 tablet', frequency:'Once daily', duration:'90 days', notes:'Take in the morning. Monitor BP weekly.' },
    { name:'Metformin 500mg', dosage:'1 tablet', frequency:'Twice daily with meals', duration:'90 days', notes:'Take with breakfast and dinner.' },
    { name:'Amoxicillin 500mg', dosage:'1 capsule', frequency:'Three times daily', duration:'7 days', notes:'Complete full course even if symptoms improve.' },
    { name:'Omeprazole 20mg', dosage:'1 capsule', frequency:'Once daily before breakfast', duration:'30 days', notes:'Take 30 min before meal.' },
    { name:'Cetirizine 10mg', dosage:'1 tablet', frequency:'Once daily at bedtime', duration:'14 days', notes:'For allergy symptoms.' },
    { name:'Ibuprofen 400mg', dosage:'1 tablet', frequency:'As needed (max 3 daily)', duration:'5 days', notes:'Take with food to avoid stomach upset.' },
    { name:'Atorvastatin 10mg', dosage:'1 tablet', frequency:'Once daily at night', duration:'90 days', notes:'Take at bedtime. Monitor liver function.' },
    { name:'Levothyroxine 50mcg', dosage:'1 tablet', frequency:'Once daily on empty stomach', duration:'90 days', notes:'Take 30 min before breakfast.' },
    { name:'Salbutamol Inhaler', dosage:'2 puffs', frequency:'As needed (max 4 hourly)', duration:'30 days', notes:'Use for wheezing or shortness of breath.' },
    { name:'Paracetamol 500mg', dosage:'1-2 tablets', frequency:'As needed (max 4 daily)', duration:'5 days', notes:'For fever or body aches.' },
  ]
  let rxIdx = 0
  const prescriptions: Prescription[] = []
  pickN(patients, 30).forEach((patient) => {
    pickN(meds, randInt(1, 4)).forEach((med) => {
      rxIdx++
      prescriptions.push({
        id: `rx-${String(rxIdx).padStart(3, '0')}`, patientId: patient.id,
        medicine: med.name, dosage: med.dosage, frequency: med.frequency, duration: med.duration,
        prescribedBy: 'Dr. Ahmed', date: formatDateDisplay(daysAgo(randInt(1, 90))),
        notes: med.notes, refillable: med.duration === '90 days',
      })
    })
  })
  return prescriptions
}

// ═══ Generate Payments (linked to Sales) ────
export function generatePayments(allSales: Sale[]): Payment[] {
  resetRng()
  const payments: Payment[] = []
  let payIdx = 0
  // Generate payments for sales that are at least partially unpaid
  const payableSales = allSales.filter((s) => s.paymentStatus !== 'paid')

  payableSales.slice(0, 40).forEach((sale) => {
    const paymentCount = sale.amountPaid > 0 ? randInt(0, 1) : randInt(1, 2)
    for (let p = 0; p < paymentCount; p++) {
      payIdx++
      const paymentAmount = Math.round(sale.outstandingBalance / (paymentCount - p))
      payments.push({
        id: `pay-${String(payIdx).padStart(3, '0')}`,
        saleId: sale.id,
        date: daysAgo(randInt(0, 5)),
        amount: paymentAmount,
        method: pick(['cash','cash','cash','card','transfer']),
        reference: `PMT-${String(500 + payIdx)}`,
      })
    }
  })

  // Also generate payments for fully paid sales (record of payment)
  allSales.filter((s) => s.paymentStatus === 'paid').slice(0, 30).forEach((sale) => {
    payIdx++
    payments.push({
      id: `pay-${String(payIdx).padStart(3, '0')}`,
      saleId: sale.id,
      date: sale.date,
      amount: sale.grandTotal,
      method: pick(['cash','cash','card','transfer']),
      reference: `PMT-${String(500 + payIdx)}`,
    })
  })

  return payments
}

// ═══ Generate Purchases ─────────────────────
export function generatePurchases(products: Product[]): ProductPurchase[] {
  resetRng()
  const purchases: ProductPurchase[] = []
  let purIdx = 0
  for (let day = 0; day < 30; day++) {
    const date = daysAgo(day)
    for (let p = 0; p < randInt(2, 4); p++) {
      purIdx++
      const product = pick(products)
      const qty = randInt(1, 20)
      const defaultPkg = product.packaging.length > 0 ? product.packaging.reduce((a, b) => a.quantity > b.quantity ? a : b) : null
      const pkgName = defaultPkg?.name || product.baseUnit
      const pkgQty = defaultPkg?.quantity || 1
      const unitCost = defaultPkg?.purchasePrice || 0
      purchases.push({
        id: `pur-${String(purIdx).padStart(3, '0')}`, productId: product.id, date,
        supplier: pick(uniqueSuppliers),
        packagingName: pkgName, packagingQuantity: qty,
        quantity: qty * pkgQty,
        unitCost, totalCost: qty * unitCost,
        invoiceRef: `PUR-${String(200 + purIdx)}`,
        status: pick(['received','received','received','pending']),
      })
    }
  }
  return purchases
}

// ═══ Generate Inventory Transactions ────────
export function generateTransactions(products: Product[], allSales: Sale[], purchases: ProductPurchase[]): InventoryTransaction[] {
  const txns: InventoryTransaction[] = []
  let txnIdx = 0

  // Sales → outflow
  allSales.slice(0, 60).forEach((sale) => {
    sale.items.forEach((item) => {
      txnIdx++
      const prod = products.find((p) => p.id === item.productId)
      const baseUnit = prod?.baseUnit || 'units'
      txns.push({
        id: `txn-${String(txnIdx).padStart(3, '0')}`,
        productId: item.productId, type: 'sale',
        quantity: -item.baseQuantity, unit: baseUnit,
        packagingName: item.packagingName, packagingQuantity: item.packagingQuantity,
        date: sale.date, reference: sale.invoiceNumber,
        notes: `Sale to ${sale.customerName || 'Clinic visit'}`, user: pick(['Dr. Ahmed', 'Staff', 'Cashier']),
        runningBalance: 0,
      })
    })
  })

  // Purchases → inflow
  purchases.slice(0, 30).forEach((pur) => {
    txnIdx++
    const prod = products.find((p) => p.id === pur.productId)
    const baseUnit = prod?.baseUnit || 'units'
    txns.push({
      id: `txn-${String(txnIdx).padStart(3, '0')}`,
      productId: pur.productId, type: 'purchase', quantity: pur.quantity,
      unit: baseUnit, packagingName: pur.packagingName, packagingQuantity: pur.packagingQuantity,
      date: pur.date, reference: pur.invoiceRef,
      notes: `Purchase from ${pur.supplier}`, user: pick(['Store Manager', 'Dr. Ahmed']),
      runningBalance: 0,
    })
  })

  // Damages → outflow
  pickN(products.filter((p) => p.status !== 'out-of-stock'), 15).forEach((prod) => {
    txnIdx++; const qty = -randInt(5, 50)
    txns.push({
      id: `txn-${String(txnIdx).padStart(3, '0')}`,
      productId: prod.id, type: 'damage', quantity: qty, unit: prod.baseUnit,
      packagingName: prod.baseUnit, packagingQuantity: Math.abs(qty),
      date: daysAgo(randInt(0, 25)), reference: `DAM-${String(300 + txnIdx)}`,
      notes: pick(['Damaged during handling', 'Expired stock removed', 'Damaged in transit', 'Shelf damage write-off']),
      user: pick(['Store Manager', 'Staff']), runningBalance: 0,
    })
  })

  // Consumption → outflow
  pickN(products.filter((p) => ['Groceries', 'Clinic Supplies', 'Cosmetics'].includes(p.category)), 10).forEach((prod) => {
    txnIdx++; const qty = -randInt(10, 200)
    txns.push({
      id: `txn-${String(txnIdx).padStart(3, '0')}`,
      productId: prod.id, type: 'consumption', quantity: qty, unit: prod.baseUnit,
      packagingName: prod.baseUnit, packagingQuantity: Math.abs(qty),
      date: daysAgo(randInt(1, 20)), reference: `CONS-${String(400 + txnIdx)}`,
      notes: pick(['Staff usage', 'Store consumption', 'Sample given to customer', 'Quality testing']),
      user: pick(['Dr. Ahmed', 'Store Manager']), runningBalance: 0,
    })
  })

  // Returns → inflow
  pickN(products, 8).forEach((prod) => {
    txnIdx++; const qty = randInt(2, 20)
    txns.push({
      id: `txn-${String(txnIdx).padStart(3, '0')}`,
      productId: prod.id, type: 'return', quantity: qty, unit: prod.baseUnit,
      packagingName: prod.baseUnit, packagingQuantity: qty,
      date: daysAgo(randInt(1, 15)), reference: `RET-${String(500 + txnIdx)}`,
      notes: pick(['Customer returned — unopened', 'Supplier credit note', 'Defective item replaced']),
      user: pick(['Cashier', 'Store Manager']), runningBalance: 0,
    })
  })

  // Adjustments (can be +/-)
  pickN(products, 6).forEach((prod) => {
    txnIdx++; const qty = rng() > 0.5 ? randInt(5, 30) : -randInt(5, 30)
    txns.push({
      id: `txn-${String(txnIdx).padStart(3, '0')}`,
      productId: prod.id, type: 'adjustment', quantity: qty, unit: prod.baseUnit,
      packagingName: prod.baseUnit, packagingQuantity: Math.abs(qty),
      date: daysAgo(randInt(5, 28)), reference: `ADJ-${String(600 + txnIdx)}`,
      notes: pick(['Inventory count correction', 'System reconciliation', 'Stock take adjustment']),
      user: pick(['Store Manager', 'Dr. Ahmed']), runningBalance: 0,
    })
  })

  return txns
}

// ═══ Generate Dashboard Stats ───────────────
export function generateDashboardStats(products: Product[], allSales: Sale[]): DashboardStats {
  const today = daysAgo(0)
  const yesterday = daysAgo(1)
  const todayRev = allSales.filter((s) => s.date === today).reduce((sum, s) => sum + s.grandTotal, 0)
  const yestRev = allSales.filter((s) => s.date === yesterday).reduce((sum, s) => sum + s.grandTotal, 0)
  const salesTrend = yestRev > 0 ? Math.round(((todayRev - yestRev) / yestRev) * 100) : 12
  const lowStockItems = products.filter((p) => p.status === 'low-stock' || p.status === 'out-of-stock').length
  const stockValue = products.reduce((sum, p) => {
    if (p.packaging.length === 0) return sum + 0
    const avgCost = p.packaging.reduce((s, pkg) => s + (pkg.purchasePrice / pkg.quantity), 0) / p.packaging.length
    return sum + p.stockQuantity * avgCost
  }, 0)
  const pendingPayments = allSales.reduce((sum, s) => sum + s.outstandingBalance, 0)

  return { todaySales: todayRev, pendingPayments, stockValue, lowStockItems, salesTrend, paymentsTrend: -randInt(2, 12) }
}

// ═══ Generate Recent Activity ───────────────
function daysAgoToHuman(dayOffset: number): string {
  if (dayOffset === 0) return 'Just now'
  if (dayOffset === 1) return 'Yesterday'
  if (dayOffset < 7) return `${dayOffset} days ago`
  if (dayOffset < 30) return `${Math.floor(dayOffset / 7)} week${Math.floor(dayOffset / 7) > 1 ? 's' : ''} ago`
  return formatDateDisplay(daysAgo(dayOffset))
}

export function generateRecentActivity(allSales: Sale[]): ActivityEvent[] {
  const recent = allSales.slice(0, 8)
  return recent.map((sale, i) => {
    const daysOff = Math.floor((NOW.getTime() - new Date(sale.date + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
    const customerLabel = sale.customerName || sale.patientId || 'Customer'
    return {
      id: `act-${i+1}`,
      type: i % 3 === 0 ? 'payment' : i % 4 === 0 ? 'purchase' : 'sale',
      title: i % 3 === 0 ? 'Payment Received' : i % 4 === 0 ? 'Purchase Recorded' : 'Sale Created',
      description: i % 3 === 0
        ? `Payment for ${sale.invoiceNumber}`
        : i % 4 === 0
          ? `New stock received for inventory`
          : `Sale to ${customerLabel} — ${sale.items.length} items`,
      timeAgo: daysAgoToHuman(daysOff),
      timestamp: new Date(sale.date + 'T10:00:00'),
      amount: sale.grandTotal,
    }
  })
}

// ═══ Generate POS Customers ─────────────────
export function generatePOSCustomers(): POSCustomer[] {
  return [
    { id: 'cust-0', name: 'Walk-in Customer', phone: '' },
    ...businessCustomers.slice(0, 10).map((c, i) => ({ id: `cust-${i+1}`, name: c.name, phone: c.phone })),
  ]
}

// ═══ Generate Sale Summaries ────────────────
export function generateSaleSummaries(allSales: Sale[], patients: Patient[]): SaleSummary[] {
  const patientMap = new Map(patients.map((p) => [p.id, p.name]))
  return allSales.map((s) => ({
    id: s.id, invoiceNumber: s.invoiceNumber, source: s.source, date: s.date,
    customerName: s.customerName,
    patientName: s.patientId ? patientMap.get(s.patientId) : undefined,
    itemCount: s.items.length, grandTotal: s.grandTotal,
    amountPaid: s.amountPaid, outstandingBalance: s.outstandingBalance, paymentStatus: s.paymentStatus,
  }))
}

// ═══ ALL EXPORTS ────────────────────────────
export const generatedProducts = generateProducts()
export const generatedCategories = generateCategories(generatedProducts)
export const generatedPatients = generatePatients()
export const generatedSales = generateSales(generatedProducts, generatedPatients)
export const generatedPurchases = generatePurchases(generatedProducts)
export const generatedPayments = generatePayments(generatedSales)
export const generatedVisits = generateVisits(generatedPatients, generatedSales.filter((s) => s.source === 'clinic'))
export const generatedTreatments = generateTreatments(generatedPatients)
export const generatedPrescriptions = generatePrescriptions(generatedPatients)
export const generatedTransactions = generateTransactions(generatedProducts, generatedSales, generatedPurchases)
export const generatedDashboardStats = generateDashboardStats(generatedProducts, generatedSales)
export const generatedRecentActivity = generateRecentActivity(generatedSales)
export const generatedPOSCustomers = generatePOSCustomers()
export const generatedSaleSummaries = generateSaleSummaries(generatedSales, generatedPatients)
