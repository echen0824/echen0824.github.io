// Dashboard initialization
function initializeDashboard() {
    // Check if user is logged in
    const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUserData) {
        document.getElementById('dashboard-content').style.display = 'none';
        document.getElementById('auth-required-message').style.display = 'block';
        return;
    }
    
    // Show user's dashboard
    document.getElementById('dashboard-content').style.display = 'block';
    document.getElementById('auth-required-message').style.display = 'none';
    
    // Display user information
    document.getElementById('display-name').textContent = currentUserData.name || 'Unknown';
    document.getElementById('user-email-display').textContent = currentUserData.email || 'No email';
    
    // Get user data from localStorage
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    const userData = allUsers[currentUserData.email] || {};
    
    if (userData.lastLogin) {
        const lastLogin = new Date(userData.lastLogin);
        document.getElementById('last-login').textContent = lastLogin.toLocaleString();
    } else {
        document.getElementById('last-login').textContent = 'First login';
    }
    
    // Load user's accessible videos
    loadUserVideos(currentUserData.email);
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Get YouTube thumbnail URL from video ID
function getYouTubeThumbnail(videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Load videos accessible by the user
function loadUserVideos(userEmail) {
    const videosGrid = document.getElementById('user-videos');
    videosGrid.innerHTML = '<p>Loading your videos...</p>';
    
    // Get accessible videos for the user
    const accessibleVideos = getUserAccessibleVideos(userEmail);
    
    if (Object.keys(accessibleVideos).length === 0) {
        videosGrid.innerHTML = '<p>You do not have access to any videos yet.</p>';
        return;
    }
    
    // Clear the grid
    videosGrid.innerHTML = '';
    
    // Add each accessible video
    Object.entries(accessibleVideos).forEach(([videoId, video]) => {
        // Create video card
        const videoCard = document.createElement('div');
        videoCard.className = 'course-card'; // Reuse course card styling
        videoCard.innerHTML = `
            <div class="course-thumbnail">
                <img src="${video.thumbnail || getYouTubeThumbnail(video.youtubeId)}" alt="${video.title}">
            </div>
            <div class="course-info">
                <h3>${video.title}</h3>
                <p>${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</p>
                <div class="video-category">${video.category || 'Uncategorized'}</div>
                <button class="btn view-video-btn" data-video-id="${videoId}">Watch Video</button>
            </div>
        `;
        
        videosGrid.appendChild(videoCard);
        
        // Add event listener to the button
        const viewButton = videoCard.querySelector('.view-video-btn');
        viewButton.addEventListener('click', () => {
            window.location.href = `video-view.html?id=${videoId}`;
        });
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check login status
    const isLoggedIn = checkLoginStatus();
    
    if (isLoggedIn) {
        initializeDashboard();
    } else {
        document.getElementById('dashboard-content').style.display = 'none';
        document.getElementById('auth-required-message').style.display = 'block';
    }
});