# Brand Quick Reference Guide
**For Developers & Designers**

## Color Variables (Always Use These!)

### Primary Colors
```css
/* Corporate Blue */
bg-primary text-primary-foreground
hover:bg-primary-hover

/* Innovation Green */
bg-accent text-accent-foreground

/* Energy Orange */
bg-accent-orange text-accent-orange-foreground
```

### Neutral Colors
```css
/* Backgrounds */
bg-background
bg-secondary
bg-muted

/* Text */
text-foreground        /* Main text */
text-muted-foreground  /* Secondary text */

/* Borders */
border-border
```

## Typography Classes

### Headlines
```jsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Hero Title</h1>
<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">Section Title</h2>
<h3 className="text-2xl md:text-3xl font-bold">Subsection Title</h3>
```

### Body Text
```jsx
<p className="text-base leading-relaxed">Regular paragraph</p>
<p className="text-lg leading-relaxed">Large paragraph</p>
<p className="text-muted-foreground">Secondary text</p>
```

## Component Patterns

### Buttons
```jsx
// Primary CTA
<Button variant="default" size="lg">Get Started</Button>

// Secondary Action
<Button variant="secondary" size="lg">Learn More</Button>

// Outline Style
<Button variant="outline" size="lg">View Details</Button>
```

### Cards
```jsx
// Standard Card
<div className="bg-card border rounded-lg p-6 shadow-sm">

// Glass Effect Card
<div className="glass-card p-8 rounded-xl">

// Premium Card
<div className="glass-card-strong p-10 rounded-xl shadow-[var(--shadow-premium)]">
```

### Gradients
```css
/* Hero Background */
bg-[image:var(--gradient-hero)]

/* Premium Background */
bg-[image:var(--gradient-premium)]
```

### Shadows
```css
shadow-[var(--shadow-premium)]    /* Large cards, hero elements */
shadow-[var(--shadow-elevated)]   /* Raised cards */
shadow-[var(--shadow-soft)]       /* Subtle depth */
shadow-[var(--shadow-glass)]      /* Glass effects */
```

### Animations
```jsx
// Fade in
className="animate-fade-in"

// Scroll reveal
className="scroll-reveal"  // Add 'visible' class on scroll

// Stagger animation
className="stagger-item"  // With delay: style={{ transitionDelay: `${index * 100}ms` }}
```

## Brand Voice Cheat Sheet

### Do's ✅
- Professional and confident
- Technical specificity
- Partnership language ("together", "collaborate")
- Focus on quality and precision
- Active voice

### Don'ts ❌
- Casual tone
- Marketing clichés
- Unsupported claims
- Jargon without context
- Passive voice

## Example Copy

### CTA Buttons
✅ "Schedule Consultation"  
✅ "Explore Capabilities"  
✅ "Request Quote"  
❌ "Click Here"  
❌ "Learn More"  

### Headlines
✅ "Engineering Excellence for Healthcare Innovation"  
✅ "Precision CNC Manufacturing for Medical Devices"  
❌ "The Best Manufacturing Ever!"  
❌ "Amazing Quality You Won't Believe"  

## Spacing Scale
```
gap-4   /* 1rem / 16px */
gap-6   /* 1.5rem / 24px */
gap-8   /* 2rem / 32px */
gap-12  /* 3rem / 48px */
gap-16  /* 4rem / 64px */

py-20   /* Section padding mobile */
py-32   /* Section padding desktop */
```

## Breakpoints
```
sm:   640px   /* Mobile landscape */
md:   768px   /* Tablet */
lg:   1024px  /* Desktop */
xl:   1280px  /* Large desktop */
2xl:  1536px  /* Extra large */
```

## Common Patterns

### Hero Section
```jsx
<section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground py-20 sm:py-32 md:py-40">
  <BlobBackground />
  <div className="container mx-auto px-4 sm:px-6 relative z-10">
    <h1 className="font-bold mb-6 animate-fade-in">
      Your Hero Title
    </h1>
    <p className="text-xl md:text-2xl leading-relaxed animate-fade-in opacity-95">
      Your hero description
    </p>
  </div>
</section>
```

### Feature Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature, index) => (
    <div key={index} className="glass-card p-8 rounded-xl hover:scale-105 transition-transform">
      <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  ))}
</div>
```

### CTA Section
```jsx
<section className="py-20 sm:py-32 bg-gradient-to-br from-primary via-primary-hover to-accent text-primary-foreground">
  <div className="container mx-auto px-4 sm:px-6 text-center">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
      Your CTA Headline
    </h2>
    <p className="text-xl mb-8 opacity-95">
      Supporting text
    </p>
    <div className="flex gap-4 justify-center">
      <Button size="lg" variant="secondary">Primary Action</Button>
      <Button size="lg" variant="outline">Secondary Action</Button>
    </div>
  </div>
</section>
```

## Image Guidelines

### Product Images
- Format: WebP (fallback to PNG)
- Max width: 1920px
- Compression: 85% quality
- Alt text: Descriptive and specific

### Facility Photos
- Aspect Ratio: 16:9 or 3:2
- Resolution: Min 1200px width
- Style: Clean, professional, well-lit

### Loading Strategy
```jsx
<img 
  src={image} 
  alt="Descriptive alt text"
  loading="lazy"
  className="rounded-xl shadow-[var(--shadow-premium)]"
/>
```

## Accessibility Checklist

- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] All interactive elements ≥ 44px touch target
- [ ] Semantic HTML (h1, h2, nav, main, etc.)
- [ ] Alt text on all images
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] ARIA labels on icon-only buttons

## Quality Checklist

Before committing code:
- [ ] Used semantic color variables (not hardcoded)
- [ ] Responsive on all breakpoints
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Images optimized and lazy-loaded
- [ ] Animations smooth (60fps)
- [ ] Accessibility requirements met
- [ ] Brand voice guidelines followed
- [ ] Mobile touch targets adequate

---

**Need Help?** Refer to BRAND_BOOK.md for complete guidelines or contact the marketing team.