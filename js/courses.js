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

// Load all videos for display
function loadAllVideos() {
    // Show loading state
    const videosGrid = document.getElementById('videos-grid');
    videosGrid.innerHTML = '<p>Loading videos...</p>';
    
    // Get all videos from storage
    const videos = getAllVideos();
    
    if (Object.keys(videos).length === 0) {
        videosGrid.innerHTML = '<p>No videos available at this time.</p>';
        return;
    }
    
    // Get current user email
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userEmail = currentUserData.email;
    
    // Clear the grid
    videosGrid.innerHTML = '';
    
    // Add each video that the user has access to
    let videoCategories = new Set();
    let videoCount = 0;
    
    Object.entries(videos).forEach(([videoId, video]) => {
        // Check if the user has access to this video
        if (hasAccessToVideo(videoId)) {
            videoCount++;
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
                watchVideo(videoId);
            });
            
            // Add category to the set
            if (video.category) {
                videoCategories.add(video.category);
            }
        }
    });
    
    // If no videos are accessible to the user
    if (videoCount === 0) {
        videosGrid.innerHTML = '<p>You do not have access to any videos yet.</p>';
    }
    
    // Update category filter
    updateCategoryFilter(Array.from(videoCategories));
    
    // Show the videos container
    document.getElementById('videos-container').style.display = 'block';
}

// Update category filter dropdown
function updateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('category-filter');
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add categories to filter
    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Add event listener to filter
    categoryFilter.addEventListener('change', filterVideosByCategory);
}

// Filter videos by selected category
function filterVideosByCategory() {
    const selectedCategory = document.getElementById('category-filter').value;
    const videoCards = document.querySelectorAll('#videos-grid .course-card');
    
    videoCards.forEach(card => {
        const cardCategory = card.querySelector('.video-category').textContent;
        
        if (selectedCategory === '' || cardCategory === selectedCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load videos accessible by the user
function loadAccessibleVideos() {
    // Get current user
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userEmail = currentUserData.email;
    
    if (!userEmail) {
        // Not logged in
        return;
    }
    
    // Load all videos for the user
    loadAllVideos();
}

// Watch a video (open in a new page)
function watchVideo(videoId) {
    // Check if user has access
    if (!hasAccessToVideo(videoId)) {
        alert("You do not have access to this video.");
        return;
    }
    
    // Get video data
    const video = getVideo(videoId);
    
    if (!video) {
        alert("Video not found!");
        return;
    }
    
    // Open video page
    window.location.href = `video-view.html?id=${videoId}`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check login status
    const isLoggedIn = checkLoginStatus();
    
    if (isLoggedIn) {
        // Show videos grid
        document.getElementById('videos-container').style.display = 'block';
        document.getElementById('auth-required-message').style.display = 'none';
        
        // Load videos for user
        loadAccessibleVideos();
    } else {
        // Show auth required message
        document.getElementById('videos-container').style.display = 'none';
        document.getElementById('auth-required-message').style.display = 'block';
    }
});