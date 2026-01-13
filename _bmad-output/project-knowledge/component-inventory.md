# Component Inventory

## UI System (Shadcn/Radix)
Located in `src/components/ui`. Implements the **Lifetrek Brand Book** styles.

| Component | Status | Description |
|-----------|--------|-------------|
| Button | Active | Standard buttons (Primary Blue, Secondary, Outline) |
| Input | Active | Form inputs with focus states |
| Card | Active | Container for content, supports glassmorphism |
| Dialog | Active | Modals and overlays |
| Form | Active | React Hook Form wrappers |
| Toast | Active | Notification system (Sonner) |
| ScrollArea | Active | Custom scrollbars |

## Feature Components

### 3D Visualizations (`src/components/3d`)
- **Canvas Elements**: 3D scenes using `@react-three/fiber`.
- **Equipment Models**: Visual representations of CNC machines.

### Admin Dashboard (`src/components/admin`)
- **CRM Tables**: Lead management and data display.
- **Analytics Cards**: Stat cards and metric visualizations.
- **Content Studio**: LinkedIn and Instagram content generators.

### Sales Tools (`src/components/calculator` & Root)
- **ManufacturingTimeline**: Visual progress of manufacturing capability.
- **EquipmentCarousel**: Showcase of machinery.
- **InteractiveCapabilities**: Feature explorer.
- **TestimonialsCarousel**: Social proof implementation.
- **AIChatbot**: Customer support agent interface.

## Design Tokens (from Brand Book)
- **Colors**: Corporate Blue (`#004F8F`), Innovation Green (`#1A7A3E`), Energy Orange (`#F07818`).
- **Typography**: Inter font family.
- **Effects**: Glassmorphism, Premium Shadows.

*(Note: See `BRAND_BOOK.md` for detailed design specifications)*
