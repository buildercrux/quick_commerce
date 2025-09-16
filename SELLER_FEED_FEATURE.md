# Seller Feed Feature

This document describes the new seller-specific feed page that provides an Instagram-like shopping experience.

## Overview

When users click on "nearby sellers" from the homepage, they are now directed to a seller-specific feed page (`/seller/:sellerId/feed`) that displays products in a social media-style layout.

## UI Structure

The seller feed page follows the exact structure you specified:

### Document Structure
```
├── Header (sticky, z-40, shadow-sm, bg-white/80 backdrop-blur)
│   ├── TopBar (64px)
│   │   • Logo (left)
│   │   • Primary-menu items (WOMEN, MEN, KIDS, …) centered
│   │   • Utility icons (Scrapbook ✎, Search 🔍, Cart 🛒, Profile 👤) right-aligned
│   └── SubMenuBar (48px)
│       Horizontal list with underline-on-active (WOMEN | MEN | GIRLS | BOYS)
├── StoryScroller (horizontal, snap-x, overflow-x-auto, py-4)
│   • Circular avatars (72px) with label below
│   • Avatar ring color = primary (#3B82F6) when active
│   • Items: MY FEED, KURTAS, TOPS, DRESSES, SAREES, …
├── HeroBannerCarousel (2 responsive banners side-by-side ≥1024px, one-by-one on mobile)
└── ProductMasonryGrid
    • 4-column Masonry on ≥1280px, 3 on ≥1024px, 2 on ≥640px, 1 on <640px
    • Card anatomy:
      Header: "By {SellerName}" + 32px avatar
      Main: large primary image (100% width)
      Side thumbnails: 4 small imgs stacked right; last cell shows "+23" overlay if more
      Footer: Product title (uppercase, 12px tracking-wide)
      ♥ wishlist | ⇪ share icons
```

## Components Created

### 1. Header.jsx
- **Location**: `client/src/components/seller/Header.jsx`
- **Features**: 
  - Sticky header with backdrop blur
  - TopBar (64px) with logo, menu items, and utility icons
  - SubMenuBar (48px) with category navigation
  - Mobile-responsive design

### 2. StoryScroller.jsx
- **Location**: `client/src/components/seller/StoryScroller.jsx`
- **Features**:
  - Horizontal scrolling with snap behavior
  - Circular avatars (72px) with labels
  - Active state with primary color ring
  - Auto-scroll to active item

### 3. BannerCarousel.jsx
- **Location**: `client/src/components/seller/BannerCarousel.jsx`
- **Features**:
  - Auto-slides every 4 seconds
  - Swipeable on mobile
  - Navigation arrows on hover
  - Dot indicators
  - Responsive design (2 banners on desktop, 1 on mobile)

### 4. ProductCard.jsx
- **Location**: `client/src/components/seller/ProductCard.jsx`
- **Features**:
  - Seller info header with avatar
  - Main image with side thumbnails (desktop)
  - "+N" overlay for additional images
  - Wishlist and share functionality
  - Price and like count display
  - Hover animations

### 5. MasonryGrid.jsx
- **Location**: `client/src/components/seller/MasonryGrid.jsx`
- **Features**:
  - CSS-based masonry layout
  - Responsive columns (1-4 based on screen size)
  - Framer Motion animations
  - Staggered item animations

### 6. SellerFeedPage.jsx
- **Location**: `client/src/pages/SellerFeedPage.jsx`
- **Features**:
  - Main page component combining all sub-components
  - API integration for real data
  - Loading and error states
  - Scroll-to-top functionality

## API Integration

### API Integration
- **Products Endpoint**: `GET /api/v1/products/seller/:sellerId?limit=50`
- **Access**: Public
- **Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 2500,
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "public_id": "ecom-multirole/...",
          "isPrimary": true
        }
      ],
      "sales": {
        "count": 42,
        "total": 105000
      }
    }
  ],
  "seller": {
    "id": "seller_id",
    "name": "Seller Name",
    "sellerName": "Store Name",
    "email": "seller@example.com",
    "phone": "1234567890",
    "address": {
      "street": "Street Address",
      "city": "City",
      "state": "State",
      "pincode": "123456"
    }
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "pages": 1
  }
}
```

### Data Transformation
The frontend transforms the API response to match the UI structure:
- **Banners & Stories**: Currently using mock data (can be replaced with real data from database)
- **Products**: Transformed from API response to match ProductCard component expectations
- **Seller Info**: Used for product cards and first story (MY FEED)

## Routing

### New Routes Added
- `/seller/:sellerId/feed` - Seller feed page

### Updated Routes
- Nearby sellers now link to feed page instead of regular seller page
- Regular seller page includes "View Feed" button

## Styling

### CSS Classes Added
- `.masonry-grid` - CSS-based masonry layout
- `.masonry-item` - Individual masonry items
- Responsive breakpoints for different column counts

### Design Tokens
- Primary color: `#3B82F6`
- Neutral-100: `#F5F5F5`
- Card background: `#FFFFFF` (dark: `#1F2937`)
- Border radius: `0.5rem`
- Font: `'Inter', sans-serif`

## Interaction Patterns

1. **Header**: Stays fixed; rest scrolls
2. **StoryScroller**: Click sets active & scrolls into view (CSS scroll-snap)
3. **Banner Carousel**: Auto-slides every 4s; swipable on mobile
4. **Masonry Grid**: Uses CSS columns; fade-in items via Framer Motion
5. **Wishlist**: Toggles local state then debounced API call
6. **Share**: Opens native Share API (fallback: copy link)

## Responsiveness

- **≥1280px**: 4-column masonry
- **≥1024px**: 3-column masonry, 2 banners side-by-side
- **≥640px**: 2-column masonry
- **<640px**: 1-column masonry, 1 banner, side thumbnails hidden

## Accessibility

- All buttons have `aria-label`
- Story items are not buttons (use click handlers)
- Image elements include alt text
- Focus management for keyboard navigation

## Usage

1. Navigate to homepage
2. Click "Get My Location" or "Test with Delhi" in Nearby Sellers section
3. Click on any seller card
4. You'll be taken to the seller's feed page with the Instagram-like layout

## Future Enhancements

- Real-time product updates
- Category-based filtering
- Infinite scroll for products
- Real banner management
- Story management system
- Advanced search and filtering
