# Zawadi Inventory Tracker

## Overview

This is a professional restaurant inventory management system designed for Zawadi Center. The application features comprehensive inventory tracking across multiple storage areas (dry storage, cold storage, freezer) with color-coded organization, automated reorder alerts, and PostgreSQL database persistence. The system includes professional branding with the Zawadi logo and enhanced visual design.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Color-coded interface with professional branding, enhanced visual appeal with gradients and storage area specific color themes.

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

### Frontend Components
- **Layout System**: Responsive sidebar navigation with mobile support and Zawadi branding
- **Dashboard**: Color-coded statistics overview with gradient cards and visual indicators
- **Storage Area Views**: Color-themed inventory management per storage location (yellow=dry, blue=cold, purple=freezer)
- **Inventory Tables**: Interactive tables with color-coded stock status indicators
- **Modals/Forms**: Add new items, categories, and storage areas
- **Branding**: Custom Zawadi logo component and professional color scheme

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