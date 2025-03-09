// Data storage utility functions

// Initialize storage if it doesn't exist
function initializeStorage() {
    // Check and initialize videos
    if (!localStorage.getItem('videos')) {
        localStorage.setItem('videos', JSON.stringify({}));
    }
    
    // Check and initialize video access
    if (!localStorage.getItem('videoAccess')) {
        localStorage.setItem('videoAccess', JSON.stringify({}));
    }
    
    // Check and initialize all users
    if (!localStorage.getItem('allUsers')) {
        localStorage.setItem('allUsers', JSON.stringify({}));
    }
}

// Get all videos
function getAllVideos() {
    return JSON.parse(localStorage.getItem('videos') || '{}');
}

// Get a specific video by ID
function getVideo(videoId) {
    const videos = getAllVideos();
    return videos[videoId] || null;
}

// Add or update a video
function saveVideo(videoData) {
    if (!videoData.id) {
        videoData.id = 'video_' + new Date().getTime();
    }
    
    const videos = getAllVideos();
    videos[videoData.id] = {
        ...videoData,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('videos', JSON.stringify(videos));
    
    // Initialize empty access list if needed
    const videoAccess = JSON.parse(localStorage.getItem('videoAccess') || '{}');
    if (!videoAccess[videoData.id]) {
        videoAccess[videoData.id] = [];
        localStorage.setItem('videoAccess', JSON.stringify(videoAccess));
    }
    
    return videoData.id;
}

// Delete a video
function deleteVideo(videoId) {
    const videos = getAllVideos();
    if (videos[videoId]) {
        delete videos[videoId];
        localStorage.setItem('videos', JSON.stringify(videos));
        
        // Also remove access list
        const videoAccess = JSON.parse(localStorage.getItem('videoAccess') || '{}');
        if (videoAccess[videoId]) {
            delete videoAccess[videoId];
            localStorage.setItem('videoAccess', JSON.stringify(videoAccess));
        }
        
        return true;
    }
    return false;
}

// Get access list for a video
function getVideoAccessList(videoId) {
    const videoAccess = JSON.parse(localStorage.getItem('videoAccess') || '{}');
    return videoAccess[videoId] || [];
}

// Grant access to a video
function grantVideoAccess(videoId, email) {
    const videoAccess = JSON.parse(localStorage.getItem('videoAccess') || '{}');
    
    if (!videoAccess[videoId]) {
        videoAccess[videoId] = [];
    }
    
    // Only add email if it's not already in the list
    if (!videoAccess[videoId].includes(email)) {
        videoAccess[videoId].push(email);
        localStorage.setItem('videoAccess', JSON.stringify(videoAccess));
        return true;
    }
    
    return false;
}

// Revoke access to a video
function revokeVideoAccess(videoId, email) {
    const videoAccess = JSON.parse(localStorage.getItem('videoAccess') || '{}');
    
    if (videoAccess[videoId] && videoAccess[videoId].includes(email)) {
        videoAccess[videoId] = videoAccess[videoId].filter(e => e !== email);
        localStorage.setItem('videoAccess', JSON.stringify(videoAccess));
        return true;
    }
    
    return false;
}

// Get videos accessible by a user
function getUserAccessibleVideos(email) {
    const videos = getAllVideos();
    const videoAccess = JSON.parse(localStorage.getItem('videoAccess') || '{}');
    const accessibleVideos = {};
    
    // Check each video's access list
    Object.keys(videoAccess).forEach(videoId => {
        if (videoAccess[videoId].includes(email) && videos[videoId]) {
            accessibleVideos[videoId] = videos[videoId];
        }
    });
    
    return accessibleVideos;
}

// Get all users
function getAllUsers() {
    return JSON.parse(localStorage.getItem('allUsers') || '{}');
}

// Initialize storage when script loads
initializeStorage();