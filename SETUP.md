# VSTRA Setup Guide

## Fixed Issues

✅ **Navbar visibility** - Now adapts colors based on scroll position (white on scroll, transparent on hero)
✅ **Product cards** - Fixed white-on-white issue with proper backgrounds and shadows
✅ **Category cards** - Enhanced gradient overlays for better text visibility
✅ **Lookbook gallery** - Improved hover states and contrast
✅ **Scroll conflicts** - Removed Locomotive Scroll, using native smooth scrolling with GSAP

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What Was Fixed

1. **Navbar**: Dynamic color scheme that changes on scroll
   - Transparent with white text on hero
   - White background with black text when scrolled

2. **Featured Products**: 
   - Added gray background to image containers
   - Added shadow effects
   - Fixed hover animations to use CSS transitions instead of nested motion
   - Ensured text is always black on light background

3. **Categories**:
   - Enhanced gradient overlays (black to transparent)
   - Better text contrast with white text on dark gradient
   - Smooth hover transitions

4. **Lookbook**:
   - Simplified animations
   - Better hover states with proper contrast
   - White button on dark overlay for visibility

5. **Scroll System**:
   - Removed Locomotive Scroll to prevent conflicts
   - Using native CSS smooth scrolling
   - GSAP ScrollTrigger works perfectly now

## Performance Tips

- All images load from Unsplash CDN
- Animations are GPU-accelerated
- Smooth 60fps scrolling
- Optimized bundle size

## Browser Testing

Test in:
- Chrome/Edge (recommended)
- Firefox
- Safari

Enjoy your premium VSTRA landing page! 🚀
