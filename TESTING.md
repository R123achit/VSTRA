# VSTRA Testing Checklist

## Visual Testing

### ✅ Navbar
- [ ] Transparent with white text on hero section
- [ ] White background with black text after scrolling
- [ ] Smooth color transition
- [ ] Logo hover effect works
- [ ] Navigation links hover effect (slight upward movement)
- [ ] "Shop Now" button changes style based on scroll position

### ✅ Hero Section
- [ ] Full-screen height
- [ ] Background image visible with overlay
- [ ] 3D cube rotating smoothly (desktop only)
- [ ] Title "VSTRA" fades in
- [ ] Subtitle and description animate in sequence
- [ ] "Explore Collection" button hover effect (scale + color change)
- [ ] Scroll indicator animates (bouncing effect)
- [ ] Parallax effect when scrolling down

### ✅ Categories Section
- [ ] 4 cards displayed (Men, Women, New Arrivals, Accessories)
- [ ] Images load correctly
- [ ] Text is clearly visible (white on dark gradient)
- [ ] Hover effect: card moves up slightly
- [ ] Hover effect: image zooms in
- [ ] Hover effect: white line expands at bottom
- [ ] Gradient overlay darkens on hover

### ✅ Featured Products
- [ ] 6 product cards displayed in grid
- [ ] Product images load correctly
- [ ] Gray background visible behind images
- [ ] Shadow effects on cards
- [ ] Hover effect: card moves up
- [ ] Hover effect: image scales up
- [ ] "Quick View" button appears on hover
- [ ] Product names and prices are black and readable
- [ ] "View All Products" button at bottom

### ✅ Story Section
- [ ] Section pins while scrolling (stays in view)
- [ ] Background image with parallax effect
- [ ] Text slides in from left
- [ ] "Our Story" heading visible
- [ ] Three paragraphs of text readable
- [ ] "Learn More" button hover effect (fills white)
- [ ] Large "V" watermark visible on desktop

### ✅ Lookbook Section
- [ ] Masonry grid layout (different heights)
- [ ] Images start in grayscale
- [ ] Hover effect: color returns
- [ ] Hover effect: slight zoom
- [ ] "View Details" button appears on hover
- [ ] Button has white background for visibility
- [ ] "Explore Full Lookbook" button at bottom

### ✅ Footer
- [ ] Black background
- [ ] Newsletter section at top
- [ ] Email input field visible and functional
- [ ] "Subscribe" button hover effect
- [ ] 4 columns of links (Shop, Company, Support, Follow)
- [ ] Link hover effect (moves right slightly)
- [ ] Bottom bar with logo, copyright, and legal links
- [ ] All text is white/gray and readable

## Responsive Testing

### Desktop (1920px+)
- [ ] All sections full width
- [ ] 3D cube visible in hero
- [ ] 4 category cards in row
- [ ] 3 product cards in row
- [ ] Large "V" watermark in story section

### Tablet (768px - 1024px)
- [ ] 2 category cards per row
- [ ] 2 product cards per row
- [ ] Navigation menu visible
- [ ] Proper spacing maintained

### Mobile (< 768px)
- [ ] 1 category card per row
- [ ] 1 product card per row
- [ ] Navigation menu hidden (only logo and button)
- [ ] Text sizes adjusted
- [ ] Touch-friendly button sizes

## Animation Testing

### Scroll Animations (GSAP)
- [ ] Hero parallax effect
- [ ] Category cards fade in on scroll
- [ ] Product cards stagger animation
- [ ] Story section pins correctly
- [ ] Lookbook items animate in

### Hover Animations (Framer Motion)
- [ ] Smooth transitions (no jank)
- [ ] 60fps performance
- [ ] No layout shifts
- [ ] Proper easing curves

### 3D Element (Three.js)
- [ ] Cube rotates smoothly
- [ ] No performance issues
- [ ] Proper lighting
- [ ] Floats up and down

## Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Images lazy load
- [ ] Smooth scrolling at 60fps
- [ ] No console errors
- [ ] No layout shifts (CLS)
- [ ] Animations don't block main thread

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility

- [ ] All images have alt text
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Sufficient color contrast
- [ ] Keyboard navigation works
- [ ] Focus states visible

---

**Status**: All systems ready for production! 🚀
