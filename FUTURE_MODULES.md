# Future Modules

These modules demonstrate the extensibility of Invenos's modular architecture. Each one can be developed independently as a "plugin" without modifying the core.

---

## 1. Clinic Module (MVP Demo)

Already included in the MVP as a demo of modularity.

**Full version features:**
- Patient records with medical history
- Appointment scheduling
- Prescription management with medicine database
- Lab test tracking
- Follow-up reminders
- Doctor schedule management
- Fee tracking (consultation, procedures)

---

## 2. Mobile Shop (IMEI Tracking)

**Target:** Mobile phone resellers and repair shops.

**Features:**
- IMEI number scanning and tracking
- Phone details (brand, model, color, storage, condition)
- Warranty tracking by IMEI
- Buyback / trade-in pricing
- Repair job tracking linked to IMEI
- Stock valuation with IMEI-level granularity
- Carrier / network lock status

**Why it matters:** Mobile phones are high-value, serialized inventory. Standard inventory tracking isn't enough — you need unit-level tracking.

---

## 3. Cosmetics / Retail Module

**Target:** Beauty product stores, general retail.

**Features:**
- Batch / lot number tracking
- Expiry date management
- Variant management (size, color, fragrance)
- Barcode label printing
- Bundled product support (gift sets)
- Promotional pricing (buy-one-get-one, discounts)

**Why it matters:** Cosmetics have short shelf lives and many variants. This module adds the batch/expiry tracking that generic inventory misses.

---

## 4. Pharmacy Module

**Target:** Medical stores and pharmacies.

**Features:**
- Drug license / registration number tracking
- Expiry date tracking (critical for medicine)
- Batch-level tracking
- Manufacturer / distributor management
- Controlled substance tracking
- Prescription validation
- GST / sales tax on medicine as per government rates
- Maximum retail price (MRP) enforcement

**Why it matters:** Pharmacies have strict regulatory requirements. This module ensures compliance while keeping inventory accurate.

---

## 5. Restaurant / Cafe Module

**Target:** Restaurants, cafes, fast-food outlets, cloud kitchens.

**Features:**
- Table management (floor layout, reservation)
- Menu management (categories, modifiers, combo meals)
- Kitchen display system (KDS) integration
- Dine-in, takeaway, delivery order types
- Split bill, partial payment
- Recipe / ingredient costing
- Stock deduction from recipe (raw material → finished dish)
- Online order integration (WhatsApp, food apps)
- Daily sales summary with covers count

**Why it matters:** Restaurants have a different workflow than retail — table service, recipe costing, and kitchen printing. This adapts the core for F&B.

---

## 6. Wholesale / B2B Module

**Target:** Distributors and wholesalers.

**Features:**
- Customer price tiers (retailer, distributor, dealer)
- Bulk order entry (by case/box/carton)
- Credit limit management
- Due date tracking
- Delivery challan / invoice generation
- Route management for delivery staff
- Payment collection tracking

**Why it matters:** B2B has different pricing, credit, and order patterns than retail. This layer adds wholesale-specific workflows.

---

## Module Architecture

Each module follows the same pattern:

```
src/features/<module>/
├── components/     # Module-specific UI components
├── pages/          # Route-level page components
├── data/           # Mock data (dev) → API calls (prod)
├── types/          # TypeScript types
└── index.ts        # Public API / barrel exports
```

Modules communicate with the core only through well-defined interfaces (types + hooks), never by importing each other's internals.
