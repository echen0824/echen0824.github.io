# Online Course Platform with YouTube Integration

A secure online video platform hosted on GitHub Pages with YouTube for content delivery.

## Features

- **Google Authentication**: Secure login using Google OAuth 2.0
- **Single Active Session**: Users can only be logged in from one device at a time
- **Email-Based Access Control**: Videos are only accessible to authorized email addresses
- **Admin Panel**: Easily manage videos and user permissions
- **Content Protection**: Measures to prevent unauthorized access to content
- **YouTube Integration**: Uses unlisted YouTube videos for secure content delivery
- **GitHub Pages Hosting**: Easy deployment and maintenance

## Setup Instructions

### 1. Google OAuth Setup

1. Create a new project in the [Google Developer Console](https://console.developers.google.com/)
2. Enable the Google Sign-In API
3. Create OAuth 2.0 credentials and configure the authorized JavaScript origins
4. Update the client ID in all HTML files (`YOUR_GOOGLE_CLIENT_ID`)

### 2. GitHub Pages Setup

1. Push the code to a GitHub repository
2. Enable GitHub Pages in the repository settings
3. Set the source to the main branch

### 3. YouTube Content

1. Upload your videos to YouTube as unlisted
2. Use the Admin panel to add videos using the YouTube video URLs
3. Grant access to specific user emails for each video

## Development

To run the website locally:

1. Clone the repository
2. Open the `index.html` file in your browser
3. For a more complete experience, use a local server:
   ```
   npx http-server
   ```

## Security Measures

- Google Authentication ensures only registered users can access the platform
- Single active session prevents account sharing
- Right-click and inspect element are disabled to prevent easy content theft
- YouTube videos are unlisted and only accessible through the platform
- Admin capabilities to grant and revoke access as needed

## Administration

This platform uses localStorage for data storage in this demo implementation, making it easy to use with GitHub Pages. In a production environment, you would want to replace the storage mechanisms with a server-side implementation.

To set up admin users:

1. Register with Google authentication 
2. Modify the `ADMIN_EMAILS` array in `js/auth.js` to include your admin email addresses

## License

This project is created for educational purposes.