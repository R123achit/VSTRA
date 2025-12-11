# Z-Index Layer System for VSTRA

This document defines the z-index layering system to prevent overlap issues.

## Layer Hierarchy (from bottom to top)

### Base Layer (z-index: 0-9)
- Default content
- Background elements

### Content Layer (z-index: 10-39)
- Regular page content
- Cards and sections

### Navigation Layer (z-index: 40-59)
- **z-40**: Scroll to Top button (z-[45])
- **z-40**: Live Chat button (z-[45])
- **z-50**: Navbar (when offers visible, positioned at top: 3rem)
- **z-55**: Comparison Bar (bottom bar)
- **z-55**: Live Chat window (when open)

### Offer Layer (z-index: 60-69)
- **z-60**: Premium Offer System (top banner)
- **z-65**: Newsletter Popup

### Modal Layer (z-index: 70-89)
- **z-70**: Quick View Modal
- **z-70**: Size Guide Modal
- **z-70**: General Modals

### Overlay Layer (z-index: 90-99)
- **z-90**: Toast notifications (react-hot-toast default)

### Critical Layer (z-index: 100+)
- **z-100**: Progress Bar (page loading indicator)
- **z-9998**: Success Modal (checkout)
- **z-9999**: Confetti overlay

## Component Positioning

### Fixed Top Elements
1. **Progress Bar** (z-100) - Always on top during page transitions
2. **Premium Offer System** (z-60) - Top banner with offers
3. **Navbar** (z-50) - Below offer banner, positioned at `top: 3rem` when offers visible

### Fixed Bottom Elements
1. **Comparison Bar** (z-55) - Bottom bar for product comparison
2. **Scroll to Top** (z-45) - Bottom right corner
3. **Live Chat Button** (z-45) - Bottom left corner

### Floating Elements
1. **Live Chat Window** (z-55) - When opened
2. **Newsletter Popup** (z-65) - Centered modal
3. **Quick View** (z-70) - Product quick view
4. **Size Guide** (z-70) - Size chart modal

## Rules

1. **Never use z-index values between layers** - Stick to defined ranges
2. **Modals should always be z-70+** - To appear above navigation
3. **Critical UI (loading, errors) should be z-100+** - Always visible
4. **Offer banner is z-60** - Above navbar but below modals
5. **Navbar adjusts position** - Uses `top` property instead of z-index conflicts

## Offer Banner Behavior

When offers are active:
- Offer banner appears at `top: 0` with `z-index: 60`
- Navbar moves to `top: 3rem` with `z-index: 50`
- Content padding adjusts via `offersBarVisible` state

When offers are dismissed/expired:
- Offer banner disappears
- Navbar returns to `top: 0`
- Content padding adjusts smoothly

## State Management

The `offersBarVisibility` event is dispatched when:
- Offers are loaded/dismissed
- User closes the offer banner
- Offers expire

Components listening to this event:
- Navbar (adjusts top position)
- Page layouts (adjust padding-top)

## Testing Checklist

- [ ] Offer banner appears above navbar
- [ ] Navbar doesn't overlap offer banner
- [ ] Modals appear above everything except progress bar
- [ ] Scroll to top button is accessible
- [ ] Live chat doesn't conflict with comparison bar
- [ ] Newsletter popup appears above navbar
- [ ] Quick view works on all pages
- [ ] Size guide modal is accessible
- [ ] Progress bar visible during navigation
- [ ] Toast notifications visible above modals
