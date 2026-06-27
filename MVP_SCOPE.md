# MVP Scope

## What We're Building (v0.1)

A working demo of Inventory + POS, with mock data, no auth, no backend. Enough to show a client and get feedback.

---

## Modules

### 1. Dashboard
- Summary cards: total products, low stock items, today's sales, pending purchases.
- Simple line chart (last 7 days sales).
- Quick-action buttons: New Sale, Add Product, New Purchase.

### 2. Inventory
- Product list with search and filter.
- Columns: Name, SKU, Category, Price, Stock Qty, Status.
- Add / Edit product form (name, SKU, category, price, cost, stock, reorder level).
- Stock status badges: In Stock, Low Stock, Out of Stock.
- Empty state for zero results.

### 3. POS (Point of Sale)
- Product search panel (search by name or SKU).
- Cart with line items, quantity adjustment, removal.
- Subtotal, tax, discount, total calculation.
- Payment selection (Cash, Card, Transfer).
- Sale completion → toast + receipt summary.

### 4. Purchases
- Purchase order list (date, supplier, items, total, status).
- Add purchase order form.
- Status tracking: Pending, Ordered, Received, Cancelled.
- Simple line items with product, qty, unit price.

### 5. Payments
- Payment list (date, type, amount, reference, status).
- Record payment form.
- Types: Sale, Purchase, Expense.
- Status: Completed, Pending, Failed.

### 6. Contacts
- Contact list (name, phone, type, balance).
- Contact types: Customer, Supplier, Both.
- Add / Edit contact form.
- Quick balance display.

### 7. Reports
- Sales report (date range filter, total, list).
- Inventory report (stock levels, value).
- Simple table layout, printable view.

### 8. Clinic Module (Demo)
- Patient list (name, phone, last visit).
- Add patient form.
- Visit recording (date, diagnosis, prescription, fee).
- This demonstrates the modular architecture.

---

## What's NOT in Scope (v0.1)

- ❌ No authentication / user management.
- ❌ No real backend or API.
- ❌ No multi-company / multi-branch support.
- ❌ No invoice printing (PDF).
- ❌ No email / SMS notifications.
- ❌ No complex tax configuration.
- ❌ No payment gateway integration.
- ❌ No barcode scanning.
- ❌ No offline mode.
- ❌ No role-based access control.

---

## Mock Data

All data is seeded from JSON files in `src/data/`. This allows:
- Fast development without backend dependency.
- Consistent demo data across sessions.
- Easy reset by reloading the page.
- Future swap to real API without changing component logic (just replace the data layer).

---

## Demo Flow

1. Open the app → Dashboard shows summary.
2. Browse Inventory → see products, search, add one.
3. Open POS → search products → build cart → complete sale.
4. Check Purchases → see purchase orders.
5. View Reports → see sales data.
6. Explore Clinic module → add patient → record visit.

This flow demonstrates all 8 modules in under 2 minutes.
