# CLAUDE.md - Project Information

## Project Overview
- **Name**: Online Course Platform with YouTube Integration
- **Tech Stack**: HTML5, CSS3, JavaScript (Vanilla), Google OAuth 2.0
- **Hosting**: GitHub Pages
- **Purpose**: Secure video course platform with access control

## Key Features
- Google login authentication
- Single active session per user
- Email-based access control for videos
- Admin dashboard for video management
- Protected YouTube content embedding

## Setup Commands
- Local development server: `npx http-server`

## Access Control
- Admin emails are defined in `js/auth.js` in the `ADMIN_EMAILS` array
- Video access is managed through the admin panel
- Each video has its own list of authorized email addresses

## Data Storage
- Currently using localStorage for data persistence
- In production, this would be replaced with a server-side implementation

## Security Measures
- Content protection via disabled right-click and inspect element
- YouTube videos remain unlisted and are only accessible through the platform
- Session management prevents account sharing