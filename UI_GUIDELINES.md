# UI Guidelines

## Design Philosophy

Mobile-first, action-first, distraction-free.

## Core Principles

### 1. Mobile-First
- Every screen is designed for a 375px viewport first, then scales up.
- Bottom navigation (mobile) → sidebar navigation (desktop).
- Touch targets are minimum 44×44px.
- No hover-dependent interactions.

### 2. Large Touch Targets
- Buttons: minimum 48px height.
- List items: minimum 52px height.
- Form inputs: minimum 48px height.
- Adequate spacing between interactive elements (min 8px).

### 3. Minimal Navigation
- One primary action per screen.
- Bottom tab bar with 5–6 core sections.
- Secondary actions in a floating action button (FAB) or sheet.
- Back navigation via swipe gesture or top-left button.

### 4. Fast Search
- Global command palette (Cmd+K / Ctrl+K) accessible from any screen.
- Search results appear within 200ms (mock data).
- Fuzzy matching on names, SKUs, phone numbers.

### 5. Action-First Design
- The most common action on each screen is the most prominent element.
- Secondary actions are in a "More" menu (three dots).
- Confirmation dialogs for destructive actions.
- Toast notifications for success/error feedback.

## Visual Style

- **Typography:** System font stack (fast loading, native feel).
- **Color palette:** Clean neutrals with a single accent color (blue).
- **Status colors:** Green (success/completed), Amber (pending/warning), Red (error/cancelled), Blue (info/in-progress).
- **Cards:** White cards with subtle shadows on light mode; dark surfaces on dark mode.
- **Spacing:** 4px grid, generous padding (16px as base unit).
- **Border radius:** 8px for cards, 6px for buttons/inputs.

## Component Patterns

| Pattern | Usage |
|---------|-------|
| Cards | Dashboard widgets, product cards, summary panels |
| Data tables | Inventory list, purchase orders, transaction history |
| Bottom sheet | Filters, quick actions, form selection |
| Dialog | Confirmations, create/edit forms (small) |
| Full-page form | Large forms (new product, new purchase) |
| Badge | Status indicators, stock levels |
| Command palette | Global search, quick navigation |
| Skeleton loader | Initial page load states |

## States Every Component Must Handle

1. **Loading** — Skeleton or spinner shown immediately (no blank screen).
2. **Empty** — Illustration + message + CTA (not just "No data").
3. **Error** — Friendly message + retry button (no raw error codes).
4. **Success** — Toast or inline confirmation.
5. **Edge** — Long names, missing images, zero quantities.

## Dark Mode

- Supported via Tailwind's `dark:` variant and `prefers-color-scheme`.
- Both modes look identical in structure — only colors change.
- No loss of information in either mode.

## Accessibility Minimum

- All interactive elements are keyboard accessible.
- Form inputs have associated labels.
- Color is never the only indicator of state.
- Touch targets meet 44×44px minimum.
