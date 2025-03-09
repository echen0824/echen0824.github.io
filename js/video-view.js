// YouTube player instance
let player;

// Current video data
let currentVideo = null;

// Get the video ID from the URL
function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load video data and check access
function loadVideoData() {
    const videoId = getVideoId();
    
    if (!videoId) {
        // No video ID provided
        window.location.href = 'courses.html';
        return;
    }
    
    // Check if user is logged in
    const isLoggedIn = checkLoginStatus();
    
    if (!isLoggedIn) {
        // Show auth required message
        document.getElementById('auth-required-message').style.display = 'block';
        document.getElementById('access-denied-message').style.display = 'none';
        document.getElementById('video-content').style.display = 'none';
        return;
    }
    
    // Check if user has access to this video
    if (!hasAccessToVideo(videoId)) {
        // Show access denied message
        document.getElementById('auth-required-message').style.display = 'none';
        document.getElementById('access-denied-message').style.display = 'block';
        document.getElementById('video-content').style.display = 'none';
        return;
    }
    
    // Get video data
    const video = getVideo(videoId);
    
    if (!video) {
        // Video not found
        window.location.href = 'courses.html';
        return;
    }
    
    // Store current video
    currentVideo = video;
    
    // Show video content
    document.getElementById('auth-required-message').style.display = 'none';
    document.getElementById('access-denied-message').style.display = 'none';
    document.getElementById('video-content').style.display = 'block';
    
    // Set video info
    document.getElementById('video-title').textContent = video.title;
    document.getElementById('video-description').textContent = video.description;
    
    if (video.category) {
        document.getElementById('video-category').textContent = video.category;
        document.getElementById('video-category').style.display = 'inline-block';
    } else {
        document.getElementById('video-category').style.display = 'none';
    }
    
    // Update page title
    document.title = `${video.title} - Online Course Platform`;
    
    // Load YouTube player if it's ready
    if (player && player.loadVideoById) {
        player.loadVideoById(video.youtubeId);
    }
}

// Initialize YouTube player
function onYouTubeIframeAPIReady() {
    const videoId = getVideoId();
    const video = getVideo(videoId);
    
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: video ? video.youtubeId : '',
        playerVars: {
            'playsinline': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

// YouTube player ready event
function onPlayerReady(event) {
    // Check if currentVideo is already loaded
    if (currentVideo) {
        player.loadVideoById(currentVideo.youtubeId);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadVideoData();
});