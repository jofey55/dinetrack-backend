# Zawadi Inventory Tracker

## Overview

This is a professional restaurant inventory management system designed for Zawadi Center. The application features comprehensive inventory tracking across multiple storage areas (dry storage, cold storage, freezer) with color-coded organization, automated reorder alerts, and PostgreSQL database persistence. The system includes professional branding with the Zawadi logo and enhanced visual design.

**Current Status (July 25, 2025):** Fully functional with complete hierarchical category management system, populated sample data, and working storage areas.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Zawadi Center branded interface with specific brand colors (#3b85db blue, #3349c0 deep blue, #2b2a35 charcoal, #ffb30b yellow), color-coded storage areas, modern gradients, enhanced visual appeal with professional styling and animated interactions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM (fully migrated from in-memory storage)
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API endpoints
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot module replacement with Vite middleware integration
- **Storage**: DatabaseStorage class with comprehensive CRUD operations

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript types and schemas
└── migrations/      # Database migration files
```

## Key Components

### Data Models
- **Storage Areas**: Different storage locations (dry storage, fridge, freezer)
- **Categories**: Organizational sections within storage areas (meats, vegetables, etc.)
- **Inventory Items**: Individual products with quantity tracking and minimum level alerts
- **Order Items**: Suggested reorder list for low stock items
- **Users**: Authentication and user management (schema defined but not fully implemented)

### Core Features
1. **Multi-Storage Management**: Separate pages/sections for different storage areas
2. **Category Organization**: Custom categories within each storage area
3. **Inventory Tracking**: Real-time quantity management with par level monitoring
4. **Auto-Reorder System**: Automatic flagging of items below minimum stock levels
5. **Centralized Ordering**: "Order Now" page aggregating all low-stock items
6. **Dashboard Analytics**: Overview statistics and low stock alerts
7. **Barcode Scanning**: Camera-based barcode scanning for instant inventory updates with ZXing library integration

### Frontend Components
- **Layout System**: Responsive sidebar navigation with mobile support and Zawadi branding
- **Header**: Zawadi-themed header with gradient background, professional logo, and sticky positioning
- **Sidebar**: Dark gradient sidebar with Zawadi colors and animated navigation buttons
- **Dashboard**: Color-coded statistics cards with gradients, hover effects, and Zawadi brand colors
- **Storage Area Views**: Color-themed inventory management per storage location (yellow=dry, blue=cold, purple=freezer) with enhanced headers
- **Inventory Tables**: Interactive tables with color-coded stock status indicators
- **Modals/Forms**: Add new items, categories, and storage areas with Zawadi styling
- **Branding**: Custom Zawadi logo component, authentic brand color palette, and professional animations

## Data Flow

1. **Inventory Updates**: Users update quantities directly in tables → API updates database → React Query invalidates cache → UI updates
2. **Low Stock Detection**: Backend calculates low stock items by comparing current quantity to minimum level → Frontend displays alerts and populates order list
3. **Dashboard Statistics**: Aggregated data calculated server-side → Cached and displayed in dashboard cards
4. **Real-time Sync**: React Query handles background refetching and cache invalidation for consistent data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **express**: Node.js web framework
- **zod**: Runtime type validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling for server
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development
- **Client**: Vite dev server with HMR
- **Server**: tsx with hot reloading
- **Database**: Neon serverless PostgreSQL

### Production Build
- **Client**: Vite builds to `dist/public`
- **Server**: esbuild bundles to `dist/index.js`
- **Database**: Drizzle migrations applied via `drizzle-kit push`

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment flag (development/production)

The application uses a monorepo structure with shared TypeScript types between client and server, enabling type safety across the full stack. The database schema uses UUID primary keys and includes proper foreign key relationships between storage areas, categories, and inventory items.

## Recent Changes (July 25, 2025)

✓ Fixed 404 routing errors by adding Reports page to App.tsx
✓ Resolved database connectivity issues and populated sample inventory data
✓ Implemented complete hierarchical category management system
✓ Added Add Category, Add Subcategory, and Add Item buttons to storage areas
✓ Created proper storage area hierarchy: Storage Areas → Categories → Subcategories → Items
✓ Successfully populated database with 16 sample inventory items across all storage areas
✓ Fixed API routing for inventory items by storage area
✓ All storage areas (Dry Storage, Cold Storage, Freezer) now load properly with real data
✓ Implemented barcode scanning feature with camera integration and ZXing library
✓ Added barcode field to inventory schema and database
✓ Created barcode scanner components with real-time scanning capabilities
✓ Added "Scan Barcode" button to storage area pages for quick inventory updates
✓ Set up barcode data for sample items (Paper Napkins: 123456789012, Ground Beef: 987654321098, Chicken Breast: 555666777888)