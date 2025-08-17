# FM Radio Web App

## Overview

This is a production-ready FM Radio Web App that allows users to browse, search, and stream live radio stations from Bangladesh and India. The application is built as a Progressive Web App (PWA) with mobile-first design, supporting features like offline access, Media Session API integration for lock screen controls, and local storage for favorites management.

The app uses the public Radio Browser API to fetch radio station data and streams audio directly in the browser without server-side proxying. It provides a clean, responsive interface with country-specific filtering, search capabilities, and audio controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for audio playback and favorites management, with React Query for server state
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency

### Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints
- **Development Mode**: Vite middleware integration for hot module replacement
- **Production Build**: Static file serving with esbuild bundling for server code
- **API Structure**: RESTful endpoints for station fetching, search, and favorites management

### Audio System
- **Playback**: Native HTML5 Audio API with custom React context wrapper
- **Media Session**: Integration with browser Media Session API for lock screen controls and metadata display
- **Volume Control**: Client-side volume management with mute functionality
- **Error Handling**: Retry mechanisms and fallback streams for reliable playback

### Data Storage
- **Local Storage**: Browser localStorage for favorites persistence and user preferences
- **Database Ready**: Drizzle ORM configured with PostgreSQL schema for future server-side favorites sync
- **Session Management**: connect-pg-simple for PostgreSQL session storage (when database is added)

### PWA Features
- **Service Worker**: Custom implementation for offline caching of static assets
- **Web App Manifest**: Complete PWA configuration with icons and display settings
- **Install Prompt**: Custom install button with beforeinstallprompt handling
- **Offline Support**: Cached assets and graceful degradation when offline

### External API Integration
- **Radio Browser API**: Community-maintained database of radio stations with multiple mirror support
- **Fallback Strategy**: Multiple API endpoints with automatic failover for reliability
- **Rate Limiting**: Debounced search queries to prevent excessive API calls
- **Error Handling**: Comprehensive error handling with user-friendly messaging

### Development Workflow
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Hot Reload**: Vite development server with React Fast Refresh
- **Path Aliases**: Configured import aliases for clean code organization
- **Build Process**: Optimized production builds with code splitting and asset optimization

## External Dependencies

### Core Framework Dependencies
- **React**: Frontend framework with hooks and context
- **Express.js**: Backend server framework
- **TypeScript**: Type safety and development experience
- **Vite**: Build tool and development server

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with Tailwind integration
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack React Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database toolkit (configured for future use)
- **Zod**: Schema validation for type-safe data handling

### Audio and Media
- **HTML5 Audio API**: Native browser audio playback
- **Media Session API**: Browser integration for media controls
- **Font Awesome**: Additional icons for media controls

### PWA and Performance
- **Workbox**: Service worker utilities for caching strategies
- **Web App Manifest**: PWA configuration for installability

### Development Tools
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **React Hook Form**: Form management with validation
- **Date-fns**: Date utility library for timestamps

### External APIs
- **Radio Browser API**: Public radio station database
  - Primary mirrors: de1.api.radio-browser.info, nl1.api.radio-browser.info, at1.api.radio-browser.info
  - Endpoints: Station search, country filtering, genre filtering
  - No authentication required, community-maintained

### Database (Future)
- **Neon Database**: Serverless PostgreSQL for production (configured but not active)
- **Connection Pooling**: @neondatabase/serverless for edge-compatible database access