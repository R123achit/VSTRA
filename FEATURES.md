# VSTRA Features Overview

## 🎬 Animations & Interactions

### Scroll Animations (GSAP ScrollTrigger)
```javascript
✓ Hero parallax fade-out on scroll
✓ Category cards stagger animation
✓ Product cards sequential reveal
✓ Story section pinned scrolling
✓ Lookbook masonry fade-in
```

### Hover Effects (Framer Motion + CSS)
```javascript
✓ Navbar links lift on hover
✓ Category cards zoom + lift
✓ Product images scale up
✓ "Quick View" button reveal
✓ Lookbook grayscale to color
✓ Footer links slide right
```

### 3D Graphics (Three.js)
```javascript
✓ Floating cube in hero
✓ Smooth rotation animation
✓ Metallic material with lighting
✓ Responsive to viewport
```

## 🎨 Design System

### Colors
```css
Primary Black: #0a0a0a
Secondary Gray: #1a1a1a
Light Background: #f5f5f5
Pure White: #ffffff
```

### Typography
```css
Font Family: Inter
Weights: 300, 400, 500, 600, 700, 800, 900
Tracking: -0.02em (tight) to 0.1em (wide)
Line Height: 1.2 (headings) to 1.6 (body)
```

### Spacing Scale
```css
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 2rem (32px)
xl: 4rem (64px)
2xl: 8rem (128px)
```

## 📐 Layout Structure

### Hero Section
- Height: 100vh
- Background: Black with image overlay
- Content: Centered vertically & horizontally
- 3D Element: Right side (desktop only)

### Categories
- Grid: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
- Card Height: 500px
- Gap: 1.5rem
- Hover: Lift 10px

### Featured Products
- Grid: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Aspect Ratio: 3:4
- Gap: 2rem
- Hover: Lift 8px

### Story Section
- Height: 100vh
- Pin: Yes (ScrollTrigger)
- Background: Black with parallax image
- Content: Left-aligned, max-width 3xl

### Lookbook
- Grid: 2 cols (mobile) → 3 cols (desktop)
- Auto Rows: 300px
- Masonry: Some items span 2 rows
- Effect: Grayscale → Color

### Footer
- Background: Black
- Padding: 5rem vertical
- Grid: 2 cols (mobile) → 4 cols (desktop)

## 🔧 Component Props & Customization

### Navbar
```javascript
// Scroll threshold for color change
scrollThreshold: 50px

// Colors
transparentBg: 'bg-black/20'
scrolledBg: 'bg-white/95'
```

### Hero
```javascript
// 3D Cube settings
rotation: { x: 0.2, y: 0.3 }
float: { amplitude: 0.3, speed: 0.5 }
material: { metalness: 0.8, roughness: 0.2 }
```

### Categories
```javascript
// Hover effects
liftDistance: -10px
zoomScale: 1.1
lineWidth: 60px
```

### Featured Products
```javascript
// Animation timing
hoverDuration: 0.3s
scaleDuration: 0.7s
buttonDelay: 0.1s
```

## 🚀 Performance Optimizations

### Images
- CDN: Unsplash (optimized delivery)
- Format: WebP with JPEG fallback
- Loading: Lazy (below fold)
- Sizes: Responsive srcset

### Animations
- GPU Acceleration: transform, opacity only
- Will-change: Applied strategically
- RequestAnimationFrame: For 3D rendering
- Debouncing: Scroll events

### Code Splitting
- Dynamic imports: Three.js components
- Route-based: Next.js automatic
- Component-level: React.lazy (if needed)

### Bundle Size
- Next.js: ~85KB (gzipped)
- React: ~40KB (gzipped)
- GSAP: ~50KB (gzipped)
- Framer Motion: ~35KB (gzipped)
- Three.js: ~150KB (gzipped)
**Total**: ~360KB (gzipped) - Excellent for a rich interactive site

## 📱 Responsive Breakpoints

```javascript
// Tailwind breakpoints
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops
```

### Mobile Optimizations
- Touch-friendly buttons (min 44px)
- Simplified animations
- 3D element hidden
- Single column layouts
- Larger text sizes

## 🎯 Key Interactions

### On Page Load
1. Navbar slides down
2. Hero title fades in
3. Subtitle appears
4. CTA button reveals
5. Scroll indicator bounces

### On Scroll
1. Navbar changes color
2. Hero parallax effect
3. Sections reveal sequentially
4. Story section pins
5. Smooth momentum scrolling

### On Hover
1. Cards lift with shadow
2. Images zoom smoothly
3. Buttons change color
4. Links animate
5. Overlays appear

## 🎨 Color Modes (Future Enhancement)

Currently: High contrast black & white
Potential additions:
- Dark mode (already dark!)
- Light mode variant
- Accent color options
- Seasonal themes

---

**VSTRA** — Every detail matters
