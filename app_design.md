# Web Application Design Document

## Application Overview
A comprehensive multi-tool web application with animated interface featuring:
1. Token Checker
2. CPU Monitor with usage statistics
3. Facebook Post UID Fetcher
4. Uptime Bot (100 days non-stop)
5. Admin Contact Information

## Architecture Design

### Frontend Structure
- **Login System**: Username: "Lucifer", Password: "Lucifer"
- **Welcome Animation**: "Welcome to my tool" text with background animations
- **Navigation**: Animated menu to access different tools
- **Background Images**: Rotating backgrounds using provided anime-style images
- **Responsive Design**: Mobile and desktop compatibility

### Backend Structure
- **Flask Application**: Main server handling all API endpoints
- **Database**: SQLite for storing usage statistics and uptime data
- **Background Tasks**: Threading for continuous monitoring
- **API Endpoints**:
  - `/api/token-check` - Token validation
  - `/api/cpu-monitor` - CPU usage statistics
  - `/api/facebook-posts` - Fetch post UIDs
  - `/api/uptime-status` - Uptime bot status
  - `/api/admin-info` - Admin contact details

### Tool Specifications

#### 1. Token Checker
- Input: Access token
- Output: Token validity, expiration, permissions
- Features: Real-time validation, error handling

#### 2. CPU Monitor
- Tracks: CPU usage, memory usage, disk space
- Statistics: Daily, weekly, monthly usage
- Features: Real-time graphs, historical data

#### 3. Facebook Post UID Fetcher
- Input: Facebook access token
- Output: All post UIDs from the connected account
- Features: Pagination, export options

#### 4. Uptime Bot
- Target: 100 days continuous operation
- Monitoring: Server status, response times
- Features: Status dashboard, alerts

#### 5. Admin Contact
- Facebook: https://www.facebook.com/muddassir.OP
- WhatsApp: +923243037456
- Features: Direct contact links, social media integration

## UI/UX Design

### Color Scheme
- Primary: Dark theme with neon accents
- Background: Animated gradients with anime character overlays
- Text: White/cyan for readability
- Buttons: Gradient hover effects

### Animation Features
- Welcome screen with typewriter effect
- Smooth page transitions
- Loading animations
- Background particle effects
- Hover animations on buttons and cards

### Layout Structure
```
Header: Logo + Navigation + Admin Contact
Main Content: Tool-specific interfaces
Sidebar: Quick access menu
Footer: Copyright + Social links
```

## Deployment Configuration
- Platform: Render.com
- Configuration: Non-stop operation without sleeping
- Environment: Python Flask + Static files
- Database: Persistent storage for statistics

